"""
make_fitness_tables.py — renders the glossary, the exercise model and the
technique tables (FIT-T) in fitness_spec.py to one HTML page, the companion to
make_fitness_diagram.py. Generated, never edited by hand: change the spec and
run this again.

The HTML page goes to archive/v<VERSION>_<DATE>/. It is printed with Chrome to
a PDF in this folder, which is the copy to read.
"""
import html
import pathlib
import subprocess
from fitness_spec import (VERSION, DATE, ORG, CONFIDENTIAL, NODES, GLOSSARY, CODE_KEY,
                          BODY_PARTS, EXERCISE_MODEL, EXERCISE_RULES, TECHNIQUES, SOURCES,
                          DEVIATIONS, OPEN_DECISIONS)

esc = html.escape
NODE = {n["code"]: n for n in NODES}
TAG = {"app": "· in app", "logged": "· logged, skipped (D4)", "new": ""}

CSS = """
@page { size: letter landscape; margin: 0.5in; }
body { font-family: Helvetica, Arial, sans-serif; color: #1B2430; margin: 0; font-size: 10.5pt; }
h1 { font-size: 17pt; margin: 0 0 2pt; }
h2 { font-size: 13pt; margin: 16pt 0 4pt; border-bottom: 1px solid #C3CBD4; padding-bottom: 3pt; }
.meta { color: #5A6672; font-size: 9pt; margin-bottom: 8pt; }
table { border-collapse: collapse; width: 100%; margin: 6pt 0; }
th, td { border: 1px solid #C3CBD4; padding: 4pt 5pt; vertical-align: top; text-align: left; }
th { background: #F5F7F9; font-size: 9pt; }
td { font-size: 9.2pt; }
.built { color: #2E7D52; font-weight: bold; }
.proposed { color: #B5761B; font-weight: bold; }
.gap { color: #B0454A; font-weight: bold; }
p, li { margin: 3pt 0; }
"""


def table(head, rows):
    o = ["<table><tr>" + "".join(f"<th>{h}</th>" for h in head) + "</tr>"]
    for r in rows:
        o.append("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>")
    return "".join(o) + "</table>"


def build():
    o = [f"<!doctype html><html><head><meta charset='utf-8'><title>FIT-T v{VERSION}</title>"
         f"<style>{CSS}</style></head><body>",
         "<h1>Sterling Fitness — Technique Tables (FIT-T)</h1>",
         f"<div class='meta'>{esc(ORG)} · draft v{VERSION} · {DATE} · for owner review · "
         f"{esc(CONFIDENTIAL)}. Generated from fitness_spec.py.</div>",
         "<h2>Terms</h2>",
         table(["Term", "Code name", "Meaning"],
               [(esc(t), f"<code>{c}</code>", esc(m)) for t, c, m in GLOSSARY]),
         "<h2>Code key</h2>",
         table(["Code", "Meaning"], [(esc(c), esc(m)) for c, m in CODE_KEY])]

    o.append("<h2>Exercise model (proposed)</h2>"
             "<p>Body part → Movement → Exercise. Every exercise belongs to one movement. "
             "Every movement belongs to one body part. Muscles are described, never scored. "
             "No row has a published source yet. Unmarked exercises are not in the app yet.</p>")
    for part, label in BODY_PARTS:
        rows = []
        for m in (m for m in EXERCISE_MODEL if m["part"] == part):
            exs = "<br>".join(
                f"{esc(n)} <code>{i}</code>" + (f" <b>{TAG[w]}</b>" if TAG[w] else "")
                + (f" — {esc(note)}" if note else "") for i, n, w, note in m["exercises"])
            move = esc(m["movement"]) + (f" <span class='meta'>({m['side']})</span>"
                                         if m["side"] else "")
            rows.append((move, esc(m["muscles"]), exs))
        o.append(f"<p><b>{esc(label)}</b></p>")
        o.append(table(["Movement", "Main muscles", "Exercises: name, id"], rows))
    o.append("<p><b>Rules</b></p><ol>" + "".join(f"<li>{esc(r)}</li>" for r in EXERCISE_RULES)
             + "</ol>")

    notes = []
    for code, t in TECHNIQUES.items():
        n = NODE[code]
        o.append(f"<h2>{code} · {esc(n['name'])} <span class='meta'>(ages "
                 f"{esc(n.get('bands', ''))})</span></h2><p>{esc(t['purpose'])}</p>")
        o.append(table(["Step", "What it does", "Rule or source", "Status"],
                       [(f"{s['id']} {esc(s['step'])}", esc(s["does"]),
                         esc(", ".join(s["sources"]) or "Program rule"),
                         f"<span class='{s['status']}'>{s['status']}</span>")
                        for s in t["steps"]]))
        notes += [(s["id"], esc(s["note"])) for s in t["steps"] if s.get("note")]

    o.append("<h2>Deviations: where the code differs</h2>")
    o.append(table(["Id", "Agent", "Detail"],
                   [(r["id"], r["agent"], esc(r["text"])) for r in DEVIATIONS]))
    o.append("<h2>Owner decisions (not build instructions)</h2>")
    o.append(table(["Id", "Agent", "Decision"],
                   [(r["id"], r["agent"], esc(r["text"])) for r in OPEN_DECISIONS]))
    o.append("<h2>Appendix A: step notes</h2>")
    o.append(table(["Step", "Note"], notes))
    o.append("<h2>Appendix B: sources</h2>")
    o.append(table(["Id", "Citation", "Ages covered", "Used for", "How far checked"],
                   [(sid, esc(s["cite"]), esc(s["covers"]), esc(s["used"]), esc(s["checked"]))
                    for sid, s in SOURCES.items()]))
    o.append("</body></html>")
    return "".join(o)


HERE = pathlib.Path(__file__).resolve().parent
NAME = f"{DATE.replace('-', '')}_FIT-T_technique-tables_v{VERSION}"
OUT = HERE / "archive" / f"v{VERSION}_{DATE}" / f"{NAME}.html"
PDF = HERE / f"{NAME}.pdf"
CHROME = pathlib.Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")

if __name__ == "__main__":
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(build(), encoding="utf-8")
    print(f"{OUT.name} written to archive — {len(TECHNIQUES)} agent table(s), "
          f"{len(EXERCISE_MODEL)} movements, {len(SOURCES)} sources")
    if not CHROME.exists():
        raise SystemExit(f"Chrome not found at {CHROME}; {PDF.name} not printed")
    subprocess.run([str(CHROME), "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                    f"--print-to-pdf={PDF}", OUT.as_uri()], check=True, capture_output=True)
    print(f"{PDF.name} printed")
