# Sterling_Fitness — instructions for coding agents

This folder holds the Sterling Fitness method documents. The scoring code and
all member data live in the separate `Local LM Models` repository.

## Files

- `graph/fitness_spec.py` — the single source of truth: agents, glossary,
  exercise model, technique tables, sources, deviations, owner decisions.
- `graph/make_fitness_diagram.py` — draws the diagram from the spec.
- `graph/make_fitness_tables.py` — writes the technique tables from the spec.
- `graph/*.svg`, `graph/*.html` — generated. Never edit by hand.
- `graph/archive/` — old versions. A record only; never read or edit.

## Commands

```bash
cd Sterling_Fitness/graph
python make_fitness_diagram.py
python make_fitness_tables.py
```

Scoring tests (in `Local LM Models`): `python -m pytest tests/test_fitness_analytics.py -q`

## Rules

1. Code sets every score and every pass or fail. A language model never does.
2. Score by body part. Log by exercise.
3. Each exercise has a permanent id. Never match logs by name.
4. Compare weight and progress only within the same exercise.
5. Code builds the program from written rules (N3). The member approves it
   (G1). Score against targets, never against the program.
6. Every target, test, norm, movement and exercise needs a published source,
   current, measured, and covering ages 50 and up. Cite it by id from `SOURCES`.
7. No member data in this folder: no results, names or test dates.
8. Use the terms in `GLOSSARY` exactly. Do not invent synonyms.

## Change order

1. Change the technique table in `fitness_spec.py`.
2. Then change the code in `Local LM Models`.
3. Then regenerate the diagram and tables.

If the code and a table must differ for a while, add a `DEVIATIONS` entry.

## Stop and ask the owner when

- a change needs a number or a source that is not in `SOURCES`;
- an item in `OPEN_DECISIONS` would be decided by the change;
- a change would touch the app (`mobile-app`) or the `925_Branch_refactor`
  branch. A merge there redeploys the live app.
