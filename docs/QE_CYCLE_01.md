# QE Cycle 01 — Report

**Product:** FOBS SMS frontend · **Mode:** mock · **Owner:** VP of Quality Engineering
**Verdict:** **GO with conditions** (see Release recommendation)

---

## Executive summary

An automation-led QE cycle established the end-to-end evidence base and ran an accessibility
gate over the critical surfaces. **31 automated tests are green** (16 unit/component via
Vitest, 15 end-to-end via Playwright incl. an axe-core WCAG gate). The cycle **found and
fixed four real, previously-shipping defects** — most notably that the sidebar **"FOBS"
wordmark rendered dark-on-navy (1.16:1 contrast — effectively invisible)**. No Critical or
High defects remain open on the tested surfaces. Cross-browser (Firefox/WebKit), a full
per-screen a11y/visual sweep, formal performance measurement, and live-mode security remain
as conditions before an unconditional production GO.

## Scope & method
- **Automated E2E (Playwright, Chromium, prod build, mock mode):** authentication (5),
  Students module incl. create flow (4), bilingual EN/FR (3), accessibility gate (3).
- **Unit/component (Vitest + RTL):** rbac, auth schemas, CSV injection, students service
  CRUD/pagination/sort/filter.
- **Accessibility:** `@axe-core/playwright`, WCAG 2.0/2.1 A & AA tags, fail on serious/critical.

## Test evidence
| Suite | Count | Result |
|-------|-------|--------|
| Vitest unit/component | 16 | ✅ pass |
| Playwright E2E (auth, students, i18n, a11y) | 15 | ✅ pass |
| **Total** | **31** | **✅ pass** |

## Defects found and fixed this cycle
Each was verified fixed and is now guarded by the a11y E2E gate (regression protection).

| ID | Sev | Area | Steps to reproduce | Expected | Actual | Fix |
|----|-----|------|--------------------|----------|--------|-----|
| QE-01 | High | Shell / sidebar | Sign in → view sidebar brand | "FOBS" wordmark legible on navy | Dark text on navy, **1.16:1** — invisible (the aside had no base text color, so the wordmark inherited the dark app foreground) | Set `text-sidebar-foreground` base on app + admin sidebars |
| QE-02 | High | Shell / sidebar | Sign in → active nav item + section labels + switcher subtext | Text ≥ 4.5:1 on navy | Scholar-green nav 4.09:1 / 3.1:1; tiny labels 3.36:1 | Lift `--sidebar-foreground` (0.90→0.95) & `--sidebar-primary` (0.62→0.76 L); raise low-opacity label classes |
| QE-03 | High (a11y) | Dashboard chart | Sign in → dashboard → tab into the enrollment chart | No focusable content inside `aria-hidden` | recharts `<svg tabindex=0 role=application>` focusable inside an `aria-hidden` wrapper (`aria-hidden-focus`) | `accessibilityLayer={false}` on decorative charts |
| QE-04 | Medium (a11y) | Toasts | Trigger any success/error toast | Toast text ≥ 4.5:1 | sonner rich-color success text 4.25:1 | CSS override darkening rich-color toast text (success/error/warning/info) |

*(These are in addition to the ~12 high/medium items fixed in the prior engineering-review
cycle — page-clamp, keepPreviousData flash, CSV formula injection, form `role="alert"`,
skip-links, `--warning` contrast, admin-selection integrity, i18n of the shared table.)*

## Test-authoring corrections (NOT product defects)
Initial E2E authoring produced 5 false negatives from strict-mode selector ambiguity
(hero `<h1>` vs the CTA `<h2>` sharing copy; the form "Date of birth" label colliding with
the sortable column's `aria-label`). Selectors were scoped (dialog-scoped fields, heading
levels, specific pagination regex); the underlying flows were correct. Documented so the
distinction between test defects and product defects is auditable.

## Quality gate status
| Gate | Status |
|------|--------|
| No Critical defects | ✅ none on tested surfaces |
| No High defects | ✅ none open (QE-01/02/03 fixed) |
| WCAG 2.1 AA (sampled: landing, login, dashboard) | ✅ 0 serious/critical |
| Responsive 375/768/1024/1440 | ⚠️ verified in design/build; not yet automated |
| Cross-browser (Chromium/Firefox/WebKit) | ⚠️ Chromium ✅; FF/WebKit pending browser provisioning |
| Performance targets (LCP/INP/CLS) | ⚠️ not yet formally measured |
| Security review | ✅ client pass; live-mode items deferred to integration |
| E2E critical journeys | ✅ auth, students CRUD, i18n |
| Regression suite | ✅ green (31 tests) |
| User-acceptance persona scenarios | ⚠️ partial (owner + admin automated; other personas manual, pending) |

## Risk assessment
- **Low** on the automated critical journeys (auth, students CRUD, bilingual, sampled a11y).
- **Medium** residual: unverified cross-browser + responsive automation, no formal perf
  numbers, a11y sampled (not every screen), personas partially covered.
- **Deferred (by design):** live-mode security (client guards are UX-only; the API must
  authorize every request) — tracked for backend integration.

## Release recommendation — **GO with conditions**
Ship-ready for the tested surfaces in mock mode. Before an **unconditional** production GO,
complete: (1) Firefox + WebKit E2E (`playwright install --with-deps`), (2) responsive +
visual-regression automation across breakpoints/themes, (3) an a11y sweep of every remaining
screen, (4) formal performance/Lighthouse budgets, (5) the live-mode security hardening at
API integration, and (6) automated persona journeys for teacher/parent/accountant/librarian
once those surfaces exist.

## Next QE cycle backlog
Firefox/WebKit projects · per-module E2E (teachers, academics, exams, attendance, reports,
admin) · form-validation component tests · visual-regression baselines · Lighthouse CI ·
axe on every route · chaos/slow-network (Playwright route throttling) · API contract tests
at integration.
