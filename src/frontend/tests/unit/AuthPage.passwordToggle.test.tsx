// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AuthPage from '../../src/pages/AuthPage'
import { AuthContext, type AuthContextValue } from '../../src/useAuth'

type Mode = 'login' | 'register'

function renderAuthPage(mode: Mode) {
  const auth: AuthContextValue = {
    user: null,
    loading: false,
    isAdmin: false,
    login: vi.fn().mockResolvedValue(undefined),
    register: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn(),
  }
  const view = render(
    <MemoryRouter initialEntries={[`/${mode}`]}>
      <AuthContext.Provider value={auth}>
        <AuthPage mode={mode} />
      </AuthContext.Provider>
    </MemoryRouter>,
  )
  return { auth, view, user: userEvent.setup() }
}

const passwordInput = () => screen.getByLabelText('Password') as HTMLInputElement

async function fillForm(user: ReturnType<typeof userEvent.setup>, mode: Mode, password: string) {
  if (mode === 'register') await user.type(screen.getByLabelText('Full name'), 'Jane Doe')
  await user.type(screen.getByLabelText('Email'), 'jane@example.com')
  await user.type(passwordInput(), password)
}

afterEach(() => {
  cleanup()
})

for (const mode of ['login', 'register'] as const) {
  describe(`AuthPage password toggle (${mode} form)`, () => {
    // AC-1: password field is masked when the form first renders
    it('renders the password field masked by default', () => {
      renderAuthPage(mode)
      expect(passwordInput().getAttribute('type')).toBe('password')
    })

    // AC-2: a show/hide toggle is rendered alongside the password field
    it('renders a show/hide password toggle', () => {
      renderAuthPage(mode)
      expect(screen.getByRole('button', { name: 'Show password' })).toBeTruthy()
    })

    // AC-3: activating the toggle reveals the password and keeps the typed value
    it('reveals the password without changing its value', async () => {
      const { user } = renderAuthPage(mode)
      await user.type(passwordInput(), 'secret123')
      await user.click(screen.getByRole('button', { name: 'Show password' }))
      expect(passwordInput().getAttribute('type')).toBe('text')
      expect(passwordInput().value).toBe('secret123')
    })

    // AC-4: activating the toggle again masks the password and keeps the typed value
    it('masks the password again without changing its value', async () => {
      const { user } = renderAuthPage(mode)
      await user.type(passwordInput(), 'secret123')
      await user.click(screen.getByRole('button', { name: 'Show password' }))
      await user.click(screen.getByRole('button', { name: 'Hide password' }))
      expect(passwordInput().getAttribute('type')).toBe('password')
      expect(passwordInput().value).toBe('secret123')
    })

    // AC-5: activating the toggle does not submit the form or show a validation error
    it('does not submit the form when the toggle is activated', async () => {
      const { auth, view, user } = renderAuthPage(mode)
      await fillForm(user, mode, 'secret123')
      await user.click(screen.getByRole('button', { name: 'Show password' }))
      await user.click(screen.getByRole('button', { name: 'Hide password' }))
      expect(auth.login).not.toHaveBeenCalled()
      expect(auth.register).not.toHaveBeenCalled()
      expect(view.container.querySelector('.error')).toBeNull()
    })

    // AC-6: the toggle is a keyboard-operable button whose accessible name reflects its action
    it('is keyboard operable and its accessible name reflects the current state', async () => {
      const { user } = renderAuthPage(mode)
      const toggle = screen.getByRole('button', { name: 'Show password' })
      expect(toggle.tagName).toBe('BUTTON')
      expect(toggle.getAttribute('type')).toBe('button')
      toggle.focus()
      expect(document.activeElement).toBe(toggle)
      await user.keyboard('{Enter}')
      expect(passwordInput().getAttribute('type')).toBe('text')
      expect(screen.getByRole('button', { name: 'Hide password' })).toBe(toggle)
      await user.keyboard(' ')
      expect(passwordInput().getAttribute('type')).toBe('password')
      expect(screen.getByRole('button', { name: 'Show password' })).toBe(toggle)
    })

    // AC-7: the password field keeps required, minLength and autoComplete in both states
    it('keeps the password field constraints whether masked or visible', async () => {
      const { user } = renderAuthPage(mode)
      const expectConstraints = () => {
        const input = passwordInput()
        expect(input.required).toBe(true)
        expect(input.getAttribute('minlength')).toBe(mode === 'register' ? '6' : null)
        expect(input.getAttribute('autocomplete')).toBe(mode === 'register' ? 'new-password' : 'current-password')
      }
      expectConstraints()
      await user.click(screen.getByRole('button', { name: 'Show password' }))
      expectConstraints()
    })
  })
}

describe('AuthPage password toggle submission', () => {
  // AC-7: submitting the login form with the password visible sends the typed credentials
  it('sends the typed credentials on login while the password is visible', async () => {
    const { auth, user } = renderAuthPage('login')
    await fillForm(user, 'login', 'secret123')
    await user.click(screen.getByRole('button', { name: 'Show password' }))
    await user.click(screen.getByRole('button', { name: 'Log in' }))
    expect(auth.login).toHaveBeenCalledTimes(1)
    expect(auth.login).toHaveBeenCalledWith({ email: 'jane@example.com', password: 'secret123' })
  })

  // AC-7: submitting the register form with the password visible sends the typed values
  it('sends the typed values on register while the password is visible', async () => {
    const { auth, user } = renderAuthPage('register')
    await fillForm(user, 'register', 'secret123')
    await user.click(screen.getByRole('button', { name: 'Show password' }))
    await user.click(screen.getByRole('button', { name: 'Register' }))
    expect(auth.register).toHaveBeenCalledTimes(1)
    expect(auth.register).toHaveBeenCalledWith({
      email: 'jane@example.com',
      password: 'secret123',
      fullName: 'Jane Doe',
    })
  })

  // AC-7: submitting the login form with the password masked still sends the typed credentials
  it('sends the typed credentials on login while the password is masked', async () => {
    const { auth, user } = renderAuthPage('login')
    await fillForm(user, 'login', 'secret123')
    await user.click(screen.getByRole('button', { name: 'Log in' }))
    expect(auth.login).toHaveBeenCalledWith({ email: 'jane@example.com', password: 'secret123' })
  })
})
