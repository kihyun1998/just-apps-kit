# just-apps-kit

## Agent skills

### Issue tracker

GitHub Issues, through the `gh` CLI. Before creating, reading or labelling an issue, read `docs/agents/issue-tracker.md`.

### Triage labels

The five default triage labels. Before applying or reading one, read `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. Before exploring or naming a domain concept, read `docs/agents/domain.md`.

## Map

`docs/map/README.md` is the entry point. Before designing a change, open the territory it lands in and treat its `## Blast radius` and `## Cross-cutting invariants` as a checklist; after the change, update that note. When a fix reveals a fact, ask whether it holds at every site that shares the same table, entry, token or dependency; if it does, the fix lands with an invariant note.

## Comments

A comment says what the code is. Why it is this way, what it deliberately leaves out, the trap and the measured value go to the territory note under `docs/map/`. Where none seems to hold it, search the folder and the code symbol first; only then start a new note, named for what the system does there, not for the file. History goes to the commit message. Comments written before this rule still carry the rest: never delete one whose content the map does not yet hold — move it there first.
