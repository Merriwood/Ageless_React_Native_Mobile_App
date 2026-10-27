# Sterling Fitness — program documents

This folder holds the Sterling Fitness and 925 Program documents: how members
are tested and scored, and the agent graph that does it. It holds **method and
sources only, never a member's results.**

It is not part of the app build. Render builds only
`Ageless_REACT-Native_Mobile_Application/mobile-app`, so nothing here changes
the app.

## Documents

| File | Version | What it is |
| --- | --- | --- |
| `CLAUDE.md` | v0.2 (2026-10-27) | Instructions for coding agents: commands, rules, change order, when to stop and ask |
| `graph/fitness_spec.py` | draft v0.2 (2026-10-27) | The agent graph spec: 7 lanes, 28 agents, gates, control services, the glossary, the exercise model (body part, movement, exercise) and the technique tables (FIT-T) with their sources, deviations and open decisions. The single source of truth for the drawing and the tables |
| `graph/make_fitness_diagram.py` | draft v0.2 | Draws the diagram from the spec. Adapted from `make_diagram.py` in `Merriwood/propertydd-graph` v2.8 |
| `graph/make_fitness_tables.py` | draft v0.2 | Writes the technique tables from the spec as one HTML page in `archive/graph/<version>_<date>/`, then prints it with Chrome to the PDF in `graph/` |
| `graph/20261027_sterling-fitness-agent-graph_v0.2.svg` | draft v0.2 | The drawing. Generated, never edited by hand |
| `graph/20261027_FIT-T_technique-tables_v0.2.pdf` | draft v0.2 | The technique tables. Generated, never edited by hand. ST1 is the first; the other agents follow. Printed from the HTML page in `archive/graph/v0.2_2026-10-27/` |

Earlier versions are kept, unchanged, in `archive/graph/<version>_<date>/`.
They are a record only; nothing reads them.

Planned: the program document (FIT-ARCH) and a technique table for every
agent, setting its tests, protocols and published sources.

To regenerate after a spec change:

```bash
cd Sterling_Fitness/graph
python make_fitness_diagram.py
python make_fitness_tables.py
```

## Where the code and data live

The scoring code and all member data are in the separate `Local LM Models`
repository, and stay there. The data is health data: it is kept on the
member's machine and never committed to any repository.

| What | Path in `Local LM Models` |
| --- | --- |
| Gate A and Gate B scoring, norms and citations | `docker/fitness-analytics/fitness_analytics.py` (detail in its `README.md`) |
| App data extract | `scripts/fitness-extract/derive_fitness.py` |
| Quarterly fitness test form | `scripts/diary/diary_local.py` |
| Diary wiki fitness pages | `scripts/diary-extract/fitness_wiki.py` |
| Tests | `tests/test_fitness_analytics.py` |
| Member data (gitignored, local only) | `data/fitness/`, `data/raw/fitness/`, `data/fitness-assessments/`, `data/wiki/` |

## Rules for this folder

- Every test, protocol and norm comes from published academic or medical
  research, as current as available, measured (not extrapolated), suited to
  the age group, and covering ages 50 and up. Cite it next to where it is used.
- Code, never a language model, sets every score and every pass or fail.
- No member results, names or dates of a member's tests in any file here.
- Work on a branch. A merge into `925_Branch_refactor` redeploys the live app
  on Render, so the owner decides when it happens.
