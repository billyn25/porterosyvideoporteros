#!/usr/bin/env python3
"""Compare the same municipality pairs in two builds; Python standard library only.

Example (the isolated baseline must first be built with node scripts/build.mjs):
  python scripts/audit-content.py --baseline-root qa/baseline-9306292 --current-root .

The default pair source is the baseline's committed audit. The sample is never
redrawn to favour new results. All town pages are parsed to find global blocks.
"""
from __future__ import annotations

import argparse
import collections
import hashlib
import json
import math
import re
import statistics
import unicodedata
from dataclasses import dataclass, field
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path


TEXT_TAGS = {"h1", "h2", "h3", "h4", "p", "li", "summary"}
EXCLUDE_TAGS = {"form", "nav", "noscript", "script", "style", "svg"}
EXCLUDE_CLASSES = {
    "actions", "brand-note", "button", "eyebrow", "hero-number", "hero-tag",
    "local-context", "nearby-grid", "nearby-note", "number", "service-footer", "text-link",
}
VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
GEOGRAPHY_CLASSES = {"local-geography", "local-localities", "localities-section", "local-area"}


@dataclass(slots=True)
class Element:
    tag: str
    attrs: dict[str, str]
    children: list = field(default_factory=list)

    def classes(self):
        return set(self.attrs.get("class", "").split())

    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Element):
                yield from child.walk()

    def text(self):
        parts = []
        for child in self.children:
            value = child.text() if isinstance(child, Element) else child
            if value.strip():
                parts.append(value.strip())
        return " ".join(parts)


