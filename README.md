# Student Management System

A production-grade Student Management System scaffold with a NestJS API, MongoDB, JWT authentication, Swagger, React, Vite, Redux Toolkit, and Material UI.

## Apps

- `apps/api`: NestJS API with MongoDB/Mongoose, JWT auth, Swagger, response normalization, validation, guards, and student CRUD.
- `apps/web`: React + Vite frontend with Material UI, Redux Toolkit, protected routes, login, and student management UI.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Start MongoDB locally or set `MONGODB_URI` to your database.

4. Seed the first administrator:

```bash
npm run seed:admin
```

5. Start both apps:

```bash
npm run dev
```

API: `http://localhost:3000/api`
Swagger: `http://localhost:3000/docs`
Web: `http://127.0.0.1:5174`

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `PORT` | API port |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | JWT expiration, for example `1d` |
| `CORS_ORIGIN` | Allowed browser origin |
| `SEED_ADMIN_NAME` | Initial admin name |
| `SEED_ADMIN_EMAIL` | Initial admin email |
| `SEED_ADMIN_PASSWORD` | Initial admin password |
| `VITE_API_BASE_URL` | Frontend API base URL |

## API Contract

Successful responses:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

## Main Routes

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Login with email and password |
| `GET` | `/api/auth/me` | Get current authenticated user |
| `GET` | `/api/students` | List students with pagination and filters |
| `POST` | `/api/students` | Create a student |
| `GET` | `/api/students/:id` | Get student details |
| `PATCH` | `/api/students/:id` | Update a student |
| `DELETE` | `/api/students/:id` | Soft delete a student |

## Verification

```bash
npm run lint
npm run test
npm run build
```
