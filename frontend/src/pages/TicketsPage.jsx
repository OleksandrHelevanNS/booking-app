import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../auth.jsx'

const EMPTY = {
  planeId: '', flightNumber: '', origin: '', destination: '',
  departureTime: '', seatNumber: '', passengerName: '', price: '',
}

const fmt = (iso) => new Date(iso).toLocaleString()

export default function TicketsPage() {
  const { isAdmin, user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [planes, setPlanes] = useState([])
  const [form, setForm] = useState({ ...EMPTY, passengerName: user?.fullName ?? '' })
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    Promise.all([api.listTickets(), api.listPlanes()])
      .then(([t, p]) => { setTickets(t); setPlanes(p) })
      .catch((e) => setError(e.message))
  }, [])
  useEffect(() => { load() }, [load])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  function reset() {
    setForm({ ...EMPTY, passengerName: user?.fullName ?? '' })
    setEditingId(null)
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    const payload = { ...form, planeId: Number(form.planeId), price: Number(form.price) }
    try {
      if (editingId) await api.updateTicket(editingId, payload)
      else await api.createTicket(payload)
      reset()
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function remove(id) {
    if (!confirm('Delete this ticket?')) return
    setError('')
    try {
      await api.deleteTicket(id)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  function edit(t) {
    setEditingId(t.id)
    setForm({
      planeId: String(t.planeId), flightNumber: t.flightNumber, origin: t.origin, destination: t.destination,
      departureTime: t.departureTime.slice(0, 16), seatNumber: t.seatNumber,
      passengerName: t.passengerName, price: String(t.price),
    })
  }

  return (
    <div className="page">
      <h1>{isAdmin ? 'All tickets' : 'My tickets'}</h1>
      {error && <p className="error">{error}</p>}

      {planes.length === 0 ? (
        <p className="muted">No planes available yet{isAdmin ? ' — add one on the Planes page.' : '.'}</p>
      ) : (
        <form onSubmit={submit} className="card form grid">
          <label>Plane
            <select value={form.planeId} onChange={set('planeId')} required>
              <option value="">Select…</option>
              {planes.map((p) => <option key={p.id} value={p.id}>{p.model} ({p.registrationNumber})</option>)}
            </select>
          </label>
          <label>Flight<input value={form.flightNumber} onChange={set('flightNumber')} required maxLength={10} placeholder="PS101" /></label>
          <label>From<input value={form.origin} onChange={set('origin')} required placeholder="Kyiv" /></label>
          <label>To<input value={form.destination} onChange={set('destination')} required placeholder="Warsaw" /></label>
          <label>Departure<input type="datetime-local" value={form.departureTime} onChange={set('departureTime')} required /></label>
          <label>Seat<input value={form.seatNumber} onChange={set('seatNumber')} required maxLength={5} placeholder="12A" /></label>
          <label>Passenger<input value={form.passengerName} onChange={set('passengerName')} required /></label>
          <label>Price<input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} required /></label>
          <div className="actions">
            <button>{editingId ? 'Save' : 'Book ticket'}</button>
            {editingId && <button type="button" className="secondary" onClick={reset}>Cancel</button>}
          </div>
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>Flight</th><th>Route</th><th>Departure</th><th>Plane</th><th>Seat</th>
            <th>Passenger</th><th>Price</th>{isAdmin && <th>Owner</th>}<th />
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.id}>
              <td>{t.flightNumber}</td>
              <td>{t.origin} → {t.destination}</td>
              <td>{fmt(t.departureTime)}</td>
              <td>{t.planeModel} <span className="muted">{t.planeRegistration}</span></td>
              <td>{t.seatNumber}</td>
              <td>{t.passengerName}</td>
              <td>{Number(t.price).toFixed(2)}</td>
              {isAdmin && <td className="muted">{t.ownerEmail}</td>}
              <td className="row-actions">
                <button className="link" onClick={() => edit(t)}>Edit</button>
                <button className="link danger" onClick={() => remove(t.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {tickets.length === 0 && <tr><td colSpan={9} className="muted">No tickets yet.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