class Document(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.root = Element("root", {})
        self.stack = [self.root]
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        node = Element(tag, {key: value or "" for key, value in attrs})
        self.stack[-1].children.append(node)
        if tag not in VOID_TAGS:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID_TAGS:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                return

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def ascii_text(text):
    return unicodedata.normalize("NFKD", text.lower()).encode("ascii", "ignore").decode()


def normalizer(town):
    mapping = {ascii_text(name): "municipio" for name in [town["name"], *town.get("aliases", [])]}
    # Preserve the previous audit's treatment of a city bearing its province's
    # name: the province key wins, so the fixed sample is exactly reproducible.
    mapping[ascii_text(town["province"])] = "provincia"
    replacements = sorted(mapping.items(), key=lambda item: len(item[0]), reverse=True)
    compiled = [(re.compile(r"(?<![a-z0-9])" + re.escape(name) + r"(?![a-z0-9])"), target) for name, target in replacements if name]

    def normalize(text):
        text = ascii_text(text)
        for pattern, replacement in compiled:
            text = pattern.sub(replacement, text)
        return " ".join(re.findall(r"[a-z0-9]+", text))
    return normalize


def excluded(node):
    return (node.tag in EXCLUDE_TAGS or bool(node.classes() & EXCLUDE_CLASSES)
            or node.attrs.get("id") == "consulta"
            or (node.tag == "section" and "section--line" in node.classes()))


def prune(node):
    node.children = [child for child in node.children if not isinstance(child, Element) or not excluded(child)]
    for child in node.children:
        if isinstance(child, Element):
            prune(child)


def is_geography(node):
    return (bool(node.classes() & GEOGRAPHY_CLASSES)
            or node.attrs.get("data-audit-geography") is not None
            or node.attrs.get("id") in {"nucleos", "localidades", "datos-locales"})


def extract(source, town):
    document = Document(source)
    main = next(node for node in document.root.walk() if node.tag == "main")
    prune(main)
    normalize = normalizer(town)
    blocks, technical_blocks = [], []

    def visit(node, geography=False):
        geography = geography or is_geography(node)
        descendants = list(node.walk())[1:]
        if node.tag in TEXT_TAGS and not any(child.tag in TEXT_TAGS for child in descendants):
            text = normalize(node.text())
            if text:
                blocks.append(text)
                if not geography:
                    technical_blocks.append(text)
        for child in node.children:
            if isinstance(child, Element):
                visit(child, geography)
    visit(main)

    local_grid = next((node for node in main.walk() if "local-grid" in node.classes()), None)
    editorial_parts = []
    if local_grid:
        first_column = next((node for node in local_grid.children if isinstance(node, Element)), None)
        if first_column:
            intro = next((node for node in first_column.children if isinstance(node, Element) and node.tag == "p"), None)
            if intro:
                editorial_parts.append(intro.text())
    editorial_parts.extend(node.text() for node in main.walk() if "local-editorial" in node.classes())
    return blocks, technical_blocks, normalize(" ".join(editorial_parts))


def sha(text):
    return hashlib.sha256(text.encode()).hexdigest()


def shingles(text, n=5):
    words = text.split()
    return {" ".join(words[i:i+n]) for i in range(max(0, len(words) - n + 1))}


def metric(left, right):
    intersection, union = len(left & right), len(left | right)
    return {"jaccardPercent": round(100 * intersection / union, 4) if union else 0,
            "intersection": intersection, "union": union,
            "shinglesA": len(left), "shinglesB": len(right)}


def percentile(values, q):
    values = sorted(values)
    point = (len(values) - 1) * q
    lower, upper = math.floor(point), math.ceil(point)
    return values[lower] + (values[upper] - values[lower]) * (point - lower)


def stats(values):
    return {"count": len(values), "min": round(min(values), 2),
            "p25": round(percentile(values, .25), 2), "median": round(statistics.median(values), 2),
            "mean": round(statistics.mean(values), 2), "p75": round(percentile(values, .75), 2),
            "p90": round(percentile(values, .90), 2), "max": round(max(values), 2)}


def pair_changes(baseline, current):
    result = {}
    for field in ("main", "adjusted", "technical", "technicalAdjusted", "editorial"):
        deltas = [new["metrics"][field]["jaccardPercent"] - old["metrics"][field]["jaccardPercent"]
                  for old, new in zip(baseline["pairs"], current["pairs"])]
        result[field] = {"lower": sum(delta < 0 for delta in deltas),
                         "higher": sum(delta > 0 for delta in deltas),
                         "equal": sum(delta == 0 for delta in deltas)}
    return result


def load_snapshot(root, pairs):
    report_path = root / "qa/build-report.json"
    report_text = report_path.read_text()
    report = json.loads(report_text)
    expected_asset_version = hashlib.sha256(b"".join(
        (root / "dist/assets" / filename).read_bytes() for filename in ("site.css", "site.js")
    )).hexdigest()[:10]
    towns = json.loads((root / "data/municipalities.json").read_text())
    records = {page["path"]: page for page in report["pages"] if page["kind"] == "town"}
    samples = {pair[key] for pair in pairs for key in ("pathA", "pathB")}
    all_pages, occurrences, asset_versions = {}, collections.Counter(), collections.Counter()
    for town in towns:
        path = f'/porteros-videoporteros/{town["provinceSlug"]}/{town["slug"]}/'
        source = (root / "dist" / path.strip("/") / "index.html").read_text()
        versions = set(re.findall(r'/assets/site\.(?:css|js)\?v=([^"\s]+)', source))
        if len(versions) != 1:
            raise ValueError(f"Missing or mixed CSS/JS versions in {root / 'dist' / path.strip('/')}")
        asset_versions.update(versions)
        blocks, technical_blocks, editorial = extract(source, town)
        all_pages[path] = {"blocks": blocks, "technicalBlocks": technical_blocks, "editorial": editorial,
                           "sha256": sha(source), "focusId": records[path].get("focusId")}
        occurrences.update(set(blocks))
    if len(asset_versions) != 1:
        raise ValueError(f"Mixed builds in {root / 'dist'}: {dict(asset_versions)}")
    if set(asset_versions) != {expected_asset_version}:
        raise ValueError(f"HTML asset version does not match CSS/JS contents in {root / 'dist'}")
    if report_path.read_text() != report_text:
        raise ValueError(f"Build report changed while reading {root}; rerun on a completed build.")
    global_blocks = {text for text, count in occurrences.items() if count / len(towns) >= .95}
    fields = ("main", "adjusted", "technical", "technicalAdjusted", "editorial")
    sequences = {field: collections.Counter() for field in fields}
    word_counts = {field: [] for field in fields}
    pages, sample_shingles = {}, {}
    for path, page in all_pages.items():
        texts = {
            "main": " ".join(page["blocks"]),
            "adjusted": " ".join(block for block in page["blocks"] if block not in global_blocks),
            "technical": " ".join(page["technicalBlocks"]),
            "technicalAdjusted": " ".join(block for block in page["technicalBlocks"] if block not in global_blocks),
            "editorial": page["editorial"],
        }
        for field, text in texts.items():
            sequences[field][sha(text)] += 1
            word_counts[field].append(len(text.split()))
        if path in samples:
            pages[path] = {"sha256": page["sha256"], "focusId": page["focusId"],
                           "wordCounts": {field: len(text.split()) for field, text in texts.items()}}
            sample_shingles[path] = {field: shingles(text) for field, text in texts.items()}
    results = []
    for pair in pairs:
        result = {key: pair[key] for key in ("category", "pathA", "pathB", "focusA", "focusB", "sameProvince")}
        result["currentFocusA"] = all_pages[pair["pathA"]]["focusId"]
        result["currentFocusB"] = all_pages[pair["pathB"]]["focusId"]
        result["metrics"] = {field: metric(sample_shingles[pair["pathA"]][field], sample_shingles[pair["pathB"]][field]) for field in fields}
        results.append(result)
    summary = {category: {field: stats([pair["metrics"][field]["jaccardPercent"] for pair in results if pair["category"] == category]) for field in fields}
               for category in ("same_focus", "different_focus")}
    corpus = {field: {"uniqueSequences": len(counter), "maxReuse": max(counter.values()),
                       "duplicateGroups": sum(count > 1 for count in counter.values()),
                       "medianWords": statistics.median(word_counts[field])} for field, counter in sequences.items()}
    selection_coverage = {}
    for field in ("diagnostics", "faqs", "brands", "services"):
        usage, combinations = collections.Counter(), collections.Counter()
        for record in records.values():
            selected = record.get("selection", {}).get(field, [])
            usage.update(set(selected))
            combinations[tuple(selected)] += 1
        selection_coverage[field] = {
            "uniqueIdsShown": len(usage), "pageUsesById": dict(sorted(usage.items())),
            "uniqueOrderedSelections": len(combinations),
            "maxOrderedSelectionReuse": max(combinations.values(), default=0),
        }
    return {"buildGeneratedAt": report["generatedAt"], "buildBaseUrl": report["baseUrl"],
            "assetVersions": dict(asset_versions),
            "municipalities": len(towns), "contactConfigured": report["contactConfigured"],
            "globalBlocksRemoved": [{"text": text, "count": occurrences[text]} for text in sorted(global_blocks)],
            "summary": summary, "corpus": corpus, "selectionCoverage": selection_coverage,
            "pages": pages, "pairs": results}


def render(report):
    baseline, current = report["baseline"], report["current"]
    changes = report["pairChanges"]["main"]
    labels = {"main": "Principal normalizado (con información local)", "adjusted": "Principal sin bloques globales",
              "technical": "Principal sin bloque geográfico", "technicalAdjusted": "Principal sin geografía ni bloques globales",
              "editorial": "Introducción temática + tres secciones editoriales"}
    rows = []
    for category, category_label in (("same_focus", "Mismo foco original"), ("different_focus", "Distinto foco original")):
        for field, label in labels.items():
            old = baseline["summary"][category][field]["median"]
            new = current["summary"][category][field]["median"]
            rows.append(f"| {category_label} | {label} | {old:.2f}% | {new:.2f}% | {new-old:+.2f} pp |")
    corpus_rows = []
    for field, label in labels.items():
        old, new = baseline["corpus"][field], current["corpus"][field]
        corpus_rows.append(f'| {label} | {old["uniqueSequences"]} | {new["uniqueSequences"]} | {old["maxReuse"]} → {new["maxReuse"]} |')
    selection_rows = []
    for field, label in (("diagnostics", "Casos de avería"), ("faqs", "Preguntas frecuentes")):
        old, new = baseline["selectionCoverage"][field], current["selectionCoverage"][field]
        selection_rows.append(f'| {label} | {old["uniqueIdsShown"]} → {new["uniqueIdsShown"]} | {old["uniqueOrderedSelections"]} → {new["uniqueOrderedSelections"]} | {old["maxOrderedSelectionReuse"]} → {new["maxOrderedSelectionReuse"]} |')
    mismatch = report["baselineReproduction"]["differentRecordedPairMetrics"]
    reproduction = ("Los resultados de los 240 pares del baseline reproducen exactamente los valores del informe previo."
                    if not mismatch else f"La nueva implementación del extractor difiere de la anterior en {mismatch} medidas por par; la tabla compara exclusivamente los dos builds recalculados con este mismo extractor, no mezcla métricas de métodos diferentes.")
    return "\n".join([
        "# Auditoría comparable de contenido municipal", "",
        f'Baseline: commit `{report["baselineCommit"]}`. Build actualizado: `{current["buildGeneratedAt"]}`.', "",
        f'{current["municipalities"]} páginas municipales; **los mismos 240 pares y las mismas 447 páginas de muestra** en ambos builds. Las categorías de foco se fijan al baseline y no se redibujan según el resultado.', "",
        "## Medianas de coincidencia literal", "",
        "| Pares (120 por categoría) | Texto | Antes | Después | Cambio |", "|---|---|---:|---:|---:|", *rows, "",
        f'En el principal normalizado, {changes["lower"]} de los 240 pares reducen coincidencia y {changes["higher"]} la aumentan ({changes["equal"]} sin cambios). Las medianas no significan que todos los pares mejoren.', "",
        "La medida sin geografía permite comprobar si la variación también afecta al contenido de servicio, sin dar crédito a listas de nombres locales. La medida completa sí conserva la información geográfica visible porque forma parte de la página.", "",
        "## Método", "",
        "Se usa Jaccard de conjuntos de fragmentos de cinco palabras: `100 × intersección / unión`. Se normalizan mayúsculas y tildes, y se sustituyen exclusivamente nombre/alias del municipio y provincia propios. No se eliminan palabras comunes ni se agrupan sinónimos.", "",
        "Se extrae `main`, excluyendo navegación, formulario, botones de acción, decoración y municipios cercanos. Se incluyen los textos técnicos, servicios, marcas, averías y FAQ. La medida ajustada retira bloques completos que aparecen normalizados en al menos el 95 % del corpus de cada build; el JSON incluye cuáles son. Los bloques nuevos de núcleos/datos locales se identifican por `data-audit-geography` o las clases documentadas en el script.", "",
        "La medida editorial aislada conserva la introducción temática y las tres secciones `local-editorial`. No representa todos los textos de la página.", "", reproduction, "",
        "## Reutilización en todo el corpus", "",
        "| Texto normalizado | Secuencias antes | Secuencias después | Máxima reutilización |", "|---|---:|---:|---:|", *corpus_rows, "",
        "Una secuencia distinta puede ser una combinación de módulos compartidos; no equivale a una redacción independiente o a investigación técnica de cada municipio. La selección de averías no representa incidencias registradas, frecuencia local ni trabajos ejecutados.", "",
        "| Módulos visibles en páginas municipales | Casos distintos antes → después | Combinaciones ordenadas | Máxima reutilización de una combinación |", "|---|---:|---:|---:|", *selection_rows, "",
        "## Límites", "",
        "- Es una auditoría interna de coincidencia literal, **no una métrica de Google** ni una garantía contra penalizaciones, de indexación, calidad o posicionamiento.",
        "- La muestra original está equilibrada por foco, no ponderada por tráfico ni por todos los pares posibles. Se conserva para una comparación honesta.",
        "- Añadir texto diferente aumenta el denominador; una bajada no demuestra por sí sola mayor utilidad. Los nombres geográficos se presentan con fuentes y se evalúan también por separado.",
        "- Reordenar párrafos cambia los fragmentos de sus uniones, pero no convierte información compartida en contexto local propio.",
        "- Jaccard detecta coincidencias literales; no identifica todos los casos de equivalencia semántica.", "",
        "## Reproducir", "",
        "```bash", "python scripts/audit-content.py --baseline-root qa/baseline-9306292 --current-root .", "```", "",
        "El baseline se obtiene con `git archive 9306292` en un directorio independiente y se genera con `SITE_URL=https://porteros.example node scripts/build.mjs`. Este dominio se utiliza únicamente para la prueba; no es el dominio comercial.", "",
        "`docs/content-audit.json` conserva pares, rutas, SHA-256 de los HTML, tamaños de intersección/unión, número de palabras, bloques globales y distribuciones completas antes/después. El script utiliza solo la biblioteca estándar de Python.", ""
    ])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--baseline-root", type=Path, required=True)
    parser.add_argument("--current-root", type=Path, default=Path("."))
    parser.add_argument("--pairs-from", type=Path)
    parser.add_argument("--output-dir", type=Path, default=Path("docs"))
    parser.add_argument("--baseline-commit", default="930629245008d2b70fa1259abd87760e70938ae4")
    args = parser.parse_args()
    previous = json.loads((args.pairs_from or args.baseline_root / "docs/content-audit.json").read_text())
    pairs = previous["pairs"]
    if len(pairs) != 240 or len({tuple(sorted([p["pathA"], p["pathB"]])) for p in pairs}) != 240:
        raise ValueError("The preserved sample must contain 240 distinct pairs.")
    baseline = load_snapshot(args.baseline_root, pairs)
    current = load_snapshot(args.current_root, pairs)
    mismatches = []
    for old, fresh in zip(pairs, baseline["pairs"]):
        for field in ("main", "adjusted", "editorial"):
            if old["metrics"][field] != fresh["metrics"][field]:
                mismatches.append({"pathA": old["pathA"], "pathB": old["pathB"], "field": field,
                                   "recorded": old["metrics"][field], "recomputed": fresh["metrics"][field]})
    report = {"createdAt": datetime.now(timezone.utc).isoformat(), "baselineCommit": args.baseline_commit,
              "method": {"name": "Jaccard de conjuntos de cinco palabras", "pairCount": len(pairs),
                         "pairsPreservedFromPreviousReport": True, "globalThreshold": .95,
                         "structuralExclusions": sorted(EXCLUDE_TAGS | EXCLUDE_CLASSES),
                         "geographySelectors": ["[data-audit-geography]", *sorted(GEOGRAPHY_CLASSES), "#nucleos", "#localidades", "#datos-locales"]},
              "baselineReproduction": {"differentRecordedPairMetrics": len(mismatches), "differences": mismatches},
              "pairChanges": pair_changes(baseline, current),
              "baseline": baseline, "current": current}
    args.output_dir.mkdir(parents=True, exist_ok=True)
    (args.output_dir / "content-audit.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    (args.output_dir / "content-audit.md").write_text(render(report))
    print(json.dumps({"baselineReproductionMismatches": len(mismatches), "before": baseline["summary"], "after": current["summary"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
