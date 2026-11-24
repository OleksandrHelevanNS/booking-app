import { useEffect, useState } from 'react'
import { Link, Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { api } from './api'
import { useAuth } from './auth.jsx'
import AuthPage from './pages/AuthPage.jsx'
import PlanesPage from './pages/PlanesPage.jsx'
import TicketsPage from './pages/TicketsPage.jsx'

function HealthBadge() {
  const [status, setStatus] = useState('…')
  useEffect(() => {
    api.health().then((h) => setStatus(h.status)).catch(() => setStatus('DOWN'))
  }, [])
  return <span className={`badge ${status === 'UP' ? 'ok' : 'bad'}`}>API: {status}</span>
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <p className="muted">Loading…</p>
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { user, logout, isAdmin } = useAuth()

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">✈ Booking</Link>
        {user && (
          <nav>
            <NavLink to="/tickets">Tickets</NavLink>
            <NavLink to="/planes">Planes</NavLink>
          </nav>
        )}
        <div className="spacer" />
        <HealthBadge />
        {user ? (
          <span className="user">
            {user.fullName} {isAdmin && <span className="badge">ADMIN</span>}
            <button className="link" onClick={logout}>Log out</button>
          </span>
        ) : (
          <nav>
            <NavLink to="/login">Log in</NavLink>
            <NavLink to="/register">Register</NavLink>
          </nav>
        )}
      </header>

      <main>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/tickets" replace /> : <AuthPage mode="login" />} />
          <Route path="/register" element={user ? <Navigate to="/tickets" replace /> : <AuthPage mode="register" />} />
          <Route path="/tickets" element={<RequireAuth><TicketsPage /></RequireAuth>} />
          <Route path="/planes" element={<RequireAuth><PlanesPage /></RequireAuth>} />
          <Route path="*" element={<Navigate to={user ? '/tickets' : '/login'} replace />} />
        </Routes>
      </main>
    </div>
  )
}
