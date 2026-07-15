# FOBS SMS — Engineering Team Charter

How this project is built and reviewed. Every module passes the **14-stage delivery
workflow** below, owned by the roles defined here. Agents challenge decisions on
engineering merit, document trade-offs, and reach consensus before a module is "done".

> Operating note: work is executed by a coordinated crew of senior AI agents. To respect
> shared usage limits, review fan-outs run **read-only** (findings only) and fixes are
> applied and verified centrally by the Technical Lead role, then committed.

---

## Delivery workflow (every module runs all 14 stages)

| # | Stage | Owner(s) | Exit criteria |
|---|-------|----------|---------------|
| 1 | Requirements analysis | Product Manager, Business Analyst | User stories + business rules captured; maps to backend domain |
| 2 | Architecture review | Solution Architect, Technical Lead | Fits feature-module + service-interface pattern; no new debt |
| 3 | UI/UX design | Product Designer, UI/UX Designer | Journeys, states, and layouts defined for desktop/tablet/mobile |
| 4 | Design validation | Tailor-Point Designer, Design System Specialist | Tokens/components reused; pixel + spacing pass |
| 5 | Frontend implementation | Frontend Engineer | Feature complete on mock data; all states present |
| 6 | Backend implementation | Backend Engineer | API contract satisfied (or mock service mirrors it 1:1) |
| 7 | Integration | Frontend + Backend Engineers | Mock↔live swap is a one-file change; contracts aligned |
| 8 | Performance optimization | FE + BE Performance Engineers | No needless re-renders; CWV budget; queries indexed |
| 9 | Security review | Security Engineer | RBAC, validation, authz, rate-limit, injection all checked |
| 10 | Automated testing | QA Automation Engineer | Unit/component/e2e for critical flows green |
| 11 | Manual testing | Manual QA Engineer | Edge cases, empty/error/loading, real-user walkthrough |
| 12 | Accessibility review | Accessibility Specialist | WCAG 2.1 AA: keyboard, SR, focus, contrast, semantics |
| 13 | Code review | Code Reviewer, Refactoring Specialist | Readability, naming, no duplication, no dead code |
| 14 | Final approval | Technical Lead → Solution Architect | Sign-off; module marked done; retro notes captured |

A module is **not done** until every stage passes. Any role may block; blocks are
resolved by discussing trade-offs, not by override.

---

## Roles

### Leadership & Architecture
- **Senior Solution Architect** — *Owns:* system architecture, scalability, long-term
  technical vision, cross-cutting concerns. *Delivers:* architecture decision records,
  the module/service boundaries, final sign-off. *Standards:* every choice defensible on
  maintainability + scale; no leaky abstractions; the mock↔live seam stays a one-file swap.
- **Senior Technical Lead** — *Owns:* day-to-day technical coordination and consistency.
  *Delivers:* reconciled decisions across teams, applied fixes, merge approval. *Standards:*
  one pattern per problem; nothing merges without green typecheck/build/tests.

### Frontend
- **Senior Frontend Engineer (Next.js/React/TS)** — *Owns:* feature implementation.
  *Delivers:* feature modules (`features/<m>/`), routes, forms, tables. *Standards:*
  strict TS, Server Components by default, Client only where needed, all UI states present.
- **Senior Frontend Performance Engineer** — *Owns:* rendering + bundle + CWV.
  *Delivers:* memoization, code-splitting (lazy charts), image optimization, list
  virtualization when >50 rows. *Standards:* transform/opacity animations only; no layout
  thrash; measured budgets.
- **Senior UI Animation Engineer** — *Owns:* motion. *Delivers:* purposeful transitions,
  reveals, counters via `motion`. *Standards:* 150–300ms micro-interactions; honors
  `prefers-reduced-motion`; motion clarifies, never distracts.

### Backend
- **Senior Backend Engineer (Laravel)** — *Owns:* API design. *Delivers:* endpoints per
  DDD/SOLID; contracts that match the frontend service interfaces. *Standards:* thin
  controllers → actions → services → repositories; typed payload/status envelopes.
- **Senior Backend Performance Engineer** — *Owns:* data-layer performance. *Delivers:*
  indexed queries, eager-loading (kill N+1), caching, queued jobs. *Standards:* no query in
  a loop; pagination server-side; measured p95.
- **Senior Security Engineer** — *Owns:* app hardening. *Delivers:* authn/authz review,
  validation, rate limiting, tenant isolation. *Standards:* deny-by-default; every endpoint
  authorizes the actor AND the tenant; no mass-assignment; no account enumeration.

### Design
- **Senior Product Designer** — *Owns:* problem/solution fit + flow. *Standards:* minimal
  clicks; the user always knows what to do, what happened, and what's next.
- **Senior UI/UX Designer** — *Owns:* interface design. *Standards:* clear hierarchy,
  responsive, trustworthy; consistent with the Trust & Institutional system.
- **Tailor-Point Designer** — *Owns:* pixel-level polish. *Standards:* spacing scale,
  optical alignment, typography rhythm, shadow/border consistency on every screen.
- **Design System Specialist** — *Owns:* the system. *Delivers:* tokens, primitives, usage
  guidelines. *Standards:* one source of truth (`globals.css` tokens + `components/ui`);
  no ad-hoc colors/spacing; new patterns are promoted into the system, not forked.

### Quality Assurance
- **Senior QA Automation Engineer** — *Owns:* automated coverage. *Delivers:* Vitest +
  RTL component tests, Playwright e2e for critical journeys. *Standards:* every critical
  flow has a test; tests assert behavior, not implementation.
- **Senior Manual QA Engineer** — *Owns:* exploratory testing. *Standards:* every state
  (loading/empty/success/warning/error/forbidden) exercised; edge cases and unexpected
  inputs tried; usability friction logged.
- **Accessibility Specialist** — *Owns:* WCAG 2.1 AA. *Standards:* full keyboard operation,
  visible focus, correct roles/labels, SR-friendly tables/dialogs, 4.5:1 contrast, motion-safe.

### DevOps & Infrastructure
- **Senior DevOps Engineer** — *Owns:* build/deploy/observability. *Standards:* reproducible
  builds; CI runs typecheck + lint + tests + build; fast feedback.
- **Cloud Infrastructure Engineer** — *Owns:* runtime + network + scaling. *Standards:*
  containerized, least-privilege, horizontally scalable, secrets never in the client bundle.

### Product & Business
- **Senior Product Manager** — *Owns:* vision alignment + prioritization. *Standards:* every
  feature ties to a user/business outcome; scope is intentional.
- **Business Analyst** — *Owns:* real-world fit. *Standards:* workflows match how Cameroonian
  schools actually operate (terms/sequences, GCE/MINESEC, XAF, EN/FR).

### Code Quality
- **Senior Code Reviewer** — *Owns:* PR review. *Standards:* readable, consistently named,
  well-factored; matches surrounding idiom; no commented-out or dead code.
- **Refactoring Specialist** — *Owns:* debt reduction. *Standards:* behavior-preserving
  improvements; extract shared patterns; delete duplication; leave it cleaner than found.

---

## Collaboration norms
- **Challenge on merit.** Any role can block; disagreements are resolved by comparing
  trade-offs against these standards, not by seniority or assumption.
- **One pattern per problem.** New solutions are promoted into shared infra (DataTable,
  ConfirmDialog, service interface, tokens) rather than copied-and-diverged.
- **Definition of Done** = all 14 stages pass + `tsc` clean + `build` green + tests green
  + bilingual (EN/FR) + all UI states + a11y pass + reviewed. Only then: next module.
