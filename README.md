# RFID Warehouse Management System

A full-stack warehouse operations application with a React dashboard and an Express REST API. It supports product and inventory management, RFID tag registration and scan matching, warehouse movements, reporting, activity logs, and role-based access for administrators, managers, and operators.

## Features

- Dashboard with inventory, RFID, and movement analytics
- Product catalog and RFID tag registration
- Stock-in, stock-out, transfer, and adjustment transactions
- RFID scanning with EPC normalization and pattern matching
- Warehouse movement history and low-stock monitoring
- CSV/printable reports and activity auditing
- JWT authentication and role-based permissions

## Technology

- Frontend: React 18, Vite, Material UI, Recharts, React Router, Axios
- Backend: Node.js, Express, Mongoose, JWT, bcryptjs
- Database: MongoDB, with an in-memory MongoDB fallback for local development

## Requirements

- Node.js 18 or newer and npm
- MongoDB (optional for local use; see Database notes below)

## Setup

From the project root, install dependencies:

```sh
npm run install:all
```

The backend reads configuration from `backend/.env`. The included `.env.example` is a starting point:

```sh
cp .env.example backend/.env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example backend/.env
```

Set `MONGODB_URI` to your MongoDB connection string and set `JWT_SECRET` to a unique secret. The checked-in example value is for local development only and must not be used in a deployed environment. If no MongoDB server is reachable, the backend attempts to start an in-memory database; its data is temporary and is lost when the server stops.

Start both applications from the project root:

```sh
npm run dev
```

Open the frontend at [http://localhost:3000](http://localhost:3000). The Vite development server proxies `/api` requests to the backend at `http://localhost:5000`. The backend health endpoint is [http://localhost:5000/api/health](http://localhost:5000/api/health).

Alternatively, run the backend and frontend separately in different terminals:

```sh
npm run dev --prefix backend
npm run dev --prefix frontend
```

Create a production frontend build with:

```sh
npm run build --prefix frontend
```

## Demo Accounts

When the configured database has no users, the backend automatically seeds sample data, including these local demo accounts:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@warehouse.com` | `admin123` |
| Warehouse Manager | `manager@warehouse.com` | `manager123` |
| Warehouse Operator | `operator@warehouse.com` | `operator123` |

These credentials are public sample credentials. Change or remove them before exposing the application to other users.

## Useful Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start backend and frontend together |
| `npm run backend` | Start the backend |
| `npm run frontend` | Start the frontend |
| `npm run build --prefix frontend` | Build the frontend for production |
| `npm run seed` | Clear existing application records and reseed sample data |

**Warning:** `npm run seed` deletes existing application records before inserting the sample dataset. Do not run it against data you need to keep.

## API Overview

The API runs on port `5000`. Login and the health check are public; operational routes require a bearer token. User-management routes are restricted to administrators.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Authenticate and receive a token |
| `GET` | `/api/auth/me` | Get the authenticated user |
| `GET` | `/api/health` | Check API status |
| `GET`, `POST` | `/api/products` | List or create products |
| `POST` | `/api/rfid/scan` | Submit an RFID scan |
| `POST` | `/api/inventory/stock-in` | Record incoming stock |
| `POST` | `/api/inventory/stock-out` | Record outgoing stock |
| `POST` | `/api/inventory/transfer` | Transfer stock between locations |
| `GET` | `/api/movements` | List product movements |
| `GET` | `/api/reports/dashboard` | Fetch dashboard analytics |
| `GET` | `/api/activity` | List activity records |

## Project Structure

```text
backend/    Express API, MongoDB models, routes, and services
frontend/   React application and Vite configuration
```
