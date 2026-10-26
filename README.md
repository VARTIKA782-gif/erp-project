# ERP Project

Academic administration portal with a React frontend and an Express/MongoDB backend.

## Requirements

- Node.js
- MongoDB

## Setup

Configure the backend first:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Edit `backend/.env` with a private MongoDB connection string, a unique admin username and password, and a long random JWT secret. Do not commit this file.

Seed the database and start the backend:

```powershell
npm run seed
npm run dev
```

`npm run seed` clears the existing application collections before inserting sample data and the configured admin account. Use it only with a database you are prepared to reset.

In a separate terminal, start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

The Vite development server proxies `/api` requests to `http://localhost:5001`. Set the backend `PORT` to `5001` in `backend/.env` to use the included proxy configuration.
