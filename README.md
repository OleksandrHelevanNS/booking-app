# Booking App

Spring Boot 4 (Java 21) backend + React (Vite) frontend for booking plane tickets.
In production both are shipped as one Docker image: Spring Boot serves the built React app.

## Structure

```
src/backend/    Spring Boot API (JPA, Spring Security + JWT)
src/frontend/   React + Vite + React Router
Dockerfile  Multi-stage build: frontend -> backend jar -> JRE runtime
render.yaml Render Blueprint (web service + Postgres)
```

## Run locally

Backend (uses a file-based H2 database in `src/backend/data/`):

```bash
cd src/backend
./mvnw spring-boot:run        # Windows: mvnw.cmd spring-boot:run
```

Frontend (dev server on http://localhost:5173, proxies `/api` to :8080):

```bash
cd src/frontend
npm install
npm run dev
```

Or the full production image:

```bash
docker build -t booking-app .
docker run -p 8080:8080 -e SPRING_PROFILES_ACTIVE=default \
  -e SPRING_DATASOURCE_URL='jdbc:h2:mem:booking;MODE=PostgreSQL' booking-app
```

## API

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/health` | public | `{"status":"UP","database":"UP"}`; 503 if DB is down |
| POST | `/api/auth/register` | public | `{email, password, fullName}` → `{token, user}` |
| POST | `/api/auth/login` | public | `{email, password}` → `{token, user}` |
| GET | `/api/auth/me` | JWT | current user |
| GET | `/api/planes`, `/api/planes/{id}` | JWT | |
| POST/PUT/DELETE | `/api/planes[/{id}]` | ADMIN | `{model, registrationNumber, capacity, airline}` |
| GET | `/api/tickets`, `/api/tickets/{id}` | JWT | users see own tickets, admins see all |
| POST/PUT/DELETE | `/api/tickets[/{id}]` | JWT | `{planeId, flightNumber, origin, destination, departureTime, seatNumber, passengerName, price}` |

Send the token as `Authorization: Bearer <token>`.
**The first registered user becomes ADMIN.**

## Deploy to Render

1. Push this repo to GitHub/GitLab.
2. On Render: **New → Blueprint**, pick the repo. Render reads `render.yaml` and creates:
   - `booking-app` web service (Docker, health check on `/api/health`)
   - `booking-db` Postgres database, wired in via `DB_*` env vars
   - a random `JWT_SECRET`
3. Wait for the deploy, open the service URL and register the first (admin) user.

Environment variables used by the backend:

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | 8080 | set by Render automatically |
| `SPRING_PROFILES_ACTIVE` | – | `prod` switches to Postgres |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | – | Postgres connection (prod) |
| `JWT_SECRET` | dev value | token signing key — must be set in prod |
| `JWT_EXPIRATION_MINUTES` | 1440 | token lifetime |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | only needed if frontend is hosted separately |

Notes on the free plan: the web service sleeps after inactivity (first request takes ~1 min),
and the free Postgres database expires after 30 days.
Schema is managed by `ddl-auto: update`; switch to Flyway/Liquibase before real production use.
