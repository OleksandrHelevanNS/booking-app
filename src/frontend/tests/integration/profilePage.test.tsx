import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../../src/App.tsx'
import { AuthProvider } from '../../src/auth.tsx'
import type { Role } from '../../src/types'

const ROUTE = '/profile'

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function stubApi(role: Role | null) {
  if (role) localStorage.setItem('booking.token', 'test-token')
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.endsWith('/api/health')) {
        return json({ status: 'UP', database: 'UP', timestamp: '2026-11-24T00:00:00Z' })
      }
      if (url.endsWith('/api/auth/me') && role) {
        return json({ id: 1, email: `${role.toLowerCase()}@example.com`, fullName: `Test ${role}`, role })
      }
      return json({ message: 'Unauthorized' }, 401)
    }),
  )
}

function renderAt(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  )
}

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.unstubAllGlobals()
})

describe('Profile page', () => {
  // /add-page: a USER session sees the Profile page at /profile
  it('is shown to a logged-in USER', async () => {
    stubApi('USER')
    renderAt(ROUTE)
    expect(await screen.findByTestId('profile-page')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Profile' })).toBeInTheDocument()
  })

  // /add-page: an ADMIN session sees the Profile page at /profile
  it('is shown to a logged-in ADMIN', async () => {
    stubApi('ADMIN')
    renderAt(ROUTE)
    expect(await screen.findByTestId('profile-page')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Profile' })).toBeInTheDocument()
  })

  // /add-page: an anonymous session is redirected to /login and the page isn't rendered
  it('redirects an anonymous session to the login page', async () => {
    stubApi(null)
    renderAt(ROUTE)
    expect(await screen.findByRole('heading', { level: 1, name: 'Log in' })).toBeInTheDocument()
    expect(screen.queryByTestId('profile-page')).not.toBeInTheDocument()
  })
})
