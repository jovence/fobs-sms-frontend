# FOBS SMS — Autonomous Human-Simulation Testing

Persona-driven browser agents that use the app like **real people** — with different literacy,
patience, devices, networks, and intentions — to prove the product is understandable, fast,
accessible, secure, and usable by non-technical users. Evidence over claims.

---

## Safety & environment (verified before any run)
- **Not production.** Target is `http://localhost:3210` (`next start`) with frontend
  environment variables configured explicitly. No real payment or external services are used
  in the billing "contact sales" flow.
- **Disposable data.** All data is a deterministic `faker` seed. **Reset** = each Playwright
  browser context is isolated with its own `localStorage`, so every session starts from a
  clean, reproducible state; no shared/production data can be touched.
- **Observability on.** The `human-sim` project records trace + video + screenshots and
  captures console errors and network activity for every session.

## Honest scope (what these agents can actually exercise today)
The frontend currently ships the **public site, authentication, the school-owner dashboard
(12 modules) and the SuperAdmin panel (6 pages)** — all mock-first. The web login accepts only
**owner** and **admin** roles (teachers/parents/students use the mobile apps, which are not part
of this project).

| Persona / journey | Status |
|---|---|
| Non-technical **Administrator** (owner) — students, teachers, classes, attendance, exams, marks, reports, settings | ✅ testable now |
| **Super Administrator** (admin) — platform dashboard, schools, users, referrals, app-control, activity | ✅ testable now |
| **Impatient / Curious / Keyboard-only / Mobile / Low-literacy** behavior profiles over the above | ✅ testable now (as behavior overlays on owner/admin) |
| **Teacher / Parent / Student** end-user journeys | ⛔ blocked — those surfaces are the (unbuilt) mobile apps |
| **Accountant / Librarian / Payroll** (fees, invoices, books, salaries) | ⛔ blocked — modules not built |
| **Timetable / Homework / Assignments / Messaging** | ⛔ blocked — not built |
| **Multi-role approval chains** (mark approval, leave, discount, document requests) | ⛔ blocked — no approval workflows exist yet |
| **Backend / API-level authorization** (direct endpoint calls) | ⛔ deferred to integration — no live API; client-side authorization *is* tested |

Blocked items are specified below so they are ready to automate the moment those features land.
This report does not pretend to test what does not exist.

---

## Personas

Each agent has: **goal · role · knowledge · patience · device · network · language · mistake
probability · abandon probability · help-seeking probability**, driven by a reproducible seed.

| # | Persona | Role (web) | Knowledge | Patience | Device | Network | Mistake% | Abandon% | Testable now |
|---|---------|-----------|-----------|----------|--------|---------|----------|----------|--------------|
| 1 | Low-literacy parent | parent* | very low | low | cheap Android | unstable/slow-3G | 35% | 30% | via mobile+slow overlay on owner surface |
| 2 | Elderly guardian | parent* | low | low | tablet | average | 30% | 25% | overlay |
| 3 | First-time student | student* | low | medium | laptop | average | 25% | 20% | ⛔ (student surface unbuilt) |
| 4 | Young student | student* | low | very low | small phone | fast | 40% | 35% | ⛔ |
| 5 | Busy teacher | teacher* | medium | very low | laptop | fast | 15% | 15% | ⛔ (teacher surface unbuilt) |
| 6 | Non-technical administrator | **owner** | low-med | medium | desktop | fast | 20% | 15% | ✅ |
| 7 | Accountant | accountant* | medium | medium | desktop | average | 15% | 10% | ⛔ (finance unbuilt) |
| 8 | Principal / director | **owner/admin** | medium | medium | desktop | fast | 10% | 10% | ✅ (dashboards/reviews) |
| 9 | Librarian | librarian* | medium | low | desktop | fast | 20% | 15% | ⛔ (library unbuilt) |
| 10 | Super administrator | **admin** | high | medium | desktop | fast | 10% | 5% | ✅ |
| 11 | Impatient user | any | medium | very low | laptop | fast then flaky | 30% | 40% | ✅ (behavior overlay) |
| 12 | Curious / unpredictable | any | medium | high | laptop | average | 25% | 10% | ✅ (exploratory overlay) |

\* Roles that only exist on the (unbuilt) mobile clients — documented for future automation.

