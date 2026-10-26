#!/usr/bin/env python3
"""Derive a small, attributable locality selection from the INE 2025 ZIP.

No runtime dependencies. Download the public file with:
  curl -L --fail -d 'anioNacional=2025' https://www.ine.es/nomen2/Descarga -o /tmp/ine-2025.zip
Then run from any directory:
  python scripts/import-localities.py /tmp/ine-2025.zip

This intentionally does not infer postal codes, neighbourhood boundaries, local
offices, technical faults, or service demand from a locality's name/population.
"""

import argparse
from collections import Counter, defaultdict
import hashlib
import json
from pathlib import Path
import re
import unicodedata
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE_SHA256 = "960f268774cfb0c61d6b587d7822c0a943b004f6f01c130300b9be296b31c979"
SOURCE_ID = "ine-nomenclator-2025"
REFERENCE_DATE = "2025-01-01"
RETRIEVED_AT = "2026-10-26"
PARTICLES = {"de", "del", "la", "las", "los", "el", "y", "a", "o", "as", "os", "da", "do", "das", "dos", "dels", "d'", "les"}
ARTICLE = re.compile(r"\s*\((EL|LA|LOS|LAS|LES|A|O|AS|OS|L')\)$")


def display_name(source_name):
    """Preserve accents/words; move INE trailing articles to reading order."""
    parts = []
    for part in source_name.strip().split("/"):
        match = ARTICLE.search(part)
        if match:
            article = match.group(1)
            body = part[:match.start()].strip()
            part = article + ("" if article.endswith("'") else " ") + body
        words = part.title().split()
        words = [word.lower() if i and word.lower() in PARTICLES else word for i, word in enumerate(words)]
        # Uppercase Roman numerals used in some urbanisation names.
        words = [word.upper() if re.fullmatch(r"[IVXLC]+", word, re.I) else word for word in words]
        parts.append(" ".join(words))
    return "/".join(parts)


def normalize(name):
    plain = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii").lower()
    return re.sub(r"[^a-z0-9]", "", plain)


def aliases(name):
    shown = display_name(name.upper())
    return {normalize(shown), *(normalize(part) for part in shown.split("/"))}


def districts(names, source_id):
    return [{"code": f"{i:02d}", "name": name, "type": "district", "sourceId": source_id}
            for i, name in enumerate(names, start=1)]


