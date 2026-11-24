import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { errorMessage } from '../api'
import { useAuth } from '../useAuth'
import type { RegisterRequest } from '../types'

interface Props {
  mode: 'login' | 'register'
}

export default function AuthPage({ mode }: Props) {
  const isRegister = mode === 'register'
  const { login, register } = useAuth()
  const [form, setForm] = useState<RegisterRequest>({ email: '', password: '', fullName: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k: keyof RegisterRequest) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value })

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (isRegister) await register(form)
      else await login({ email: form.email, password: form.password })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card narrow">
      <h1>{isRegister ? 'Create account' : 'Log in'}</h1>
      <form onSubmit={submit} className="form">
        {isRegister && (
          <label>Full name
            <input value={form.fullName} onChange={set('fullName')} required maxLength={100} />
          </label>
        )}
        <label>Email
          <input type="email" value={form.email} onChange={set('email')} required autoComplete="email" />
        </label>
        <label>Password
          <input type="password" value={form.password} onChange={set('password')} required
            minLength={isRegister ? 6 : undefined}
            autoComplete={isRegister ? 'new-password' : 'current-password'} />
        </label>
        {error && <p className="error">{error}</p>}
        <button disabled={busy}>{busy ? '…' : isRegister ? 'Register' : 'Log in'}</button>
      </form>
      <p className="muted">
        {isRegister
          ? <>Already have an account? <Link to="/login">Log in</Link></>
          : <>No account yet? <Link to="/register">Register</Link></>}
      </p>
      {isRegister && <p className="muted small">The first registered user becomes an admin.</p>}
    </div>
  )
}
