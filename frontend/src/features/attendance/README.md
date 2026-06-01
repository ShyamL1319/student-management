# Attendance Feature (Frontend)

Overview

This folder contains the UI pages and components for managing attendance (student, teacher, staff).

Pages

- `AttendancePage.tsx` — Main page with tabs for Records and Reports. Supports marking/editing attendance, daily and monthly reports.

API

- Uses `frontend/src/api/attendances/attendanceAPI.ts` to call backend endpoints:
  - `GET /attendances` — list records
  - `POST /attendances` — create record
  - `PATCH /attendances/:id` — update record
  - `DELETE /attendances/:id` — delete record
  - `GET /attendances/daily-report` — daily summary
  - `GET /attendances/monthly-report` — monthly summary

Integration

- Route registered at `/attendances` in `frontend/src/App.tsx`.
- Sidebar item added in `frontend/src/components/common/Sidebar.tsx` (RBAC controlled via `restricted` property).

Notes

- The page uses `react-query` for data fetching and optimistic updates.
- Ensure the user is authenticated; requests include `accessToken` via global API interceptor.
