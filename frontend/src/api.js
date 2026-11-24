// Empty by default: same origin in prod, Vite proxy in dev.
// Set VITE_API_URL only if the frontend is hosted separately from the backend.
const BASE = import.meta.env.VITE_API_URL ?? ''
const TOKEN_KEY = 'booking.token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = tokenStore.get()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (res.status === 401 && token) {
    tokenStore.clear()
    window.dispatchEvent(new Event('auth:logout'))
  }
  if (res.status === 204) return null

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = data?.detail || data?.message || data?.error || `Request failed (${res.status})`
    throw new ApiError(res.status, msg)
  }
  return data
}

export const api = {
  health: () => request('GET', '/api/health'),

  register: (data) => request('POST', '/api/auth/register', data),
  login: (data) => request('POST', '/api/auth/login', data),
  me: () => request('GET', '/api/auth/me'),

  listPlanes: () => request('GET', '/api/planes'),
  createPlane: (data) => request('POST', '/api/planes', data),
  updatePlane: (id, data) => request('PUT', `/api/planes/${id}`, data),
  deletePlane: (id) => request('DELETE', `/api/planes/${id}`),

  listTickets: () => request('GET', '/api/tickets'),
  createTicket: (data) => request('POST', '/api/tickets', data),
  updateTicket: (id, data) => request('PUT', `/api/tickets/${id}`, data),
  deleteTicket: (id) => request('DELETE', `/api/tickets/${id}`),
}
