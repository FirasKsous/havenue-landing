# Havenue Execution Blocker Register

## Purpose

This register tracks the execution blockers called out by the active Havenue plan so future `/start-work` sessions do not improvise around unresolved prerequisites. It is documentation-only and must stay aligned with:

- `.sisyphus/plans/havenue-start-work-execution-gate.md`
- `cateringos-landing/docs/launch/workflow-contract.md`
- `CONTINUITY.md`

## Scope

- Active plan input: `.sisyphus/plans/havenue-start-work-execution-gate.md`
- Active app scope: `cateringos-landing/`
- Runtime reference: `./.claude/skills/loki-mode/autonomy/run.sh`

## Status Key

- **Open** — unresolved and execution-relevant
- **Waiting** — blocked on external input/owner response
- **Resolved** — explicitly cleared with repo evidence

## Blocker Register

| ID | Blocker | Status | Severity | Impact | Owner / Next Action | Halt Condition |
|---|---|---|---|---|---|---|
| DN1 | Approved Havenue legal identity, jurisdiction, and contact details for Privacy, Cookie, and Marketing policy content | Resolved | Critical | Approved identity inputs were supplied and Tasks 8, 9, and 10 are now implemented against them | Keep the approved identity set aligned across the three legal pages until the user replaces the address placeholder manually | None while the approved identity inputs remain Havenue LLC / DIFC Free Zone / contact@havenue.co with a clearly marked placeholder address. |
| B2 | Havenue Calendly or demo-booking destination is not yet confirmed | Open | High | Demo/contact conversion flow cannot be treated as launch-ready; execution notes would point to an unresolved booking path | Revenue/ops owner must confirm the production Calendly or approved demo-booking destination and where it should be wired in the landing-page flow | **Stop launch-readiness signoff for booking/demo flow** if the Havenue destination is still unknown, unowned, or not approved for production use. |
| B3 | Secret rotation and remediation is unresolved for landing-path runtime credentials and related manual follow-up | Resolved | Critical | Landing-path source files are remediated and the local `origin` remote no longer contains an embedded credential | Keep the current repo-safe remote format and preserve the launch preflight secret checks for future changes | None while the current clean state is preserved. |
| B4 | Repo-local `/start-work` wiring remains undocumented because no actual implementation exists in project code or scripts | Open | Medium | Execution sessions must rely on the documented chat/operator gate; inventing local command behavior would break the workflow contract | Workflow owner should keep using the documented Sisyphus-plan gate unless a real repo implementation is later added and documented | **Stop any attempt to rely on repo-local `/start-work` automation** if no committed implementation exists. Use the documented chat-triggered gate instead. |
| B5 | Undocumented runtime behavior beyond the committed workflow contract and continuity handoff | Open | High | Future sessions could initialize or use Loki runtime incorrectly, especially around `.loki/` state and continuity ownership | Execution owner must treat `workflow-contract.md`, `CONTINUITY.md`, and Loki runner docs as the only approved runtime behavior sources and update docs before changing expectations | **Stop autonomous-runtime assumptions** if the intended behavior is not explicitly documented in the contract, continuity handoff, or the Loki runner documentation. |

## Execution Notes

- This blocker register is part of Task 1 in the active plan: freeze the `/start-work` handoff contract and blocker handling.
- The repo-local `/start-work` gap is a documentation/runtime-truthfulness issue, not a prompt to add new command wiring in this subtask.
- `.loki/` still initializes at runtime only; unresolved runtime questions must not be solved by pre-creating or committing `.loki/` state.
- Code execution has progressed through Tasks 1-18. The remaining work is the final verification wave and any review-driven fixes.
- Current launch preflight status: code/content checks pass, static policy routes resolve, placeholder privacy links are gone, brand regression scan is clean, and no blocking findings remain.

## Update Rule

When a blocker changes state, update this file with repo evidence or approved external confirmation. Do not mark a blocker resolved based on assumption, inferred ownership, or undocumented runtime behavior.
