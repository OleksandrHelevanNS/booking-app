---
description: >-
  Add a new frontend page to booking-app — its component in
  src/frontend/src/pages/, its route in App.tsx (public, any logged-in user, or
  only the roles given) and an integration test. Runs for a Jira ticket labeled
  agent:automation_add-page, ending in a PR
---
Add a new frontend page: $ARGUMENTS

## How it runs

The NerdySoft container runs it for a Jira ticket labeled `agent:automation_add-page` once the ticket
moves to To Do, with `$ARGUMENTS` = `<ticket-id> <issue-key> <ticket-file>`. Follow "Cloud run" at the
end: you only orchestrate, the agents do the sections below, and the run ends in a PR.

Read `AGENTS.md`'s "Coding standards" first if you haven't already this session.

## Name

The ticket's `description` holds lines like:

```
name: Profile
role: USER, ADMIN
```

The keys in any case, bullets and bold ignored, the roles separated by commas or spaces. The ticket's
title doesn't matter. No `name:` line, or more than one of either line: stop and say the description
needs exactly one `name:` line and at most one `role:` line.

- **Name**: the page's name, e.g. `Flight Status` or `FlightStatus`.
- **Roles**: any of the roles in the `Role` type of `src/frontend/src/types.ts` (`USER`, `ADMIN`), in any
  case. None: a public page that anyone, logged in or not, may open.

From them derive:
- **Component**: PascalCase plus `Page`, e.g. `FlightStatus` → `src/frontend/src/pages/FlightStatusPage.tsx`.
- **Heading**: the name in words, e.g. `Flight Status`.
- **Route**: `/<kebab-case>`, e.g. `/flight-status`.
- **Access**:
  - no roles → **public**, no guard;
  - every role of the `Role` type → **logged in**, guarded by the existing `RequireAuth`;
  - any other set → **roles**, guarded by `RequireRole` with exactly those roles.
- **Test id**: kebab-case plus `-page`, e.g. `data-testid="flight-status-page"`.

## Checks

Before writing anything, stop and say why, writing nothing, when:
- a role isn't one of the `Role` type's roles in `src/frontend/src/types.ts`;
- the route is already declared in `src/frontend/src/App.tsx`, or its first segment is `login`,
  `register`, `tickets`, `planes` or `api`;
- `src/frontend/src/pages/<Component>.tsx` already exists.

## Changes

1. **The page.** Create `src/frontend/src/pages/<Component>.tsx`, a default-exported function component
   in the style of the existing pages (read `PlanesPage.tsx` first): a root `<div className="page">`
   with the page's test id, an `<h1>` with the heading, and one short `<p className="muted">` line saying
   what the page is for, worded from the name. Plain CSS classes from `index.css` only. No lorem ipsum,
   no TODO, no commented-out code.
2. **The guard**, for **roles** access only. If `App.tsx` has no `RequireRole` yet, add one right after
   `RequireAuth`, in the same style: it takes `roles: Role[]` (the type from `./types`) and `children`,
   shows the same `Loading…` line while `loading`, sends an anonymous session to `/login` and a session
   whose `user.role` isn't in `roles` to `/tickets`, both with `<Navigate replace>`, and renders its
   children otherwise. Reuse it if it exists.
3. **The route.** In `App.tsx`, import the component next to the other page imports (with the `.tsx`
   extension, like them) and add its `<Route>` **before** `<Route path="*" …>`: no wrapper for public,
   `<RequireAuth>` for logged in, `<RequireRole roles={[…]}>` for roles. Don't add a navigation link.

## Tests

The frontend may have no test runner yet. If `src/frontend/package.json` has no `vitest`, first add
`vitest`, `jsdom`, `@testing-library/react` and `@testing-library/jest-dom` as devDependencies
(`cd src/frontend && npm install -D …`), a `"test": "vitest run"` script, and a `test` section in
`vite.config.ts` (`environment: 'jsdom'`, `include: ['tests/**/*.test.{ts,tsx}']`; import
`defineConfig` from `vitest/config`). Tests live in `src/frontend/tests/`, outside `src/`, so the
app's `tsc -b` build doesn't compile them.

Add `src/frontend/tests/integration/<camelCase>Page.test.tsx`. It renders the real app as `main.tsx`
does, at the route: `<MemoryRouter initialEntries={[route]}><AuthProvider><App /></AuthProvider></MemoryRouter>`.
A session is a token in `localStorage` under `booking.token` plus a stubbed `fetch` (`vi.stubGlobal`)
that answers `GET /api/auth/me` with `{ id, email, fullName, role }` and `GET /api/health` with
`{ status: 'UP', database: 'UP', timestamp }`; an anonymous session has no token. Clear `localStorage`
and the stubs after each test. It checks:
- **public**: an anonymous session sees the page: its test id and the `<h1>`;
- **logged in**: a USER and an ADMIN session see it; an anonymous session is redirected to `/login`
  (the Log in heading shows) and the page isn't rendered;
- **roles**: a session of each listed role sees it; an anonymous session is redirected to `/login`; a
  session of a role that isn't listed is redirected to `/tickets`; the page isn't rendered for either.

## Verify

From the repo root, fixing what fails: `bash .github/scripts/self-check.sh` while iterating, then
`bash .github/scripts/self-check.sh --final`. Both run this repo's gates from `.nerds/config.yaml`
(frontend lint, build and tests).

## Report

The route, its access (public, logged in, or the roles), the files created and changed, and the result
of each check. Say that no navigation link was added.

## Cloud run

You are only the orchestrator. **Every piece of work is done by a subagent**: you never read or write
code, tests or reports, and you run nothing: you only start subagents. Spawn each agent as its
own subagent (`<agent>`) with a short prompt: "scaffold mode", this file's path, the ticket id, the
ticket file path, and "this is a CI run". Never paste the ticket or a whole report.

1. **Tests** — `unit-integration-testing-agent` in scaffold mode: the Name, Checks and Tests sections.
   `Stop: <reason>` (a failed check) → step 6 without a PR, with that reason.
2. **Change** — `coding-agent` in scaffold mode: the Changes section, until its tests pass.
3. **CI** — `ci-agent`: CI run, fast path (`bash .github/scripts/ci-gates.sh --ticket <ticket-id>`). On
   FAIL, once: `coding-agent` in scaffold mode with only the failing gates and error lines, then
   `ci-agent` again. Still FAIL → step 6 without a PR.
4. **PR** — `pr-agent`: CI fast path, open the PR. `NO_SRC_CHANGES` → step 6 without a PR. Keep the PR
   URL it reports.
5. **Review** — `pr-review-agent`: review the PR URL for the ticket, attempt `1`. No automatic
   loop-back: a `REQUEST_CHANGES` verdict goes to a human through the PR.
6. **Jira** — the container does it after you finish, from your closing lines: an open PR moves the
   ticket to In Review; no PR fails it with your `Stopped:` reason. You run nothing yourself.
7. End with exactly these lines:
   ```
   Ticket: <ticket-id>
   Command: /add-page <route> (<public|logged in|roles: ROLE, ROLE>)
   PR: <url or none>
   CI: <PASS|FAIL|not run>
   Verdict: <APPROVE|COMMENT|REQUEST_CHANGES|none>
   Stopped: <reason, or "no">
   ```
