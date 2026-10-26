#!/usr/bin/env python3
"""Import a conservative street selection from the official INE street register.

Only VIAS and TRAM are read. UP, PSEU, SECC and the population-name fields
inside TRAM are deliberately not imported. No dependency outside stdlib.

Examples:
  python scripts/import-streets.py
  python scripts/import-streets.py --input /tmp/porteros-callejero-202607/caj_esp_072026.zip
  python scripts/import-streets.py --refresh --report /tmp/street-import-report.json

The edition is pinned: a new publication requires reviewing its date, schema
and type dictionary before changing the constants below.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import re
import sys
import tempfile
import unicodedata
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path, PurePosixPath


ROOT = Path(__file__).resolve().parents[1]
SOURCE_ID = "ine-callejero-2026-07"
SOURCE_URL = "https://www.ine.es/dyngs/DAB/es/index.htm?cid=1390"
DOWNLOAD_URL = "https://www.ine.es/prodyser/callejero/caj_esp/caj_esp_072026.zip"
SCHEMA_URL = "https://www.ine.es/prodyser/callejero/Dis_nuevo.xlsx"
TYPES_URL = "https://www.ine.es/prodyser/callejero/TiposVia.csv"
REFERENCE_DATE = "2026-06-30"
EDITION = "Julio de 2026"
ENCODING = "iso-8859-1"
MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PACKAGE_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
FAMILIES = {"CALLE": "Calle", "AVDA": "Avenida", "PLAZA": "Plaza", "PASEO": "Paseo"}
PARTICLES = {"a", "al", "de", "del", "el", "els", "en", "i", "la", "las", "les", "los", "y", "da", "das", "do", "dos", "dels"}
ROMAN = re.compile(r"M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})")
EXCLUDED_NAME = re.compile(
    r"\b(?:POLIG\w*|INDUSTR\w*|LOGISTIC\w*|AEROPUER\w*|AERODROM\w*|"
    r"CAMPING\w*|CAMPO\s+DE\s+GOLF|SIN\s+NOMBRE|SIN\s+DENOMINACION|"
    r"SIN\s+IDENTIFICAR|DISEMINAD\w*|DISEMIN\w*|PARCELA\w*|SECTOR\w*|"
    r"MANZANA\w*|UNIDAD\s+DE\s+EJECUCION|AREA\s+EMPRESARIAL|"
    r"AUTOPISTA\w*|AUTOVIA\w*)\b"
)
TECHNICAL_NAME = re.compile(r"(?:[A-Z]{0,4}\s*[-./]\s*\d+[A-Z]?|\d+[A-Z]?|[A-Z])")
CIVIC_NAMES = {"MAYOR": 4, "REAL": 3, "IGLESIA": 3, "AYUNTAMIENTO": 2, "CONSTITUCION": 2}
# Only these exact Spanish particles may be moved from the end of a name.
# Parenthesized municipality/sublocality qualifiers and abbreviations stay put.
TAIL_PARTICLES = ("DE LOS", "DE LAS", "DE LA", "DE EL", "DEL", "LOS", "LAS", "DE", "EL", "LA")
ROMAN_NAME_PREDECESSORS = {"carlos", "felipe", "isabel", "juan", "fernando", "alfonso", "pio", "pío", "enrique", "jaime", "leon", "león", "luis", "pedro", "ramiro", "sancho"}


def fold(value: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFKD", value.upper()) if not unicodedata.combining(c))


def file_hash(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def cached_download(url: str, path: Path, refresh: bool = False) -> Path:
    if path.is_file() and not refresh:
        return path
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".part")
    request = urllib.request.Request(url, headers={"User-Agent": "Porteros street-source importer/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=60) as response, temporary.open("wb") as output:
            while chunk := response.read(1024 * 1024):
                output.write(chunk)
        if not temporary.stat().st_size:
            raise ValueError(f"Empty source: {url}")
        temporary.replace(path)
    finally:
        if temporary.exists():
            temporary.unlink()
    return path


def layouts_from_xlsx(path: Path) -> dict[str, dict[str, tuple[int, int]]]:
    """Read positions from the source's VIAS and TRAM sheets only.

    Repeated field names occur in key/current-value blocks. The last position
    is the current value specified by the published record design.
    """
    result = {}
    with zipfile.ZipFile(path) as workbook:
        shared = []
        if "xl/sharedStrings.xml" in workbook.namelist():
            root = ET.fromstring(workbook.read("xl/sharedStrings.xml"))
            shared = ["".join(node.itertext()) for node in root.findall(f"{{{MAIN_NS}}}si")]
        relationships = ET.fromstring(workbook.read("xl/_rels/workbook.xml.rels"))
        targets = {r.attrib["Id"]: r.attrib["Target"] for r in relationships.findall(f"{{{PACKAGE_REL_NS}}}Relationship")}
        book = ET.fromstring(workbook.read("xl/workbook.xml"))
        for sheet in book.findall(f"{{{MAIN_NS}}}sheets/{{{MAIN_NS}}}sheet"):
            name = sheet.attrib["name"]
            if name not in {"VIAS", "TRAM"}:
                continue
            target = targets[sheet.attrib[f"{{{REL_NS}}}id"]]
            filename = target.lstrip("/") if target.startswith("/") else "xl/" + target
            xml = ET.fromstring(workbook.read(filename))
            fields = {}
            for row in xml.findall(f".//{{{MAIN_NS}}}row"):
                values = {}
                for cell in row.findall(f"{{{MAIN_NS}}}c"):
                    column = re.match(r"[A-Z]+", cell.attrib["r"]).group()
                    value_node = cell.find(f"{{{MAIN_NS}}}v")
                    value = value_node.text if value_node is not None else "".join(cell.itertext())
                    if cell.attrib.get("t") == "s" and value:
                        value = shared[int(value)]
                    values[column] = value
                if values.get("A") and str(values.get("D", "")).isdigit() and str(values.get("E", "")).isdigit():
                    fields[values["A"]] = (int(values["D"]) - 1, int(values["E"]))
            result[name] = fields
    required = {"VIAS": {"CPRO", "CMUN", "CVIA", "TVIA", "NVIA"}, "TRAM": {"CPRO", "CMUN", "CVIA", "CPOS", "EIN", "ESN"}}
    for name, fields in required.items():
        if not fields.issubset(result.get(name, {})):
            raise ValueError(f"Unsupported {name} record schema")
        if result[name]["CPRO"] != (0, 2) or result[name]["CMUN"] != (2, 5):
            raise ValueError("Municipal key positions changed; review this edition")
    return result


def type_families(path: Path) -> dict[str, str]:
    rows = list(csv.DictReader(io.StringIO(path.read_bytes().decode(ENCODING)), delimiter=";"))
    result = {}
    # Only synonyms explicitly listed for the four canonical types are accepted.
    for row in rows:
        canonical = row["TIPO_VIA"].strip()
        synonym = row["SINONIMO"].strip()
        if canonical in FAMILIES:
            previous = result.setdefault(synonym, canonical)
            if previous != canonical:
                raise ValueError(f"Ambiguous type synonym: {synonym}")
    if not set(FAMILIES).issubset(result):
        raise ValueError("The official type dictionary is incomplete")
    return result


def field(record: str, schema: dict, key: str) -> str:
    start, end = schema[key]
    return record[start:end].strip()


def excluded_name_reason(name: str) -> str | None:
    normalized = fold(name)
    if len(name) < 2 or any(unicodedata.category(c) == "Cc" for c in name):
        return "empty-or-control-name"
    if EXCLUDED_NAME.search(normalized):
        return "industrial-or-non-street-reference"
    if TECHNICAL_NAME.fullmatch(normalized) or ROMAN.fullmatch(normalized):
        return "technical-code-name"
    if not re.search(r"[A-Z]{2,}", normalized):
        return "technical-code-name"
    return None


def split_tail_particle(name: str) -> tuple[str, str]:
    """Recognize literal sorting particles without reconstructing proper names.

    A final parenthesized particle or comma-delimited particle is explicit.
    Without that delimiter only a one-word stem is reordered: GALICIA DE is
    clear, but OTERO BLAS DE may represent a person's sorted name and is kept.
    """
    name = " ".join(name.split())
    parenthesized = re.fullmatch(r"(.+?)\s*\(([^()]*)\)", name)
    if parenthesized and parenthesized.group(2) in TAIL_PARTICLES:
        return parenthesized.group(1).rstrip(), parenthesized.group(2)
    for particle in TAIL_PARTICLES:
        suffix = " " + particle
        if not name.endswith(suffix):
            continue
        stem = name[:-len(suffix)].rstrip()
        if stem.endswith(","):
            return stem[:-1].rstrip(), particle
        if re.fullmatch(r"[^\s(),/]+", stem):
            return stem, particle
    return name, ""


def presentation_name(name: str, family: str) -> str:
    # Normalize casing, spaces and unambiguous literal sorting particles.
    # Never add accents, translate/reconstruct proper names or merge codes.
    stem, particle = split_tail_particle(name)
    display = particle + " " + stem if particle else stem
    words = []
    for word in display.split():
        letters = word.strip(".,;:()[]")
        if letters and ROMAN.fullmatch(letters) and letters not in {"I"}:
            words.append(word)
        elif letters == "I" and words and words[-1].casefold() in ROMAN_NAME_PREDECESSORS:
            words.append(word)
        elif word.lower() in PARTICLES:
            words.append(word.lower())
        else:
            titled = word.title()
            roman_prefix = re.match(r"^([IVXLCDM]+)(?=[.-])", word)
            if roman_prefix and ROMAN.fullmatch(roman_prefix.group(1)):
                titled = roman_prefix.group(1) + titled[len(roman_prefix.group(1)):]
            words.append(titled)
    return FAMILIES[family] + " " + " ".join(words)


def civic_priority(name: str) -> int:
    # Match a whole denomination, not a coincidental word in SOTO MAYOR,
    # REAL OVIEDO or CIUDAD REAL. Bilingual names may have a full match in
    # one slash-separated language variant (MAYOR / KALE NAGUSIA).
    priorities = []
    for variant in name.split("/"):
        stem, _ = split_tail_particle(variant.strip())
        normalized = fold(stem)
        for particle in TAIL_PARTICLES:
            if normalized.startswith(particle + " "):
                normalized = normalized[len(particle) + 1:]
                break
        priorities.append(CIVIC_NAMES.get(normalized, 0))
    return max(priorities, default=0)


def ranking(street: dict) -> tuple:
    familiar = civic_priority(street["sourceName"])
    return (-bool(street["segmentCount"]), -familiar, -street["segmentCount"], -street["hasNumber"], -street["maxNumber"], fold(street["sourceName"]), street["code"])


def import_data(archive: Path, layouts: dict, types: dict, towns: dict) -> tuple[dict, dict]:
    candidates = defaultdict(dict)
    raw_types = defaultdict(Counter)
    source_rows = Counter()
    excluded = Counter()
    filtered_examples = defaultdict(list)
    with zipfile.ZipFile(archive) as source:
        names = {}
        for category in ("VIAS", "TRAM"):
            matches = [n for n in source.namelist() if PurePosixPath(n).name.startswith(category + ".")]
            if len(matches) != 1:
                raise ValueError(f"Expected exactly one {category} file; got {matches}")
            names[category] = matches[0]
        with source.open(names["VIAS"]) as rows:
            schema = layouts["VIAS"]
            expected = max(end for _, end in schema.values())
            for raw in rows:
                source_rows["VIAS"] += 1
                code = raw[:5].decode("ascii")
                if code not in towns:
                    continue
                row = raw.rstrip(b"\r\n").decode(ENCODING)
                if len(row) != expected:
                    raise ValueError(f"Wrong VIAS record length in {code}")
                street_code = field(row, schema, "CVIA")
                street_type = field(row, schema, "TVIA")
                street_name = field(row, schema, "NVIA")
                raw_types[code][street_type] += 1
                if street_type not in types:
                    excluded["unsupported-type"] += 1
                    continue
                reason = excluded_name_reason(street_name)
                if not re.fullmatch(r"\d{5}", street_code) or street_code == "00000":
                    reason = "invalid-street-code"
                if reason:
                    excluded[reason] += 1
                    if len(filtered_examples[code]) < 5:
                        filtered_examples[code].append({"code": street_code, "type": street_type, "name": street_name, "reason": reason})
                    continue
                entry = {"code": street_code, "sourceName": street_name, "sourceType": street_type, "family": types[street_type], "postalCodes": set(), "segmentCount": 0, "hasNumber": False, "maxNumber": 0}
                previous = candidates[code].get(street_code)
                if previous and (previous["sourceType"], previous["sourceName"]) != (street_type, street_name):
                    raise ValueError(f"Conflicting street key: {code}/{street_code}")
                candidates[code][street_code] = entry
        print(f"VIAS: {sum(len(v) for v in candidates.values())} eligible street codes in {len(candidates)} municipalities", flush=True)
        with source.open(names["TRAM"]) as rows:
            schema = layouts["TRAM"]
            expected = max(end for _, end in schema.values())
            for raw in rows:
                source_rows["TRAM"] += 1
                code = raw[:5].decode("ascii")
                if code not in candidates:
                    continue
                row = raw.rstrip(b"\r\n").decode(ENCODING)
                if len(row) != expected:
                    raise ValueError(f"Wrong TRAM record length in {code}")
                street_code = field(row, schema, "CVIA")
                street = candidates[code].get(street_code)
                if street is None:
                    continue
                street["segmentCount"] += 1
                postal = field(row, schema, "CPOS")
                if re.fullmatch(r"\d{5}", postal) and postal not in {"00000", "99999"}:
                    street["postalCodes"].add(postal)
                numbers = [field(row, schema, key) for key in ("EIN", "ESN")]
                usable = [int(n) for n in numbers if n.isdigit() and 0 < int(n) < 9998]
                if usable:
                    street["hasNumber"] = True
                    street["maxNumber"] = max(street["maxNumber"], *usable)
    return candidates, {"sourceMembers": names, "sourceRecordCounts": dict(source_rows), "excludedRecordCounts": dict(excluded), "rawTypes": raw_types, "filteredExamples": filtered_examples}


def write_outputs(output: Path, towns: dict, candidates: dict, audit: dict, maximum: int, source: dict, types: dict) -> dict:
    provinces = defaultdict(dict)
    stats = {"municipalities": len(towns), "municipalitiesWithStreets": 0, "municipalitiesWithoutStreets": 0, "availableStreetCount": 0, "selectedStreetCount": 0, "selectedWithTramCount": 0, "selectedWithPostalCodesCount": 0, "byProvince": {}, "exceptions": []}
    for code, town in sorted(towns.items()):
        available = candidates.get(code, {})
        selected = []
        displayed = set()
        for street in sorted(available.values(), key=ranking):
            name = presentation_name(street["sourceName"], street["family"])
            identity = (street["family"], fold(street["sourceName"]))
            if identity in displayed:
                continue
            displayed.add(identity)
            selected.append({"code": street["code"], "name": name, "sourceName": street["sourceName"], "sourceType": street["sourceType"], "postalCodes": sorted(street["postalCodes"])})
            stats["selectedWithTramCount"] += bool(street["segmentCount"])
            stats["selectedWithPostalCodesCount"] += bool(street["postalCodes"])
            if len(selected) == maximum:
                break
        province = town["provinceSlug"]
        provinces[province][code] = {"name": town["name"], "availableStreetCount": len(available), "streets": selected}
        pstats = stats["byProvince"].setdefault(province, {"municipalities": 0, "withStreets": 0, "withoutStreets": 0, "selectedStreetCount": 0})
        pstats["municipalities"] += 1
        pstats["withStreets"] += bool(selected)
        pstats["withoutStreets"] += not bool(selected)
        pstats["selectedStreetCount"] += len(selected)
        stats["municipalitiesWithStreets"] += bool(selected)
        stats["municipalitiesWithoutStreets"] += not bool(selected)
        stats["availableStreetCount"] += len(available)
        stats["selectedStreetCount"] += len(selected)
        if not selected:
            raw = audit["rawTypes"].get(code, {})
            reason = "no-vias-records" if not raw else "no-eligible-types" if not any(t in types for t in raw) else "names-excluded-by-selection"
            stats["exceptions"].append({"code": code, "name": town["name"], "provinceSlug": province, "reason": reason, "sourceTypes": dict(sorted(raw.items()))})
    output.mkdir(parents=True, exist_ok=True)
    street_dir = output / "streets"
    street_dir.mkdir(exist_ok=True)
    files = {}
    for province, municipalities in sorted(provinces.items()):
        files[province] = f"streets/{province}.json"
        # One compact record per municipality makes source review practical.
        contents = '{"provinceSlug":' + json.dumps(province) + ',"municipalities":{\n'
        contents += ',\n'.join(json.dumps(code) + ':' + json.dumps(record, ensure_ascii=False, separators=(',', ':')) for code, record in municipalities.items())
        contents += '\n}}\n'
        (output / files[province]).write_text(contents, encoding="utf-8")
    index = {
        "schemaVersion": 1,
        "source": source,
        "selection": {
            "maxPerMunicipality": maximum,
            "label": "Calles, avenidas, plazas y paseos",
            "acceptedSourceTypes": {key: FAMILIES[value] for key, value in sorted(types.items())},
            "method": "Selección determinista por presencia en TRAM; coincidencia de la denominación completa con Mayor, Real, Iglesia, Ayuntamiento o Constitución, retirando solo partículas reconocidas y admitiendo variantes bilingües separadas por barra; número de tramos y numeración documentada; desempate por nombre y código. No es un ranking comercial ni una medición de centralidad, viviendas o demanda.",
            "municipalIdentity": "CPRO + CMUN; CVIA es una clave propia de ese municipio. Los registros se unen por código, nunca por parecido de nombres.",
            "namePresentation": "Se normalizan espacios y mayúsculas; los tipos equivalentes se presentan en español. Las partículas finales DE LOS, DE LAS, DE LA, DE EL, DEL, LOS, LAS, DE, EL y LA se anteponen solo si están entre paréntesis, separadas por coma o detrás de un nombre de una sola palabra. Se mantienen los demás paréntesis y los sufijos ambiguos de nombres compuestos. No se añaden tildes, se traducen ni reconstruyen nombres propios ni se fusionan códigos de vías distintos. sourceName y sourceType conservan la denominación original.",
            "duplicateLabels": "Se muestra una sola entrada por tipo equivalente y nombre; conserva el código y los datos de la vía elegida, sin mezclar los de otros códigos.",
            "excluded": "Tipos ajenos a las cuatro familias admitidas; nombres de polígonos, áreas industriales o logísticas, aeropuertos, campings y referencias técnicas. No se importan UP, PSEU ni SECC ni se convierten calles en barrios.",
            "postalCodes": "Códigos postales presentes en los registros TRAM de cada código de vía. Una vía puede tener varios; la selección no asigna un código postal único a toda la calle ni al municipio.",
            "scope": "Referencias de ubicación de un callejero oficial; no acreditan uso residencial, oficinas, trabajos realizados o disponibilidad inmediata del servicio.",
            "emptyMunicipalities": "Conservan un registro con streets vacío y un motivo en stats.exceptions; no se inventan vías para completar la cobertura."
        },
        "files": files,
        "stats": {**stats, "sourceRecordCounts": audit["sourceRecordCounts"], "excludedRecordCounts": audit["excludedRecordCounts"]}
    }
    (output / "streets.json").write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return index


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--input", type=Path, help="Use this cached official national ZIP")
    parser.add_argument("--cache-dir", type=Path, default=Path(tempfile.gettempdir()) / "porteros-callejero-202607")
    parser.add_argument("--schema", type=Path, help="Cached Dis_nuevo.xlsx")
    parser.add_argument("--types", type=Path, help="Cached TiposVia.csv")
    parser.add_argument("--municipalities", type=Path, default=ROOT / "data/municipalities.json")
    parser.add_argument("--output-dir", type=Path, default=ROOT / "data")
    parser.add_argument("--max-per-municipality", type=int, default=16, choices=range(1, 17))
    parser.add_argument("--retrieved-at", default=date.today().isoformat())
    parser.add_argument("--refresh", action="store_true", help="Download the pinned edition and supporting files again")
    parser.add_argument("--report", type=Path, help="Optional detailed diagnostic report outside the website")
    args = parser.parse_args()
    date.fromisoformat(args.retrieved_at)
    archive = args.input or args.cache_dir / PurePosixPath(DOWNLOAD_URL).name
    schema = args.schema or args.cache_dir / "Dis_nuevo.xlsx"
    dictionary = args.types or args.cache_dir / "TiposVia.csv"
    cached_download(DOWNLOAD_URL, archive, args.refresh)
    cached_download(SCHEMA_URL, schema, args.refresh)
    cached_download(TYPES_URL, dictionary, args.refresh)
    layouts = layouts_from_xlsx(schema)
    types = type_families(dictionary)
    records = json.loads(args.municipalities.read_text(encoding="utf-8"))
    towns = {town["code"]: town for town in records}
    if len(towns) != len(records) or any(not re.fullmatch(r"\d{5}", code) for code in towns):
        raise ValueError("Municipal codes must be unique five-character strings")
    candidates, audit = import_data(archive, layouts, types, towns)
    source = {
        "id": SOURCE_ID, "publisher": "Instituto Nacional de Estadística (INE), Oficina del Censo Electoral",
        "title": "Callejero del Censo Electoral: ficheros de vías y tramos de vía, julio de 2026",
        "url": SOURCE_URL, "downloadUrl": DOWNLOAD_URL, "schemaUrl": SCHEMA_URL, "typesUrl": TYPES_URL,
        "referenceDate": REFERENCE_DATE, "edition": EDITION, "retrievedAt": args.retrieved_at,
        "sha256": file_hash(archive), "schemaSha256": file_hash(schema), "typesSha256": file_hash(dictionary),
        "encoding": ENCODING, "membersRead": audit["sourceMembers"]
    }
    index = write_outputs(args.output_dir, towns, candidates, audit, args.max_per_municipality, source, types)
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        report = {"source": source, "stats": index["stats"], "filteredExamples": {code: values for code, values in audit["filteredExamples"].items() if code in {item["code"] for item in index["stats"]["exceptions"]}}}
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: value for key, value in index["stats"].items() if key not in {"exceptions", "byProvince"}}, ensure_ascii=False, indent=2))
    print(f"Written {len(index['files'])} province files and {args.output_dir / 'streets.json'}", flush=True)


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, zipfile.BadZipFile, ET.ParseError) as error:
        print(f"Street import failed: {error}", file=sys.stderr)
        raise SystemExit(1)
