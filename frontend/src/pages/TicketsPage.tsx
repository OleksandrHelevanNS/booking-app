import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { api, errorMessage } from '../api'
import { useAuth } from '../useAuth'
import type { Plane, Ticket, TicketRequest } from '../types'

/** Form state keeps raw input strings; converted to TicketRequest on submit. */
type TicketForm = { [K in keyof TicketRequest]: string }

const EMPTY: TicketForm = {
  planeId: '', flightNumber: '', origin: '', destination: '',
  departureTime: '', seatNumber: '', passengerName: '', price: '',
}

const fmt = (iso: string) => new Date(iso).toLocaleString()

export default function TicketsPage() {
  const { isAdmin, user } = useAuth()
  const emptyForm = useCallback((): TicketForm => ({ ...EMPTY, passengerName: user?.fullName ?? '' }), [user])

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [planes, setPlanes] = useState<Plane[]>([])
  const [form, setForm] = useState<TicketForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    Promise.all([api.listTickets(), api.listPlanes()])
      .then(([t, p]) => { setTickets(t); setPlanes(p) })
      .catch((e: unknown) => setError(errorMessage(e)))
  }, [])
  useEffect(() => { load() }, [load])

  const set = (k: keyof TicketForm) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value })

  function reset() {
    setForm(emptyForm())
    setEditingId(null)
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const payload: TicketRequest = { ...form, planeId: Number(form.planeId), price: Number(form.price) }
    try {
      if (editingId !== null) await api.updateTicket(editingId, payload)
      else await api.createTicket(payload)
      reset()
      load()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  async function remove(id: number) {
    if (!confirm('Delete this ticket?')) return
    setError('')
    try {
      await api.deleteTicket(id)
      load()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  function edit(t: Ticket) {
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
            <button>{editingId !== null ? 'Save' : 'Book ticket'}</button>
            {editingId !== null && <button type="button" className="secondary" onClick={reset}>Cancel</button>}
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
