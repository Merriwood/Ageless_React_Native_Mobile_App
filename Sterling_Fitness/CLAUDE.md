# Sterling_Fitness — instructions for coding agents

This folder holds the Sterling Fitness method documents. The scoring code and
all member data live in the separate `Local LM Models` repository.

## Files

- `graph/fitness_spec.py` — the single source of truth: agents, glossary,
  exercise model, technique tables, sources, deviations, owner decisions.
- `graph/make_fitness_diagram.py` — draws the diagram from the spec.
- `graph/make_fitness_tables.py` — writes the technique tables from the spec as
  HTML in `archive/graph/<version>_<date>/`, then prints the PDF into `graph/`.
  Needs Chrome.
- `graph/*.svg`, `graph/*.pdf` and the tables HTML — generated. Never edit by hand.
- `archive/` — the master archive for files no longer in use. `archive/graph/`
  holds old graph versions, plus the current tables HTML that
  `make_fitness_tables.py` writes. A record only; never edit by hand.
- `.claude/Coding Agents/langGraph-builder.md` — coding rules for LangGraph
  work. Copied unchanged from the Property DD graph folder.
- `.claude/skills/graph-agent-engineering/` — the check to run before building
  any graph: does this work need a graph at all. Copied unchanged.

## Commands

```bash
cd Sterling_Fitness/graph
python make_fitness_diagram.py
python make_fitness_tables.py
```

Scoring tests (in `Local LM Models`): `python -m pytest tests/test_fitness_analytics.py -q`

## Rules

1. Code sets every score and every pass or fail. A language model never does.
2. Log by exercise. Score the program by exercise. Check and report targets
   by body part.
3. Each exercise has a permanent id. Never match logs by name.
4. Compare weight and progress only within the same exercise.
5. Code builds the program from written rules (N3). Code checks it against the
   targets and limits, and the member approves it (G1). The member is scored on
   the program (ST1.5), never the targets. Only the assigned exercise counts.
   A program change starts on a Sunday; each score stores its program version.
6. Every target, test, norm, movement and exercise needs a published source,
   current, measured, and covering ages 50 and up. Cite it by id from `SOURCES`.
7. No member data in this folder: no results, names or test dates.
8. Use the terms in `GLOSSARY` exactly. Do not invent synonyms.

## Frameworks

- The agent graph is built on LangChain and LangGraph only. Follow
  `.claude/Coding Agents/langGraph-builder.md` for all LangGraph code.
- Before building an agent or a lane, run the check in
  `.claude/skills/graph-agent-engineering/SKILL.md`. If the steps all feed each
  other, build a plain function or one loop, not a graph.
- Confirm installed versions of `langgraph`, `langchain-core` and `langsmith`
  before writing code. Do not rely on tutorials or memory.
- LangGraph runs the steps. It never sets a score. Scores, pass or fail and
  program checks stay in plain, tested Python (rule 1).
- LangSmith (the service that records each run) is for development with test
  data only. Hosted tracing is never on when member data is loaded, because it
  would send health data off the member's machine. The graph code must check
  `LANGSMITH_TRACING` and `LANGCHAIN_TRACING_V2` at start and stops if either is
  on with member data. Test fixtures hold no real member data.
- The graph code goes in `Local LM Models` with the scoring code, not in this
  folder.

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
