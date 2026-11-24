import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { api, errorMessage } from '../api'
import { useAuth } from '../useAuth'
import type { Plane } from '../types'

/** Form state keeps raw input strings; converted to PlaneRequest on submit. */
interface PlaneForm {
  model: string
  registrationNumber: string
  capacity: string
  airline: string
}

const EMPTY: PlaneForm = { model: '', registrationNumber: '', capacity: '180', airline: '' }

export default function PlanesPage() {
  const { isAdmin } = useAuth()
  const [planes, setPlanes] = useState<Plane[]>([])
  const [form, setForm] = useState<PlaneForm>(EMPTY)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    api.listPlanes().then(setPlanes).catch((e: unknown) => setError(errorMessage(e)))
  }, [])
  useEffect(() => { load() }, [load])

  const set = (k: keyof PlaneForm) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value })

  function reset() {
    setForm(EMPTY)
    setEditingId(null)
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const payload = { ...form, capacity: Number(form.capacity) }
    try {
      if (editingId !== null) await api.updatePlane(editingId, payload)
      else await api.createPlane(payload)
      reset()
      load()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  async function remove(id: number) {
    if (!confirm('Delete this plane?')) return
    setError('')
    try {
      await api.deletePlane(id)
      load()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  function edit(p: Plane) {
    setEditingId(p.id)
    setForm({ model: p.model, registrationNumber: p.registrationNumber, capacity: String(p.capacity), airline: p.airline })
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
            <button>{editingId !== null ? 'Save' : 'Add plane'}</button>
            {editingId !== null && <button type="button" className="secondary" onClick={reset}>Cancel</button>}
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
