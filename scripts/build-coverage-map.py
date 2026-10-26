#!/usr/bin/env python3
"""Generate the compact coverage SVG from the official IGN provincial GeoJSON.

Usage: python scripts/build-coverage-map.py /path/to/ign-provinces.geojson
No third-party Python modules are needed. The source is not downloaded by builds.
"""
import argparse
import hashlib
import html
import json
import math
from pathlib import Path
from urllib.parse import urlencode

ROOT = Path(__file__).resolve().parents[1]
COLORS = {"norte": "#a6bea7", "centro": "#df9e7c", "other": "#3a4540"}
WIDTH, HEIGHT = 600, 440
FILTER = ('<fes:Filter xmlns:fes="http://www.opengis.net/fes/2.0" '
          'xmlns:au="http://inspire.ec.europa.eu/schemas/au/4.0" '
          'xmlns:xlink="http://www.w3.org/1999/xlink">'
          '<fes:PropertyIsEqualTo><fes:ValueReference>au:nationalLevel/@xlink:href</fes:ValueReference>'
          '<fes:Literal>https://inspire.ec.europa.eu/codelist/AdministrativeHierarchyLevel/3rdOrder</fes:Literal>'
          '</fes:PropertyIsEqualTo></fes:Filter>')
SOURCE_URL = "https://www.ign.es/wfs-inspire/unidades-administrativas?" + urlencode({
    "service": "WFS", "version": "2.0.0", "request": "GetFeature", "typeNames": "au:AdministrativeUnit",
    "count": 90, "outputFormat": "application/geo+json", "srsName": "EPSG:4326", "filter": FILTER})


def projected(lon, lat):
    # Equirectangular with standard parallel 40 N, appropriate for a small locator.
    return lon * math.cos(math.radians(40)), -lat


def fit(points, box):
    xs, ys = zip(*points)
    lowx, highx, lowy, highy = min(xs), max(xs), min(ys), max(ys)
    x, y, width, height = box
    scale = min(width / (highx - lowx), height / (highy - lowy))
    ox = x + (width - (highx - lowx) * scale) / 2
    oy = y + (height - (highy - lowy) * scale) / 2
    return lambda point: (ox + (point[0] - lowx) * scale, oy + (point[1] - lowy) * scale)


def squared_segment_distance(point, a, b):
    x, y = a
    dx, dy = b[0] - x, b[1] - y
    if dx or dy:
        t = ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy)
        if t > 1:
            x, y = b
        elif t > 0:
            x += dx * t
            y += dy * t
    return (point[0] - x) ** 2 + (point[1] - y) ** 2


def simplify(points, tolerance):
    # Remove sub-pixel redundancy first, then Douglas–Peucker.
    filtered = [points[0]]
    radial = (tolerance * 0.2) ** 2
    for point in points[1:-1]:
        if (point[0] - filtered[-1][0]) ** 2 + (point[1] - filtered[-1][1]) ** 2 > radial:
            filtered.append(point)
    filtered.append(points[-1])
    if len(filtered) < 4:
        return filtered
    keep = {0, len(filtered) - 1}
    stack = [(0, len(filtered) - 1)]
    while stack:
        start, end = stack.pop()
        maximum, index = tolerance ** 2, None
        for i in range(start + 1, end):
            distance = squared_segment_distance(filtered[i], filtered[start], filtered[end])
            if distance > maximum:
                maximum, index = distance, i
        if index is not None:
            keep.add(index)
            stack.extend(((start, index), (index, end)))
    return [filtered[i] for i in sorted(keep)]


def area(points):
    return abs(sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(points, points[1:]))) / 2


