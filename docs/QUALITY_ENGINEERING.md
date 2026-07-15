# FOBS SMS — Quality Engineering Organization

An **independent** QE department. Its mission is not to build features but to prove — with
objective, reproducible evidence — that the product is production-ready, and to block release
until it is. QE challenges assumptions, reproduces defects, and reports facts. Nothing is
assumed; everything is verified.

> QE reports to the VP of Quality Engineering, not to the implementation Technical Lead.
> QE can block a release; a block is lifted by evidence, not by schedule pressure.

---

## Testing philosophy — validate from every seat

Every screen and flow is challenged from the perspective of: first-time users, students,
teachers, school administrators, accountants, librarians, parents, super-administrators,
users with disabilities, keyboard-only users, slow-network users, and mobile users. Testers
behave like real people: they make mistakes, enter invalid data, abandon flows mid-way,
refresh, open multiple tabs, navigate out of order, and use edge-case inputs. The bar: the
app feels intuitive to someone who has never used a school-management system.

---

## Roles

Each role owns **Responsibilities / Deliverables / Success criteria** below. The shared
**Collaboration workflow**, **Definition of Done**, **Exit criteria**, and **Quality gate**
apply to the whole org and are defined once (later in this doc).

| Role | Responsibilities | Deliverables | Success criteria |
|------|------------------|--------------|------------------|
| **VP of Quality Engineering** | Owns quality strategy, the release quality gate, and the go/no-go call | Release recommendation; quality dashboard; risk sign-off | Only software that meets the gate ships; escaped-defect rate trends down |
| **QA Architect** | Designs the overall test strategy, tooling, environments, test data | Test plan, coverage model, automation architecture | Coverage maps to real risk; suites are fast, deterministic, maintainable |
| **Principal Software Test Engineer** | Deep technical testing; defines patterns others follow | Reference test suites; test guidelines | Patterns are reused; flakiness < 1% |
| **Senior Manual Tester** | Scripted + checklist testing of every screen/flow | Executed test cases with pass/fail + evidence | Every screen exercised each cycle; defects reproducible |
| **Senior Automation Engineer** | Vitest + RTL unit/component automation | Component/unit suites; CI wiring | Critical logic + components covered; green in CI |
| **Playwright E2E Engineer** | Browser end-to-end journeys | `e2e/*.spec.ts`; Playwright config | Every critical journey automated and green |
| **Integration Testing Specialist** | Boundaries between modules/services | Integration suites | Module seams verified; contracts hold |
| **API Testing Specialist** | Contract, status, error, pagination of API (mock now, live later) | API contract tests; schema checks | Service interface matches the UI's expectations 1:1 |
| **Security Testing Engineer** | Authn/authz, input handling, injection, headers, session | Security test report; abuse cases | No high/critical security defects; deny-by-default verified |
| **Accessibility Testing Expert (WCAG)** | WCAG 2.1 AA on every screen | axe scans; keyboard/SR walkthroughs | 0 serious/critical a11y violations; full keyboard operability |
| **Performance & Load Testing Engineer** | CWV, bundle, render, and (live) load/latency | Perf report vs budgets; Lighthouse/traces | LCP/INP/CLS within budget; no needless re-renders |
| **Reliability Engineer** | Error recovery, retries, empty/timeout/session states | Reliability matrix | Every failure path degrades gracefully with a recovery affordance |
| **Chaos Testing Engineer** | Inject failures: slow/failed network, aborted flows, races | Chaos scenarios + outcomes | App never corrupts data or dead-ends under induced failure |
| **Mobile & Responsive Testing Specialist** | Phones/tablets, touch, breakpoints | Responsive matrix (375/768/1024/1440) | No horizontal scroll; touch targets ≥ 44px; usable on mobile |
| **UX Validation Specialist** | Usability, clarity, minimal-clicks, guidance | Usability findings + heuristics score | User always knows what to do / what happened / what's next |
| **Visual Regression Engineer** | Pixel/layout regressions across states + themes | Visual baselines + diffs | No unintended visual change ships |
| **Browser Compatibility Engineer** | Chromium/Firefox/WebKit parity | Cross-browser matrix | Core journeys pass on all three engines |
| **Data Integrity Tester** | CRUD correctness, pagination/sort/filter math, no data loss | Data-integrity checks | No lost/duplicated/mis-scoped records; counts always correct |
| **Localization (i18n) Testing Specialist** | EN/FR parity, ICU, formatting (XAF, dates), no hardcoded strings | i18n audit; key-parity check | No untranslated UI; EN/FR key parity 100% |
| **Regression Testing Lead** | Owns the regression suite; every fixed bug gets a test | Regression suite + run report | Regression suite green before every release |

---

## Collaboration workflow (per QE cycle)

1. **Plan** — QA Architect scopes the cycle (screens, flows, personas, risk areas).
2. **Explore** — Manual + Exploratory + UX testers hunt defects across every screen.
3. **Automate** — Automation/E2E/API engineers encode critical journeys and every fixed bug.
4. **Specialize** — Security, A11y, Performance, i18n, Responsive, Data-Integrity, Chaos each run their pass.
5. **Triage** — defects deduped, reproduced, severity-classified, assigned; regression impact noted.
6. **Report** — VP QE compiles the cycle report + release recommendation.
7. **Gate** — release proceeds only if the Quality Gate passes; otherwise QE blocks with evidence.

QE is adversarial by design: it disproves "it works", it does not confirm it.

---

## Severity classification

- **Critical** — data loss/corruption, security breach, crash, or a blocked core journey. Ship-blocker.
- **High** — a major flow broken or unusable for a persona; a11y blocker; wrong data shown. Ship-blocker.
- **Medium** — degraded UX/perf, inconsistent behavior, non-blocking incorrectness.
- **Low** — polish, copy, minor visual/spacing issues.

## Per-cycle deliverables (bug report format)
Executive summary · risk assessment · full bug report (each: id, severity, area, **steps to
reproduce**, **expected**, **actual**, evidence/screenshot, suggested fix, **regression
impact**) · severity roll-up · **release recommendation** (GO / GO-with-conditions / NO-GO).

## Definition of Done (a test / a defect)
- A **test** is done when it is deterministic (flake < 1%), asserts observable behavior, runs
  in CI, and is owned by a suite.
- A **defect** is done when it is reproduced, fixed, covered by a new automated regression
  test, and re-verified closed.

## Exit criteria / Quality gate — "production-ready"
Release is permitted only when **all** hold:
- No **Critical** and no **High** defects open.
- **Accessibility** meets WCAG 2.1 AA (0 serious/critical violations; full keyboard + SR).
- **Responsive** behavior verified at 375 / 768 / 1024 / 1440.
- **Cross-browser** core journeys pass on Chromium, Firefox, WebKit.
- **Performance** targets met (LCP < 2.5s, INP < 200ms, CLS < 0.1 on key pages).
- **Security** review passes (no high/critical; deny-by-default; headers set).
- **End-to-end** critical journeys pass; **regression** suite green.
- **User-acceptance** persona scenarios pass.

## Automation strategy
- **Unit/logic** — Vitest (services, rbac, schemas, formatters, csv).
- **Component** — Vitest + React Testing Library (guards, forms, tables, states).
- **E2E** — Playwright across Chromium/Firefox/WebKit (auth, CRUD, i18n, navigation, a11y smoke, responsive).
- **API** — contract tests against the service interfaces (mock now; live at integration).
- **Visual regression** — Playwright screenshot baselines per key screen × theme × locale.
- **Rule:** every fixed defect gets an automated regression test whenever practical.
