# JIRA-BA-1 — Handoff to the Coding Agent

Test file: `src/frontend/tests/unit/AuthPage.passwordToggle.test.tsx` (the configured testsUnit dir is `src/frontend/tests/unit/`; `.claude/pipeline-context.md` says `tests/unit/` but `settings.config.json` and `.nerds/config.yaml` override it).

Files to change / imitate:
- `src/frontend/src/pages/AuthPage.tsx` — the only component to change (shared by `/login` and `/register`).
- `src/frontend/src/useAuth.ts` — tests render AuthPage inside `AuthContext.Provider` with a mocked `AuthContextValue`; keep both exported as-is.
- `src/frontend/package.json` — no test tooling yet. Add devDependencies `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event` (per settings `testFramework`), and a `"test": "vitest run"` script if wanted. Tests do NOT use jest-dom.
- `src/frontend/vite.config.ts` — add a `test` section (e.g. `environment: 'jsdom'`, `include: ['tests/**/*.test.{ts,tsx}']`). The file also sets `// @vitest-environment jsdom` itself and calls `cleanup()` in `afterEach`, so `globals` is not required.

Imports used by the tests (all already exist): default `AuthPage` from `src/pages/AuthPage`, `AuthContext` and type `AuthContextValue` from `src/useAuth`, `MemoryRouter` from `react-router-dom`.

What the tests expect:
- Password input found via `getByLabelText('Password')` (exact). The input must stay the labelled control: keep it the first labelable element in its `<label>` or put the toggle outside the label.
- Toggle found via `getByRole('button', { name: 'Show password' })` when masked and `'Hide password'` when visible — the SAME element (name via `aria-label`), a native `<button type="button">`.
- Enter and Space on the focused toggle flip the state (native button behaviour suffices).
- Input `type` toggles between `password` and `text`; `value`, `required`, `minLength` (6 on register only), `autoComplete` (`current-password` / `new-password`) unchanged.
- Toggling never calls `login`/`register` and renders no `.error` element.
- Submit buttons keep names `Log in` / `Register`; `login` gets `{ email, password }`, `register` gets `{ email, password, fullName }`.

Decisions: no icon library (inline SVG or text, per TR-7). Visibility reset on submit/navigation is not tested (flagged in the analysis).
Note: tests were not executed here (sandbox install was denied and no test deps are installed); please run them once deps are added.
