import type {
  AuthResponse, Health, LoginRequest, Plane, PlaneRequest, RegisterRequest, Ticket, TicketRequest, User,
} from './types'

// Empty by default: same origin in prod, Vite proxy in dev.
// Set VITE_API_URL only if the frontend is hosted separately from the backend.
const BASE: string = import.meta.env.VITE_API_URL ?? ''
const TOKEN_KEY = 'booking.token'

export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (t: string): void => localStorage.setItem(TOKEN_KEY, t),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface ErrorBody {
  detail?: string
  message?: string
  error?: string
}

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
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
  if (res.status === 204) return undefined as T

  const data: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    const err = (data ?? {}) as ErrorBody
    const msg = err.detail || err.message || err.error || `Request failed (${res.status})`
    throw new ApiError(res.status, msg)
  }
  return data as T
}

export const api = {
  health: () => request<Health>('GET', '/api/health'),

  register: (data: RegisterRequest) => request<AuthResponse>('POST', '/api/auth/register', data),
  login: (data: LoginRequest) => request<AuthResponse>('POST', '/api/auth/login', data),
  me: () => request<User>('GET', '/api/auth/me'),

  listPlanes: () => request<Plane[]>('GET', '/api/planes'),
  createPlane: (data: PlaneRequest) => request<Plane>('POST', '/api/planes', data),
  updatePlane: (id: number, data: PlaneRequest) => request<Plane>('PUT', `/api/planes/${id}`, data),
  deletePlane: (id: number) => request<void>('DELETE', `/api/planes/${id}`),

  listTickets: () => request<Ticket[]>('GET', '/api/tickets'),
  createTicket: (data: TicketRequest) => request<Ticket>('POST', '/api/tickets', data),
  updateTicket: (id: number, data: TicketRequest) => request<Ticket>('PUT', `/api/tickets/${id}`, data),
  deleteTicket: (id: number) => request<void>('DELETE', `/api/tickets/${id}`),
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}
