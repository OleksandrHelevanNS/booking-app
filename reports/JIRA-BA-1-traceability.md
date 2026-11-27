# JIRA-BA-1 — Traceability report

Generated at: 2026-11-27T13:29:59Z

| AC | Description | Test name | Test file:line | Status |
| -- | ----------- | --------- | -------------- | ------ |
| AC-1 | Password masked on first render (login) | `AuthPage password toggle (login form) > renders the password field masked by default` | `src/frontend/tests/unit/AuthPage.passwordToggle.test.tsx:45` | PASS |
| AC-1 | Password masked on first render (register) | `AuthPage password toggle (register form) > renders the password field masked by default` | `src/frontend/tests/unit/AuthPage.passwordToggle.test.tsx:45` | PASS |
| AC-2 | Toggle rendered (login) | `AuthPage password toggle (login form) > renders a show/hide password toggle` | `src/frontend/tests/unit/AuthPage.passwordToggle.test.tsx:51` | PASS |
| AC-2 | Toggle rendered (register) | `AuthPage password toggle (register form) > renders a show/hide password toggle` | `src/frontend/tests/unit/AuthPage.passwordToggle.test.tsx:51` | PASS |
| AC-3 | Toggle reveals, value kept (login) | `AuthPage password toggle (login form) > reveals the password without changing its value` | `src/frontend/tests/unit/AuthPage.passwordToggle.test.tsx:57` | PASS |
| AC-3 | Toggle reveals, value kept (register) | `AuthPage password toggle (register form) > reveals the password without changing its value` | `src/frontend/tests/unit/AuthPage.passwordToggle.test.tsx:57` | PASS |
| AC-4 | Toggle masks again, value kept (login) | `AuthPage password toggle (login form) > masks the password again without changing its value` | `src/frontend/tests/unit/AuthPage.passwordToggle.test.tsx:66` | PASS |
| AC-4 | Toggle masks again, value kept (register) | `AuthPage password toggle (register form) > masks the password again without changing its value` | `src/frontend/tests/unit/AuthPage.passwordToggle.test.tsx:66` | PASS |
| AC-5 | Toggle does not submit (login) | `AuthPage password toggle (login form) > does not submit the form when the toggle is activated` | `src/frontend/tests/unit/AuthPage.passwordToggle.test.tsx:76` | PASS |
| AC-5 | Toggle does not submit (register) | `AuthPage password toggle (register form) > does not submit the form when the toggle is activated` | `src/frontend/tests/unit/AuthPage.passwordToggle.test.tsx:76` | PASS |
| AC-6 | Keyboard-operable, Show/Hide password name (login) | `AuthPage password toggle (login form) > is keyboard operable and its accessible name reflects the current state` | `src/frontend/tests/unit/AuthPage.passwordToggle.test.tsx:87` | PASS |
| AC-6 | Keyboard-operable, Show/Hide password name (register) | `AuthPage password toggle (register form) > is keyboard operable and its accessible name reflects the current state` | `src/frontend/tests/unit/AuthPage.passwordToggle.test.tsx:87` | PASS |
| AC-7 | Constraints kept in both states (login) | `AuthPage password toggle (login form) > keeps the password field constraints whether masked or visible` | `src/frontend/tests/unit/AuthPage.passwordToggle.test.tsx:103` | PASS |
| AC-7 | Constraints kept in both states (register) | `AuthPage password toggle (register form) > keeps the password field constraints whether masked or visible` | `src/frontend/tests/unit/AuthPage.passwordToggle.test.tsx:103` | PASS |
| AC-7 | Login submit sends typed credentials (visible) | `AuthPage password toggle submission > sends the typed credentials on login while the password is visible` | `src/frontend/tests/unit/AuthPage.passwordToggle.test.tsx:120` | PASS |
| AC-7 | Register submit sends typed values (visible) | `AuthPage password toggle submission > sends the typed values on register while the password is visible` | `src/frontend/tests/unit/AuthPage.passwordToggle.test.tsx:130` | PASS |
| AC-7 | Login submit sends typed credentials (masked) | `AuthPage password toggle submission > sends the typed credentials on login while the password is masked` | `src/frontend/tests/unit/AuthPage.passwordToggle.test.tsx:144` | PASS |

## Summary

- 17/17 acceptance criteria covered by a passing test
- 0 failing or not run
- 0 flagged for human review
