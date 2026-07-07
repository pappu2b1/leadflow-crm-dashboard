# LeadFlow CRM - Lead Management Admin Dashboard

LeadFlow CRM is a premium, client-ready lead management admin dashboard built as a portfolio SaaS project. It helps businesses capture, manage, filter, update, follow up with, and report on sales leads from one professional admin panel.

## Features

- JWT-based admin login with protected dashboard routes
- Dashboard overview cards for total, new, contacted, qualified, converted, lost, today, and monthly leads
- Lead management table with search, status/priority/source filters, newest/oldest sorting, pagination, badges, and actions
- Add, view, edit, and delete lead workflows with validation and confirmation modal
- Lead profile page with call, email, WhatsApp, edit, delete, and latest-first activity notes
- Follow-up page with Today, Upcoming, and Overdue labels
- Analytics reports with Recharts for status, source, priority, monthly growth, and conversion summary
- Settings/profile page for demo admin details
- Loading, error, empty, success toast, and responsive mobile states
- MongoDB seed script with 15 clearly fictional sample leads

## Tech Stack

Frontend: React, Vite, Tailwind CSS, React Router, Lucide React, Recharts, Axios, React Hot Toast

Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Helmet, CORS, Morgan, Express Rate Limit

## Screens / Pages

- Login Page
- Dashboard Overview
- Leads List
- Add Lead
- View Lead Details
- Edit Lead
- Follow-ups
- Reports
- Settings/Profile
- 404 Not Found

## Project Structure

```text
LeadFlow-CRM-Dashboard/
  backend/
    src/
      config/
      controllers/
      data/
      middleware/
      models/
      routes/
      utils/
      server.js
  frontend/
    src/
      components/
      context/
      hooks/
      layouts/
      pages/
      services/
      utils/
```

## Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/leadflow_crm
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
DEMO_ADMIN_EMAIL=admin@leadflowcrm.com
DEMO_ADMIN_PASSWORD=Admin@12345
```

Create `frontend/.env` from `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

Do not commit real `.env` files.

## Demo Admin Login

Email: `admin@leadflowcrm.com`

Password: `Admin@12345`

This password is for demo/portfolio use only. Production deployments should use a stronger unique password and rotate secrets regularly.

## Installation

```bash
npm run install:all
```

Or install each app separately:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Seed Sample Data

Make sure MongoDB is running and `backend/.env` exists, then run:

```bash
npm run seed
```

This creates the demo admin and 15 fictional sample leads.

## Run Locally

Backend API:

```bash
npm run dev:backend
```

Frontend dashboard:

```bash
npm run dev:frontend
```

Open `http://localhost:5173`.

## Build

```bash
npm run build
```

## API Routes

Auth:

- `POST /api/auth/login`
- `GET /api/auth/me`

Leads:

- `GET /api/leads`
- `GET /api/leads/:id`
- `POST /api/leads`
- `PUT /api/leads/:id`
- `DELETE /api/leads/:id`

Notes:

- `GET /api/leads/:id/notes`
- `POST /api/leads/:id/notes`

Stats:

- `GET /api/stats/dashboard`
- `GET /api/stats/reports`

## Portfolio Use Case

This project is designed for agencies, IT companies, clinics, coaching centers, real estate teams, local service businesses, and B2B companies that need a polished admin dashboard for lead tracking and follow-up management.

## Production Improvements

- Add refresh tokens and secure HTTP-only cookie auth
- Add admin profile update APIs
- Add audit logs and role permissions
- Add CSV import/export
- Add email/WhatsApp provider integrations
- Add automated follow-up reminders