def build(zip_path, output):
    raw_zip = zip_path.read_bytes()
    digest = hashlib.sha256(raw_zip).hexdigest()
    if digest != SOURCE_SHA256:
        raise ValueError("Source ZIP checksum differs. Review the new source and update provenance before importing.")
    with zipfile.ZipFile(zip_path) as archive:
        raw_text = archive.read("Nomdef2025_sex.txt").decode("utf-8")
    lines = raw_text.splitlines()
    if any(len(line) != 104 for line in lines):
        raise ValueError("Unexpected INE record length; expected 104 Unicode characters.")
    towns = json.loads((ROOT / "data/municipalities.json").read_text())
    town_by_code = {town["code"]: town for town in towns}
    matched_towns, seen_codes = set(), set()
    nuclei = defaultdict(list)
    for line in lines:
        code = line[:11]
        if not re.fullmatch(r"\d{11}", code) or code in seen_codes:
            raise ValueError(f"Invalid or duplicate INE unit code: {code!r}")
        seen_codes.add(code)
        municipality_code = code[:5]
        if municipality_code not in town_by_code:
            continue
        if code[5:] == "000000":
            matched_towns.add(municipality_code)
        # Exclude municipality, collective/singular entity totals and diseminados.
        if code[9:11] in ("00", "99"):
            continue
        name = line[11:83].strip()
        population = int(line[83:90])
        nuclei[municipality_code].append({"code": code, "name": display_name(name),
                                          "sourceName": name, "population": population})
    if matched_towns != set(town_by_code):
        raise ValueError(f"Municipality mismatch: {sorted(set(town_by_code) - matched_towns)}")

    municipalities = {}
    counts = Counter()
    for town in towns:
        code = town["code"]
        municipality_aliases = aliases(town["name"])
        for alias in town["aliases"]:
            municipality_aliases.update(aliases(alias))
        candidates, used_names = [], set()
        # Population is only a documented editorial ordering criterion.
        # It is not saved in the published dataset and is not a demand proxy.
        for item in sorted(nuclei[code], key=lambda x: (-x["population"], x["code"])):
            normalized = normalize(item["name"])
            if item["population"] <= 0 or aliases(item["name"]) & municipality_aliases or normalized in used_names:
                continue
            used_names.add(normalized)
            candidates.append({key: item[key] for key in ("code", "name", "sourceName")})
        selected = [{**item, "type": "nucleus", "sourceId": SOURCE_ID} for item in candidates[:8]]
        municipalities[code] = {"nucleusCount": len(nuclei[code]),
                                "additionalNucleusCount": len(candidates),
                                "selectedNuclei": selected, "districts": []}
        if selected:
            counts[town["provinceCode"]] += 1

    municipalities["28079"]["districts"] = districts([
        "Centro", "Arganzuela", "Retiro", "Salamanca", "Chamartín", "Tetuán", "Chamberí",
        "Fuencarral-El Pardo", "Moncloa-Aravaca", "Latina", "Carabanchel", "Usera",
        "Puente de Vallecas", "Moratalaz", "Ciudad Lineal", "Hortaleza", "Villaverde",
        "Villa de Vallecas", "Vicálvaro", "San Blas-Canillejas", "Barajas"
    ], "madrid-districts")
    municipalities["48020"]["districts"] = districts([
        "Deusto", "Uribarri", "Otxarkoaga/Txurdínaga", "Begoña", "Ibaiondo", "Abando",
        "Rekalde", "Basurto/Zorroza"
    ], "bilbao-districts")

    source = {
        "id": SOURCE_ID,
        "title": "Nomenclátor: Población por unidad poblacional, 1 de enero de 2025",
        "publisher": "Instituto Nacional de Estadística (INE)",
        "url": "https://www.ine.es/dyngs/INEbase/operacion.htm?c=Estadistica_C&cid=1254736177010&idp=1254735572981",
        "downloadUrl": "https://www.ine.es/nomen2/Descarga",
        "downloadMethod": "POST",
        "downloadBody": "anioNacional=2025",
        "archiveMember": "Nomdef2025_sex.txt",
        "referenceDate": REFERENCE_DATE,
        "publishedAt": "2026-01-28",
        "retrievedAt": RETRIEVED_AT,
        "sha256": digest,
        "methodologyUrl": "https://www.ine.es/nomenclator/metodologia.htm",
        "recordDesignUrl": "https://www.ine.es/nomen_files/DisenioRegistro.xls",
        "licenseUrl": "https://www.ine.es/aviso_legal",
        "attribution": "Fuente: INE. Nomenclátor 2025. Selección y presentación elaboradas a partir de los datos originales.",
        "selection": "Hasta ocho núcleos habitados adicionales al nombre municipal, por población de 2025 descendente y código ascendente en empates. Se excluyen nombres homónimos o equivalentes a los alias municipales y se deduplican nombres dentro del municipio.",
        "displayTransformations": "Mayúsculas/minúsculas de lectura; partículas interiores en minúscula; artículos finales entre paréntesis pasan al principio. Acentos, palabras y denominaciones bilingües conservados; sourceName preserva la forma original.",
        "limitations": "Selección de núcleos de población, no inventario de barrios, distritos, códigos postales, límites, oficinas ni intervenciones realizadas. Las poblaciones solo se usan para ordenar la selección y no se publican aquí."
    }
    district_sources = {
        "madrid": {
            "id": "madrid-districts", "publisher": "Ayuntamiento de Madrid",
            "title": "Distritos de Madrid y catálogo municipal de distritos",
            "url": "https://www.madrid.es/portales/munimadrid/es/Inicio/Distritos/?vgnextchannel=f9792593e5d48810VgnVCM1000008a4a900aRCRD",
            "codeSourceUrl": "https://datos.madrid.es/dataset/213583-0-cartografia-distritos-1-5000",
            "retrievedAt": RETRIEVED_AT, "license": "Datos del catálogo municipal: CC BY 4.0",
            "note": "Los códigos 01–21 son identificadores municipales de distrito; no son códigos INE de núcleo ni códigos postales."
        },
        "bilbao": {
            "id": "bilbao-districts", "publisher": "Ayuntamiento de Bilbao",
            "title": "El Gobierno Municipal: Distritos",
            "url": "https://www.bilbao.eus/cs/Satellite?cid=3000017134&language=es&pagename=Bilbaonet%2FPage%2FBIO_contenidoFinal",
            "corroboratingUrl": "https://www.bilbao.eus/cs/Satellite?c=Page&cid=3000005557&language=es&pageid=3000005557&pagename=Bilbaonet%2FPage%2FBIO_detallePagina",
            "retrievedAt": RETRIEVED_AT,
            "note": "Nombres y numeración de la relación municipal. Los códigos 01–08 identifican distritos; no son códigos INE de núcleo ni códigos postales."
        }
    }
    stats = {
        "municipalities": len(towns), "matchedMunicipalities": len(matched_towns),
        "nationalSourceRecords": len(lines),
        "sourceNucleiInScope": sum(len(items) for items in nuclei.values()),
        "municipalitiesWithSelectedNuclei": sum(bool(item["selectedNuclei"]) for item in municipalities.values()),
        "selectedNuclei": sum(len(item["selectedNuclei"]) for item in municipalities.values()),
        "municipalitiesWithDistricts": 2,
        "districts": sum(len(item["districts"]) for item in municipalities.values()),
        "municipalitiesWithLocalReferences": sum(bool(item["selectedNuclei"] or item["districts"]) for item in municipalities.values()),
        "maximumSelectedNucleiPerMunicipality": 8,
        "municipalitiesWithoutNucleusInSource": [town["code"] for town in towns if not nuclei[town["code"]]],
        "selectedNucleiCoverageByProvince": [
            {"provinceCode": code, "province": next(t["province"] for t in towns if t["provinceCode"] == code),
             "municipalitiesWithSelectedNuclei": count} for code, count in sorted(counts.items())
        ]
    }
    document = {"source": source, "districtSources": district_sources, "stats": stats,
                "municipalities": municipalities}
    # One municipality per line makes the large generated data diff reviewable.
    metadata = json.dumps({key: document[key] for key in ("source", "districtSources", "stats")},
                          ensure_ascii=False, indent=2)
    rows = [f'    "{code}": ' + json.dumps(item, ensure_ascii=False, separators=(", ", ": "))
            for code, item in municipalities.items()]
    text = metadata[:-2] + ',\n  "municipalities": {\n' + ",\n".join(rows) + "\n  }\n}\n"
    output.write_text(text, encoding="utf-8")
    # Parse written content too: catches any custom-formatting errors.
    assert json.loads(output.read_text()) == document
    print(json.dumps(stats, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source_zip", type=Path)
    parser.add_argument("--output", type=Path, default=ROOT / "data/localities.json")
    args = parser.parse_args()
    build(args.source_zip, args.output)
