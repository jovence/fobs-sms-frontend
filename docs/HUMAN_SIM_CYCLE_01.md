# Human-Simulation Cycle 01 — Report

**Product:** FOBS SMS frontend · **Env:** localhost mock (not production) · **Owner:** VP of QE
**Verdict:** **GO with conditions** (built surfaces are usable by the tested personas; unbuilt
features and non-web personas remain out of scope until they exist)

---

## Executive summary
Five persona/behaviour profiles ran **7 autonomous browser sessions** against the built
surfaces (owner dashboard + SuperAdmin), each with full trace/video/screenshot capture and a
reproducible seed. **Every persona completed its goal.** The cycle surfaced **no new product
defects**; it produced positive, reproducible evidence that key human-critical behaviours work:
loading feedback under slow 3G, duplicate-submit protection, clean form-abandon recovery, no
horizontal scroll on mobile, and correct client-side authorization. Three initial failures were
**test-authoring** issues (selector ambiguity / a control that correctly *relabels* while busy),
not product bugs — corrected and documented for auditability.

## Sessions & evidence
| Persona / profile | Device · network | Goal | Result | Evidence |
|---|---|---|---|---|
| Non-technical administrator (owner) | desktop · fast | Find Students → add one | ✅ completed | open Students **1.29s**, roster **36ms**, create **2.03s** (incl. human think-time); 1 primary click |
| Low-literacy user (owner) | Pixel 5 · **slow-3G** | Sign in → reach Students | ✅ completed | Sign-in button **disables + "Signing in…"**; **no horizontal scroll** (dashboard + students); roster resolved under throttle; 21.8s session |
| Impatient user | desktop · fast | Create while mashing submit | ✅ no duplicate | triple-click Create → **exactly one** student (86→87, never 88/89) |
| Impatient user | desktop · fast | Rapid filter switching | ✅ consistent | 4 rapid status changes → table stays valid |
| Any (logged-out) | desktop | Direct URL to `/students` | ✅ blocked | redirected to `/login` |
| Owner | desktop | Direct URL to `/admin`, `/admin/users` | ✅ blocked | redirected to `/dashboard` |
| Admin | desktop | Reach `/admin/schools` | ✅ allowed | page renders |

All sessions: trace + video + screenshots in `test-results/` (human-sim project); seeds in
`e2e/sim/personas.ts` for exact replay.

## Findings
**New product defects this cycle: 0.** The human-sim confirmed (did not break) the fixes from
the prior QE cycle. Positive confirmations worth recording:
- **Reliability** — duplicate-submission is prevented (busy-disabled submit).
- **Perceived latency** — the submit control communicates progress (disable + label change);
  the roster shows skeleton→data rather than a frozen screen under slow 3G.
- **Reversibility** — abandoning a form (Escape) and reopening yields a clean form (no stale
  data, no lost-work trap).
- **Responsive** — no horizontal overflow at the Pixel-5 viewport on the tested screens.
- **Authorization (client)** — guards enforce role + auth on direct-URL access.

### Test-authoring corrections (NOT product defects)
1. Login submit selector bound to "Sign in" failed because the button **correctly** relabels to
   "Signing in…" while busy — re-selected by `type=submit` and asserted the loading state.
2. `getByRole('option', {name:'Male'})` matched "Female" (substring) — added `exact: true`.
3. Landing/heading strict-mode ambiguity (hero vs CTA copy) — scoped to heading level / dialog.

## Metrics
- **Friction (administrator, happy path):** 3 measured steps, 1 primary navigation click, task
  wall-clock ~3.4s of interaction excluding deliberate think-time. Well within a reasonable
  effort budget; no repeated data entry; success feedback explicit ("… of 87").
- **Perceived latency (slow-3G mobile):** interactive feedback present at every wait; session
  completed end-to-end at 21.8s under a ~400 kbps / 400 ms-RTT profile.

## Risk assessment
- **Low** for the built owner/admin surfaces with the tested personas.
- **Medium** residual, driven by *coverage gaps*, not observed defects: teacher/parent/student/
  accountant/librarian journeys and every approval workflow are **not yet buildable** (features
  absent); backend/API-layer authorization is unverifiable in mock mode.

## Coverage the app does NOT yet permit (honest gaps)
Library, fees/accounting, payroll, timetable, homework/assignments, messaging; the mobile
teacher/parent/student surfaces; and all multi-role approval chains. The framework, personas,
role/approval matrices, and journey stubs are already specified in
`docs/HUMAN_SIMULATION_TESTING.md` so these automate the moment the features land.

## Release recommendation — **GO with conditions**
The built, tested surfaces are ready for real owner/admin users in mock mode — personas with
low literacy, small phones, slow networks, and low patience completed their goals with clear
feedback and safe behaviour. Before an **unconditional** production GO, complete (carried from
QE Cycle 01 + this cycle): cross-browser (Firefox/WebKit) human-sim, responsive/visual-
regression across breakpoints, formal performance budgets, **backend API-layer authorization &
the approval-workflow suite once those features exist**, and persona journeys for the remaining
roles when their surfaces are built.

## Next cycle backlog
Firefox/WebKit human-sim · offline/unstable-network sessions (route abort + `setOffline`) ·
exploratory monkey sessions per module using the seeded `exploreClick` engine · form fuzzing
(long/emoji/RTL/SQL-ish inputs) across every field · Lighthouse budgets · and — as features
ship — teacher/parent/accountant/librarian journeys and end-to-end approval-chain tests.
