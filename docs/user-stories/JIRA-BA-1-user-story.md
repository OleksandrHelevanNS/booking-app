# JIRA-BA-1 — User Story

As a visitor logging in or creating an account, I want an eye icon on the password field of the login and register forms that toggles the password between hidden and visible, so that I can check what I typed before submitting and avoid failed logins or registering with a mistyped password.

Derived from the ticket title "Show/hide password toggle (eye icon) on the login and register forms" (the ticket description is empty). Both forms are rendered by the shared `AuthPage` component (`src/frontend/src/pages/AuthPage.tsx`, `mode: 'login' | 'register'`), each with a single `type="password"` input, so this is one capability applied to both modes rather than two separate stories.

## Flagged for human review

The ticket has no description or acceptance criteria. Everything below comes from the title alone, so these details are assumptions for the Use Case Agent to confirm or treat as open:

- **Default state:** the password is assumed to be hidden (masked) when the form first loads. The title doesn't say this.
- **Persistence/reset:** the title doesn't say whether visibility resets after a submit, a failed submit, or switching between `/login` and `/register`. Both routes render the same component.
- **Accessibility:** the title doesn't specify an accessible name or state for the toggle (for example an `aria-label` of "Show password"/"Hide password" or `aria-pressed`), or whether it must be reachable by keyboard.
- **Icon/visual:** no icon asset or design is specified. The repo has no icon library in this component, so whether to use inline SVG, text, or a new dependency is undecided.
- **Form behavior:** the toggle is assumed not to submit the form (`type="button"`) and to leave the existing `required`, `minLength` (register: 6) and `autoComplete` attributes unchanged. The ticket doesn't state this.