## Behavior profiles (overlays)
`cautious · impatient · confused · curious · experienced · distracted · low-literacy ·
mobile-only · keyboard-only · slow-reader`. Each profile tunes think-time, misclick rate,
re-read likelihood, exploration, and abandonment. All randomness is **seeded** so any failure
replays exactly.

---

## Role & permission matrix (current app)
| Capability | owner | admin | teacher/parent (web) | logged-out | direct URL |
|---|---|---|---|---|---|
| Sign in to web | ✅ | ✅ | ⛔ (mobile only) | n/a | n/a |
| Owner dashboard + 12 modules | ✅ | ✅ | ⛔ | redirect → /login | redirect if unauth |
| SuperAdmin `/admin/*` | ⛔ → /dashboard | ✅ | ⛔ | redirect → /login | **owner hitting /admin is redirected** |
| Destructive actions (delete) behind confirm dialog | ✅ | ✅ | — | — | — |
| Delete a platform admin (admin panel) | — | **blocked (protected)** | — | — | — |

> Security note enforced by QE: client guards are **UX only**. The permission matrix must be
> re-verified at the **API** layer once the backend is wired — hiding a control is not security.

## Approval-workflow matrix (⛔ not built — specified for future)
Marks → coordinator approval · assignment → teacher grade · payment → supervisor validate ·
teacher account → profile completion · parent request → admin decision · lost book → penalty
review · leave → principal decision · document request → admin processing · fee discount →
authorized approval · out-of-role action → secure refusal + explanation. For each: verify
initiator, allowed validator, forbidden validator, notification delivery, status transition,
requester visibility, mandatory rejection reason, audit trail, duplicate-validation prevention,
stale-request handling.

## Critical user-journey catalogue
**Automatable now:** sign-in (valid/invalid) · reach dashboard · find & search students ·
create a student (happy + abandoned + invalid) · filter/sort/paginate a large table · switch
language EN↔FR · navigate every owner module via the sidebar · admin: manage schools (tier/demo),
manage users, view platform dashboard · authorization (owner blocked from /admin; logged-out
blocked from app; admin allowed). **Pending features:** attendance-entry-by-class, mark-entry
grid save, report-card generation, and every ⛔ journey above.

## Network & device profiles
`fast` (no throttle) · `average-mobile` (~1.6 Mbps/750 ms RTT) · `slow-3g` (~400 kbps/2 s RTT
with Pixel-5 emulation) · `unstable` (intermittent offline) · `offline`. Applied via CDP
`Network.emulateNetworkConditions` + Playwright device descriptors + `context.setOffline`.

## Findings taxonomy
**Severity:** Critical (security/data-loss/blocked core/unauth access) · High (major workflow
or usability failure, approval/data inconsistency) · Medium (confusing interaction, excessive
steps, weak validation, responsiveness) · Low (visual/wording/polish).
**Category:** functional · UX · accessibility · performance · security · authorization ·
data-integrity · responsive · localization · reliability.

## Observability (per session)
agent id · role · persona · profile · browser · viewport · device · network profile · seed ·
starting state · every action + URL · request latency · failed requests · console errors ·
screenshots · video · trace · final outcome · discovered problems.

## Execution phases
1. **Discovery** — enumerate screens/roles/actions (done: see catalogue + matrices).
2. **Environment** — confirm staging isolation + reset (done above).
3. **Framework** — persona-driven agents (`e2e/sim/`): seeded human-like delays, controlled
   mistakes, deterministic exploration, full capture.
4. **Critical journeys** — automate the most important role flows first.
5. **Exploratory** — goal- + role-constrained controlled-random sessions.
6. **Usability & performance** — measure completion, friction, latency, errors, abandonment,
   recovery.
7. **Findings & fixes** — verified findings with evidence; after a fix, **replay the exact
   failing scenario with the same seed** and keep it as regression coverage.

## Final quality standard
The app is user-friendly only when different realistic users complete their goals **without
assistance** — including low digital literacy, slow internet, small phones, and low patience.
Each cycle provides evidence: which personas completed which task, how long, where they
hesitated or failed, which requests were slow, which flows were too long, which permissions
were enforced, and whether the app is ready for real school users — **or not, and why.**
