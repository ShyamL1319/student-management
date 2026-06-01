# Attendance Module (Backend)

Purpose

Provides APIs to record and report attendance for Students, Teachers, and Staff.

Endpoints

- `POST /attendances` — Create attendance
- `GET /attendances` — List attendance (filters: date, attendeeType, attendeeId, status, school, class, section)
- `GET /attendances/daily-report` — Daily summary
- `GET /attendances/monthly-report` — Monthly summary
- `GET /attendances/:id` — Get a record
- `PATCH /attendances/:id` — Update
- `DELETE /attendances/:id` — Delete

Models

- `Attendance` schema located at `backend/src/attendances/schemas/attendance.schema.ts`.

Notes

- Endpoints are protected by `JwtAuthGuard` and `RolesGuard`.
- Indexes added for performant queries by `attendeeType`, `attendeeId`, and `date`.
- Add migrations or seed data as needed for production.
# Attendances Module (Backend)

Overview

The Attendances module provides CRUD and reporting APIs for Student, Teacher, and Staff attendance.

Location

- Module: `backend/src/attendances/attendances.module.ts`
- Controller: `backend/src/attendances/attendances.controller.ts`
- Service: `backend/src/attendances/attendances.service.ts`
- Schema: `backend/src/attendances/schemas/attendance.schema.ts`
- DTOs: `backend/src/attendances/dto/`

API Endpoints

- `POST /attendances` — create attendance (body: `CreateAttendanceDto`)
- `GET /attendances` — list with filters (pagination support)
- `GET /attendances/:id` — get single record
- `PATCH /attendances/:id` — update record
- `DELETE /attendances/:id` — delete record
- `GET /attendances/daily-report` — daily summary (query: `date`, `attendeeType`, `attendeeId`)
- `GET /attendances/monthly-report` — monthly summary (query: `month`, `year`, `attendeeType`, `attendeeId`)

Notes

- Routes are protected by JWT + RolesGuard; ensure proper roles when calling from frontend.
- The schema enforces a unique index for `(attendeeType, attendeeId, date)` to prevent duplicate daily records.
- Tests: unit and e2e specs are under the same module directory.