def number(value):
    return f"{value:.1f}".rstrip("0").rstrip(".")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("--tolerance", type=float, default=1.10)
    args = parser.parse_args()
    raw = args.source.read_bytes()
    source = json.loads(raw)
    config = json.loads((ROOT / "data/site.json").read_text())
    municipalities = json.loads((ROOT / "data/municipalities.json").read_text())
    codes = {row["provinceSlug"]: row["provinceCode"] for row in municipalities}
    covered = {codes[slug]: {"slug": slug, "area": group["id"]}
               for group in config["contactAreas"] for slug in group["provinceSlugs"]}
    assert len(covered) == 19

    rows, mainland, canaries = [], [], []
    for feature in source["features"]:
        prop = feature["properties"]
        assert prop["nationalLevel"]["href"].endswith("/3rdOrder")
        code = prop["nationalCode"][4:6]
        name = prop["name"]["GeographicalName"]["spelling"]["SpellingOfName"]["text"]
        geometry = feature["geometry"]
        polygons = geometry["coordinates"] if geometry["type"] == "MultiPolygon" else [geometry["coordinates"]]
        rings = [[projected(*point[:2]) for point in ring] for polygon in polygons for ring in polygon]
        rows.append({"code": code, "name": name, "rings": rings, "nationalCode": prop["nationalCode"]})
        (canaries if code in {"35", "38"} else mainland).extend(point for ring in rings for point in ring)
    assert {row["code"] for row in rows} >= set(covered)
    assert len(rows) == 53
    fit_main = fit(mainland, (28, 14, 552, 394))
    fit_canaries = fit(canaries, (20, 358, 120, 48))
    rendered = []
    for row in rows:
        transform = fit_canaries if row["code"] in {"35", "38"} else fit_main
        rings = [simplify([transform(point) for point in ring], args.tolerance) for ring in row["rings"]]
        # Sub-pixel islets disappear at this display scale; keep the largest ring for tiny territories.
        significant = [ring for ring in rings if len(ring) >= 4 and area(ring) >= 0.2]
        if not significant:
            significant = [max(rings, key=area)]
        path = "".join("M" + " ".join(f"{number(x)},{number(y)}" for x, y in ring) + "Z" for ring in significant)
        row["path"] = path
        row["area"] = covered.get(row["code"], {}).get("area", "other")
        row["slug"] = covered.get(row["code"], {}).get("slug")
        rendered.append(row)

    order = {"other": 0, "norte": 1, "centro": 2}
    paths = []
    for row in sorted(rendered, key=lambda row: (order[row["area"]], row["code"])):
        paths.append(f'<path id="province-{row["code"]}" data-province-code="{row["code"]}" '
                     f'data-coverage="{row["area"]}" fill="{COLORS[row["area"]]}" d="{row["path"]}">'
                     f'<title>{html.escape(row["name"])}</title></path>')
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="440" viewBox="0 0 600 440" '
           'role="img" aria-labelledby="coverage-title coverage-desc">'
           '<title id="coverage-title">Provincias de servicio de Porteros y Videoporteros</title>'
           '<desc id="coverage-desc">Mapa de España con diecinueve provincias destacadas. '
           'Asturias, Cantabria, País Vasco, Navarra, La Rioja y Castilla y León en verde salvia. '
           'Madrid, Guadalajara y Toledo en cobre. Canarias se muestra en un recuadro desplazado.</desc>'
           '<metadata>Obra derivada de Unidades administrativas de España, IGN, descarga 2026-10-26. '
           'CC BY 4.0 ign.es. Simplificación, cambio de proyección, colores y desplazamiento de Canarias.</metadata>'
           '<rect x="10" y="338" width="140" height="81" rx="9" fill="none" stroke="#718175" stroke-opacity=".45" stroke-width=".8"/>'
           '<g stroke="#20332b" stroke-width=".9" stroke-linejoin="round" fill-rule="evenodd">' + "".join(paths) + '</g>'
           '<text x="21" y="350" fill="#9cab9f" font-family="Arial,sans-serif" font-size="8" letter-spacing="1.2">CANARIAS</text>'
           '</svg>')
    target = ROOT / "public/assets/coverage-spain.svg"
    target.write_text(svg)
    metadata = {
        "image": "/assets/coverage-spain.svg", "width": WIDTH, "height": HEIGHT,
        "alt": "Mapa de España con las 19 provincias de servicio destacadas: zona norte y Castilla y León en salvia; Madrid, Guadalajara y Toledo en cobre.",
        "source": {"publisher": "Instituto Geográfico Nacional de España (IGN)",
                   "title": "Unidades administrativas de España · nivel provincial",
                   "url": "https://www.ign.es/web/ign/portal/rcc-descarga-lineas-limite",
                   "serviceUrl": "https://www.ign.es/wfs-inspire/unidades-administrativas",
                   "downloadUrl": SOURCE_URL, "retrievedAt": "2026-10-26",
                   "sha256": hashlib.sha256(raw).hexdigest(),
                   "license": "CC BY 4.0", "licenseUrl": "https://www.ign.es/resources/licencia/Condiciones_licenciaUso_IGN.pdf",
                   "attribution": "Obra derivada de Unidades administrativas de España, descarga 26/10/2026, CC BY 4.0 ign.es"},
        "transformation": {"projection": "Equirectangular con paralelo estándar 40° N", "simplificationPixels": args.tolerance,
                           "canaryIslands": "Recuadro desplazado; escala independiente", "colors": COLORS,
                           "limitations": "Mapa de situación a pequeña escala. No representa oficinas, desplazamientos, tiempos de llegada ni disponibilidad en tiempo real."},
        "stats": {"administrativeUnitsInSource": len(rows), "highlightedProvinces": len(covered),
                  "northProvinces": sum(row["area"] == "norte" for row in rows),
                  "centralProvinces": sum(row["area"] == "centro" for row in rows), "svgBytes": target.stat().st_size},
        "provinces": [{"code": row["code"], "name": row["name"], "slug": row["slug"], "area": row["area"]}
                      for row in sorted(rows, key=lambda row: row["code"]) if row["area"] != "other"]}
    (ROOT / "data/coverage-map.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(metadata["stats"], ensure_ascii=False))


if __name__ == "__main__":
    main()
