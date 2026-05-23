# Grammar Correction Test Platform — PurpleZone

A full-stack MERN application for grammar correction assessment with JWT auth, MongoDB storage, and a glassmorphism UI.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + React Router
- **Backend**: Node.js + Express.js + MongoDB + Mongoose + JWT + bcryptjs

## Project Structure

```
PURPLEZONE_ASSESMENT/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/seed.js
│   ├── server.js
│   ├── .env
│   └── package.json
└── frontend/
    ├── public/images/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   └── services/
    ├── tailwind.config.js
    └── package.json
```

## Prerequisites

- Node.js v18+
- MongoDB running locally on port 27017

## Setup & Run

### 1. Backend

```bash
cd backend
npm install
# MongoDB must be running: mongod
npm run dev
# Server starts at http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# App opens at http://localhost:5173
```

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | Public | Register new user |
| POST | /api/auth/login | Public | Login user |
| GET | /api/statements | Protected | Get all statements |
| POST | /api/submission | Protected | Submit corrections |
| GET | /api/result/:userId | Protected | Get user results |

## Environment Variables (backend/.env)

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/purplezone
JWT_SECRET=purplezone_secret_key_2024
NODE_ENV=development
```

## App Flow

1. `/login` — Register or login (JWT stored in localStorage)
2. `/test` — Read instructions, then view grammar statements one by one
3. `/edit` — Write corrections for all statements and submit
4. `/result` — View accuracy score, breakdown, and comparison cards

The database auto-seeds 3 sample grammar statements on first run.
