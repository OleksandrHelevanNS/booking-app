export type Role = 'USER' | 'ADMIN'

export interface User {
  id: number
  email: string
  fullName: string
  role: Role
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest extends LoginRequest {
  fullName: string
}

export interface Health {
  status: 'UP' | 'DOWN'
  database: 'UP' | 'DOWN'
  timestamp: string
}

export interface Plane {
  id: number
  model: string
  registrationNumber: string
  capacity: number
  airline: string
}

export type PlaneRequest = Omit<Plane, 'id'>

export interface Ticket {
  id: number
  planeId: number
  planeModel: string
  planeRegistration: string
  flightNumber: string
  origin: string
  destination: string
  /** ISO local date-time, e.g. 2026-12-01T10:30:00 */
  departureTime: string
  seatNumber: string
  passengerName: string
  price: number
  ownerEmail: string
}

export interface TicketRequest {
  planeId: number
  flightNumber: string
  origin: string
  destination: string
  departureTime: string
  seatNumber: string
  passengerName: string
  price: number
}
