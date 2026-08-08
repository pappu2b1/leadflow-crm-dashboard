# LeadFlow CRM

A full-stack lead management dashboard for capturing prospects, managing sales activity, scheduling follow-ups, and understanding pipeline performance. The repository is designed as a portfolio project with synthetic demo data and a production-minded API.

**Live Demo:** Not deployed yet

## Overview

LeadFlow CRM combines a responsive React admin experience with an authenticated Express and MongoDB API. It keeps lead records, activity notes, follow-up queues, dashboard metrics, and business reports in one application.

## Problem

Small sales teams often track leads across spreadsheets and disconnected messages, making ownership, next actions, and conversion reporting difficult.

## Solution

LeadFlow provides a focused workspace for the full lead lifecycle while preserving a simple single-admin demo model that is easy to run and review locally.

## Features

- JWT admin login, protected routes, current-user lookup, and server-backed profile settings
- Lead create, read, update, delete, search, filter, sort, assignment, budget, notes, and pagination
- Dedicated paginated follow-up API that excludes closed leads
- Dashboard counters for status, daily/monthly volume, upcoming, and overdue work
- Reports for conversion, average budget, popular services, sources, priorities, statuses, and monthly growth
- Responsive tables/cards with loading, empty, error, confirmation, and toast states
- Health, version, and database readiness endpoints
- Synthetic seed data and API integration tests

## Tech Stack

- Frontend: React 18, Vite 5, Tailwind CSS, React Router, Axios, Recharts, Lucide, React Hot Toast
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Helmet, CORS, rate limiting, Morgan
- Testing: Node test runner, Supertest, MongoDB Memory Server

## Architecture

```text
Browser -> React/Vite frontend -> Axios + JWT -> Express API -> Mongoose -> MongoDB
```

```text
backend/src/        API app, server, models, routes, controllers, middleware, seed data
frontend/src/       pages, layout, reusable components, auth context, API client
backend/test/       isolated integration tests using an in-memory MongoDB
```

## Frontend Setup

```bash
cd frontend
npm ci
copy .env.example .env
npm run dev
```

The frontend defaults to `http://localhost:5173`.

## Backend Setup

```bash
cd backend
npm ci
copy .env.example .env
npm run seed
npm run dev
```

The backend defaults to `http://localhost:5000` and requires a reachable MongoDB instance for normal startup.

From the repository root, `npm run install:all`, `npm run build`, `npm run lint`, and `npm test` provide convenience workflows.

## Environment Variables

Backend (`backend/.env`):

| Variable | Purpose |
| --- | --- |
| `PORT` | API port |
| `MONGO_URI` | MongoDB connection URI |
| `JWT_SECRET` | Private JWT signing secret |
| `JWT_EXPIRES_IN` | Token lifetime |
| `CLIENT_URL` | Allowed browser origin |
| `DEMO_ADMIN_EMAIL` | Synthetic seeded admin email |
| `DEMO_ADMIN_PASSWORD` | Synthetic seeded admin password |

Frontend (`frontend/.env`): `VITE_API_URL` sets the API base URL. Copy the committed `.env.example` files and replace placeholders locally. Never commit real secrets.

## Demo Data

`npm run seed` idempotently ensures one synthetic demo admin and 15 fictional leads without deleting or overwriting unrelated records. Set `DEMO_ADMIN_PASSWORD` securely in the environment before running it.

## API Overview

- Public: `GET /api/health`, `GET /api/version`, `GET /api/health/database`, `POST /api/auth/login`
- Auth: `GET /api/auth/me`, `PUT /api/auth/profile`
- Leads: `GET|POST /api/leads`, `GET|PUT|DELETE /api/leads/:id`
- Notes: `GET|POST /api/leads/:id/notes`
- Follow-ups: `GET /api/leads/follow-ups?type=upcoming|today|overdue&page=1&limit=20`
- Analytics: `GET /api/stats/dashboard`, `GET /api/stats/reports`

## Authentication

Login returns a bearer token used by the frontend for protected API requests. The current demo stores it in local storage. Use secure HTTP-only cookie sessions or a hardened token strategy for a public production deployment.

## Security

Helmet, allow-listed CORS, JSON size limits, rate limiting, password hashing, JWT verification, allow-listed profile fields, input validation, and production-safe error responses are enabled. `.env`, logs, dependency folders, builds, and coverage are ignored.

## Testing

```bash
cd backend
npm test
```

Tests use only synthetic records in an ephemeral in-memory MongoDB and do not access the configured development or production database.

## Screenshots

Real screenshots are not included yet. See [`docs/screenshots/README.md`](docs/screenshots/README.md) for the capture checklist.

## Deployment

Not deployed yet. The backend is prepared for a Render Web Service with the following settings:

| Setting | Value |
| --- | --- |
| Service name | `leadflow-crm-api` |
| Repository | `pappu2b1/leadflow-crm-dashboard` |
| Branch | `main` |
| Root directory | `backend` |
| Runtime | Node |
| Build command | `npm ci` |
| Start command | `npm start` |

Set `NODE_ENV=production`, `MONGO_URI`, and `JWT_SECRET` in Render. Render supplies `PORT` automatically. `CLIENT_URL` may remain unset for backend-only verification; production browser origins are denied until it is set to the exact deployed frontend origin.

Use a dedicated MongoDB Atlas database named `leadflow_crm` and an application user with `readWrite` permission only on that database. Allow-list the Render service outbound IP/CIDR ranges rather than retaining broad public network access. Configure `DEMO_ADMIN_PASSWORD` securely before running `npm run seed`; the seed is idempotent and non-destructive.

## Known Limitations

- Single `admin` role; no teams or fine-grained permissions
- Access token is stored in browser local storage and has no refresh-token flow
- No automated email/WhatsApp delivery, reminders, imports, exports, or audit trail
- Follow-up screen currently requests up to 100 server-filtered records; API pagination metadata is available for future UI controls
- Deployment configuration and real screenshots remain to be added
- React Router 6 and Vite 5 require planned major-version upgrades to clear the remaining npm advisories

## Future Improvements

Add secure cookie authentication, refresh-token rotation, role permissions, audit logs, follow-up notifications, CSV import/export, richer pipeline stages, and deployment-specific observability.
