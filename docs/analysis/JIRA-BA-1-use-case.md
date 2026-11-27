# JIRA-BA-1 — Use Case Analysis

## User Story

As a visitor logging in or creating an account, I want an eye icon on the password field of the login and register forms that toggles the password between hidden and visible, so that I can check what I typed before submitting and avoid failed logins or registering with a mistyped password.

## Ticket metadata

- **Priority:** Medium

## Acceptance criteria

The ticket has no description or acceptance criteria. The criteria below come from its title and the user story. Where they rely on the User Story Agent's open assumptions, this is noted under "Flagged for human review".

- **AC-1:** On both the login form (`/login`) and the register form (`/register`), the password field is masked (`type="password"`) when the form first renders.
- **AC-2:** On both forms, a show/hide toggle control (eye icon) is rendered alongside the password field.
- **AC-3:** Activating the toggle while the password is masked makes it visible (`type="text"`), and the typed value stays the same.
- **AC-4:** Activating the toggle while the password is visible masks it again (`type="password"`), and the typed value stays the same.
- **AC-5:** Activating the toggle does not submit the form: no login or register request is sent and no validation error is shown.
- **AC-6:** The toggle is a keyboard-operable button whose accessible name reflects its current action: "Show password" while the password is masked and "Hide password" while it is visible.
- **AC-7:** Submitting the form behaves as it does today whether the password is masked or visible. The value typed into the password field is sent, and the field keeps its `required` constraint, its register-only `minLength` of 6, and its `autoComplete` value (`current-password` on login, `new-password` on register).

## Technical requirements

- **TR-1:** Implement the toggle in the shared `AuthPage` component (`src/frontend/src/pages/AuthPage.tsx`) so a single change covers both `mode: 'login'` and `mode: 'register'`.
- **TR-2:** Store visibility in local component state, defaulting to hidden. The password input's `type` comes from that state (`'password'` or `'text'`).
- **TR-3:** The toggle is a native `<button type="button">`. The form's existing submit button has no explicit `type`, so it defaults to submit. Without an explicit `type="button"` the toggle would submit the form.
- **TR-4:** The toggle sets an `aria-label` of "Show password" or "Hide password" according to the current state. Because the control shows only an icon, this label is its only accessible name.
- **TR-5:** Leave the password input's `value`, `onChange`, `required`, `minLength` and `autoComplete` unchanged. The toggle changes only `type`.
- **TR-6:** The password field must stay reachable by its "Password" label. The toggle must not become the labelled control. Because `<label>` wraps the input, the input must stay the first labelable element inside the label, or the toggle must be placed outside the `<label>`.
- **TR-7:** Do not add a new icon dependency. Use inline SVG or text, because the component currently uses no icon library (see Flagged item 4).

## Non-technical requirements

- **Usability:** users can check what they typed before submitting, which reduces failed logins and mistyped registration passwords.
- **Accessibility:** an icon-only control needs an accessible name and keyboard operability (AC-6).
- **Security:** the password stays masked unless the user explicitly reveals it (AC-1). Revealing it is a client-side display change only. It does not change what is sent to the server or how.

## KPIs / success metrics

The ticket gives no basis for measurable KPIs (no baseline failed-login or registration-error rates are cited), so this section is intentionally left without metrics. See Flagged item 6.

## Given/When/Then scenarios

```
AC-1: Password is masked by default
Given a visitor opens the login form
When the form renders
Then the password field has type "password"
And the same holds when the visitor opens the register form
```

```
AC-2: Toggle is shown on both forms
Given a visitor opens the login form
When the form renders
Then a show/hide password toggle is displayed next to the password field
And the same toggle is displayed on the register form
```

```
AC-3: Toggle reveals the password
Given a visitor on the login or register form has typed "secret123" into the masked password field
When they activate the show/hide toggle
Then the password field has type "text"
And the password field still contains "secret123"
```

```
AC-4: Toggle hides the password again
Given a visitor has typed "secret123" and revealed the password with the toggle
When they activate the toggle again
Then the password field has type "password"
And the password field still contains "secret123"
```

```
AC-5: Toggle does not submit the form
Given a visitor on the login or register form with the fields filled in
When they activate the show/hide toggle
Then no login or register request is sent
And no error message is displayed
```

```
AC-6: Toggle is accessible and reflects state
Given a visitor on the login or register form with the password masked
When they focus the toggle with the keyboard
Then it is a button with accessible name "Show password"
When they press Enter or Space on it
Then the password becomes visible
And the button's accessible name is "Hide password"
```

```
AC-7: Submission is unchanged by visibility
Given a visitor on the login form has typed valid credentials and revealed the password
When they submit the form
Then a login request is sent with the typed email and password
And on the register form the password field still requires at least 6 characters
And the password field keeps autoComplete "current-password" on login and "new-password" on register
```

## Flagged for human review

1. **Empty ticket.** The ticket has no description and no acceptance criteria. AC-1 to AC-7 are derived from the title and the user story. Confirm they match the intended scope.
2. **Default state (AC-1).** The password is assumed to be masked by default. The title does not state this.
3. **Accessible labels (AC-6).** The wording "Show password"/"Hide password" and the use of `aria-label` (rather than `aria-pressed` with a fixed label) are assumptions. An icon-only control needs some accessible name, but the exact names are not specified anywhere.
4. **Icon/visual design.** No icon asset or design is given. TR-7 assumes inline SVG or text with no new dependency. Confirm, or provide a design.
5. **Reset behavior. Not turned into an AC.** The ticket does not say whether visibility resets after a submit (successful or failed) or when the visitor navigates between `/login` and `/register`. Depending on how the router mounts `AuthPage`, the component state may carry over across that navigation. This is left unspecified rather than guessed. A human should decide whether to add an AC for it.
6. **KPIs.** No metrics are given. If success should be measured (for example, failed-login rate before and after release), a baseline and target are needed.
