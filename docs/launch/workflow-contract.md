# Havenue Execution Workflow Contract

## Purpose

This document defines the current repo-specific execution contract for the active Havenue work plan. It is the source of truth for how a future `/start-work` session should translate the approved Sisyphus plan into actual repo execution without inventing new command wiring or runtime behavior.

## Active Input

- Active input plan: `.sisyphus/plans/havenue-start-work-execution-gate.md`
- Active app scope: `cateringos-landing/`
- Repo instructions baseline: `CLAUDE.md`

## Execution Gate Contract

1. `/start-work` is currently a **chat/operator execution gate**, not a wired repo-local command.
2. The active Havenue execution input is the Sisyphus plan at `.sisyphus/plans/havenue-start-work-execution-gate.md`.
3. A `/start-work` session should read, in order:
   - `CLAUDE.md`
   - `.sisyphus/plans/havenue-start-work-execution-gate.md`
   - `cateringos-landing/docs/launch/workflow-contract.md`
   - `CONTINUITY.md`
4. Work should remain scoped to `cateringos-landing/` unless the plan explicitly requires a repo-root document or runtime handoff artifact.

## Loki Runtime Contract

- Repo-native autonomous runner: `./.claude/skills/loki-mode/autonomy/run.sh`
- `.loki/` is **not** a pre-committed planning artifact. It initializes at execution time when the Loki runner starts.
- Do **not** pre-create, pre-seed, or manually commit `.loki/` as part of plan preparation.
- Loki runtime behavior must be described from the repo's real documentation only:
  - prerequisite checks
  - runtime initialization
  - live status/logging
  - auto-resume behavior

## What Is Not Wired Today

- Repo-local `/start-work` command wiring is not currently implemented in project code, package scripts, or repo automation.
- This repo therefore uses:
  - **Sisyphus** for planning input and staged execution intent
  - **Loki Mode** for optional autonomous execution via the existing runner
  - **`CONTINUITY.md`** for repo-level handoff notes before Loki runtime begins

## Continuity Expectations

### Before Loki starts

- Update and read `CONTINUITY.md` for repo-level handoff context.
- Treat it as the continuity file for pre-runtime planning, execution notes, and restart guidance.

### After Loki starts

- `.loki/CONTINUITY.md` becomes the runtime working memory used by Loki Mode.
- `CONTINUITY.md` remains the repo-level handoff summary unless execution explicitly requires a matching post-run update.

## Safe Start Sequence

1. Confirm the active plan path is still `.sisyphus/plans/havenue-start-work-execution-gate.md`.
2. Confirm the work is still targeting `cateringos-landing/`.
3. Read this contract and `CONTINUITY.md` before making changes.
4. If autonomous execution is required, start from repo root with the existing Loki runner.
5. Allow `.loki/` to initialize at runtime; do not fabricate runner state ahead of time.

## Repo-Specific Notes

- This contract documents the repo as it exists now.
- If repo-local `/start-work` wiring is later added, this file must be updated to reflect the real implementation rather than desired behavior.
- If the Loki runner path changes, update this contract and `CONTINUITY.md` together.
