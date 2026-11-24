# JIRA-BA-2 — Handoff (scaffold mode, /add-page)

Derived values (description: `name: Profile`, `role: USER, ADMIN`):
- Name: Profile; Heading: `Profile`; Route: `/profile`; Test id: `profile-page`
- Roles USER, ADMIN = every role of `Role` in `src/frontend/src/types.ts` → access **logged in** (existing `RequireAuth`, no `RequireRole` needed)
- Component: `src/frontend/src/pages/ProfilePage.tsx` (default export `ProfilePage`)

Files to create / change (command's Changes section):
- `src/frontend/src/pages/ProfilePage.tsx` — new; imitate `src/frontend/src/pages/PlanesPage.tsx`: root `<div className="page" data-testid="profile-page">`, `<h1>Profile</h1>`, one `<p className="muted">` line
- `src/frontend/src/App.tsx` — add `import ProfilePage from './pages/ProfilePage.tsx'` next to the other page imports and `<Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />` before `<Route path="*" …>`; no nav link

Test setup already done (do not redo):
- `src/frontend/package.json` — devDependencies vitest, jsdom, @testing-library/react, @testing-library/jest-dom; script `"test": "vitest run"`
- `src/frontend/vite.config.ts` — `defineConfig` from `vitest/config`, `test: { environment: 'jsdom', include: ['tests/**/*.test.{ts,tsx}'] }`

Test: `src/frontend/tests/integration/profilePage.test.tsx`
- Renders `MemoryRouter(['/profile']) > AuthProvider > App`; stubs `fetch` for `GET /api/auth/me` and `GET /api/health`; token under `booking.token`
- Expects USER and ADMIN to see `profile-page` and an h1 `Profile`; anonymous to see h1 `Log in` and no `profile-page`
- Currently fails only because `/profile` has no route (USER/ADMIN tests); the anonymous test already passes
