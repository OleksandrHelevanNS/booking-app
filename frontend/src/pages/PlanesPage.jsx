import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../auth.jsx'

const EMPTY = { model: '', registrationNumber: '', capacity: 180, airline: '' }

export default function PlanesPage() {
  const { isAdmin } = useAuth()
  const [planes, setPlanes] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(() => api.listPlanes().then(setPlanes).catch((e) => setError(e.message)), [])
  useEffect(() => { load() }, [load])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  function reset() {
    setForm(EMPTY)
    setEditingId(null)
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    const payload = { ...form, capacity: Number(form.capacity) }
    try {
      if (editingId) await api.updatePlane(editingId, payload)
      else await api.createPlane(payload)
      reset()
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function remove(id) {
    if (!confirm('Delete this plane?')) return
    setError('')
    try {
      await api.deletePlane(id)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  function edit(p) {
    setEditingId(p.id)
    setForm({ model: p.model, registrationNumber: p.registrationNumber, capacity: p.capacity, airline: p.airline })
  }

  return (
    <div className="page">
      <h1>Planes</h1>
      {error && <p className="error">{error}</p>}

      {isAdmin ? (
        <form onSubmit={submit} className="card form grid">
          <label>Model<input value={form.model} onChange={set('model')} required placeholder="Boeing 737-800" /></label>
          <label>Registration<input value={form.registrationNumber} onChange={set('registrationNumber')} required placeholder="UR-PSA" /></label>
          <label>Capacity<input type="number" min="1" max="1000" value={form.capacity} onChange={set('capacity')} required /></label>
          <label>Airline<input value={form.airline} onChange={set('airline')} required placeholder="UIA" /></label>
          <div className="actions">
            <button>{editingId ? 'Save' : 'Add plane'}</button>
            {editingId && <button type="button" className="secondary" onClick={reset}>Cancel</button>}
          </div>
        </form>
      ) : (
        <p className="muted">Only admins can add or edit planes.</p>
      )}

      <table>
        <thead>
          <tr><th>Model</th><th>Registration</th><th>Capacity</th><th>Airline</th>{isAdmin && <th />}</tr>
        </thead>
        <tbody>
          {planes.map((p) => (
            <tr key={p.id}>
              <td>{p.model}</td><td>{p.registrationNumber}</td><td>{p.capacity}</td><td>{p.airline}</td>
              {isAdmin && (
                <td className="row-actions">
                  <button className="link" onClick={() => edit(p)}>Edit</button>
                  <button className="link danger" onClick={() => remove(p.id)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
          {planes.length === 0 && <tr><td colSpan={5} className="muted">No planes yet.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
