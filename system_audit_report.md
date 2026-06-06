# School Management System (SMS) — Complete Technical Audit Report

This document details the architectural, database, security, and functional gaps in the School Management System (SMS) and outlines a phased roadmap to connect frontend placeholders with production-grade backend APIs.

---

## 1. Executive Summary

A comprehensive audit of the SMS project reveals a robust database schema foundation and a high-fidelity, polished frontend user interface. However, there is a critical disconnect between the frontend presentation layers and the backend services:

1. **Dashboard Placeholders:** While the Admin and Super Admin dashboards load simple statistical widgets from the backend (`/analytics/dashboard`), the core analytical charts, workflow listings, approvals tables, and checklists are driven by hardcoded mock data in the React codebase. The Teacher, Student, Parent, and Staff dashboards are 100% mocked and contain no backend query logic.
2. **Critical Security Vulnerabilities:**
   - **Bypassed Multi-Tenancy:** The frontend generates and attaches `X-Tenant-ID` headers based on the browser's hostname. However, the NestJS backend lacks any middleware, interceptors, or decorators to parse this header, resulting in **zero tenant isolation**. Data from all schools is stored and queried globally in a single MongoDB instance.
   - **Missing Rate Limiting:** No Throttler module is configured on the backend, exposing authentication and public API endpoints to brute-force and DoS attacks.
   - **Missing Security Headers:** Helmet middleware is not registered in `main.ts`.
3. **Architecture Mismatches (Parent & Staff):** The Parent role is mocked in the frontend layout and routing, but does not exist in the backend schema (`RoleEnum` or `User` discriminators). Parent data was left as a flat string inside the Student document during user unification, meaning **parents cannot log in**.
4. **Completely Missing Modules:** Major business modules presented in the UI — including Admissions, Assignments, Leaves, Messaging/Chat, and HR Task Checklists — have no corresponding database collections, schemas, services, or APIs.
5. **Technical Debt & Duplicate API Clients:** The fees module uses a duplicate raw `fetch` client (`feesApi.ts`) that bypasses the global Axios interceptor, causing fee requests to **miss the tenant ID header completely**.

---

## 2. Dashboard Audit

The following table reviews every dashboard in the frontend and maps out its widgets, current status, and backend requirements.

| Dashboard | Widget / Feature Name | Current Status | Required Data Source | Required Database Tables | Required API Endpoints | Required Backend Logic | Permissions | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | MRR / ARR Cards | **Static** | Billing system | `invoices`, `schools` | `/analytics/superadmin/revenue` | Calculate MRR/ARR from active tenant subscription pricing | `SUPER_ADMIN` | **High** |
| **Super Admin** | Active Tenants Card | **Static** | School records | `schools` | `/schools` | Count of schools where `isActive: true` | `SUPER_ADMIN` | **Medium** |
| **Super Admin** | Uptime Score Card | **Static** | Monitoring logs | None (External API) | `/analytics/system-health` | Fetch uptime score from ping logs | `SUPER_ADMIN` | **Low** |
| **Super Admin** | MRR Trend AreaChart | **Static** | Invoice payments | `invoices` | `/analytics/superadmin/revenue-trends` | Aggregate payment amounts grouped by month | `SUPER_ADMIN` | **Medium** |
| **Super Admin** | AI Operations Co-Pilot | **Static** | System audit logs | `auditlogs`, `users` | `/analytics/ai-recommendations` | Identify tenants with no active logins or high replica lag | `SUPER_ADMIN` | **Low** |
| **Super Admin** | Tenant Directory Tab | **Static** | School tenants registry | `schools`, `users` | `/schools` (CRUD) | Query schools with aggregated user and storage metrics | `SUPER_ADMIN` | **High** |
| **Super Admin** | Subscription Plans Tab | **Static** | SaaS Plan configurations | `plans` (New) | `/plans` (CRUD) | List available subscription models and Stripe links | `SUPER_ADMIN` | **Medium** |
| **Super Admin** | Infrastructure Uptime | **Static** | System stats | None | `/analytics/infra-uptime` | Retrieve host CPU, memory, and queue worker status | `SUPER_ADMIN` | **Low** |
| **Super Admin** | SOC Audit Logs | **Partial** | Security events | `auditlogs` | `/audit-logs` | Fetch system audit trails filtered by type/severity | `SUPER_ADMIN` | **High** |
| **Super Admin** | Integrations Settings | **Static** | Config database | `settings` / `configs` | `/settings/integrations` | Get/Set toggles for Stripe, Twilio, Zoom, Google Workspace | `SUPER_ADMIN` | **High** |
| **Admin** | Total Users / Students / Teachers / Classes Stats | **Dynamic** | Analytics summary | `users`, `classes` | `/analytics/dashboard` | Count of entities for the specific tenant school | `ADMIN` | **Low** |
| **Admin** | Tuition Target AreaChart | **Static** | Invoice collections | `fee-collections`, `invoices` | `/analytics/financial-trends` | Monthly aggregates of collected vs. projected payments | `ADMIN` | **High** |
| **Admin** | Subject Averages Chart | **Static** | Marks records | `marks`, `subjects` | `/analytics/academic-performance` | Average marks scored, grouped by academic subjects | `ADMIN` | **High** |
| **Admin** | Registry Stats List | **Static** | System indicators | `users`, `marks` | `/analytics/stats` | Compute passing rates and teacher-student ratio | `ADMIN` | **Medium** |
| **Admin** | Approvals & Workflow Hub | **Static** | Transaction tables | `leaverequests` (New), `feewaivers` (New), `admissions` (New) | `/workflows/...` (New) | State machine handlers for approvals (Approve / Reject) | `ADMIN` | **Critical** |
| **Admin** | Audited Actions Feed | **Dynamic** | Audit logger | `audit-logs` | `/analytics/dashboard` | Fetch recent tenant audit logs | `ADMIN` | **Low** |
| **Teacher** | Classes Today Stat | **Static** | Timetables | `timetables` | `/timetables/today` | Count allocated timetable classes for current date/teacher | `TEACHER` | **High** |
| **Teacher** | Total Students Stat | **Static** | Class registries | `users` | `/teachers/students-count` | Sum of students in classes assigned to the teacher | `TEACHER` | **Medium** |
| **Teacher** | Pending Reviews Stat | **Static** | Assignment submissions | `assignments` (New) | `/assignments/pending-review` | Count submissions with state `evaluating` | `TEACHER` | **High** |
| **Teacher** | Today's Teaching Schedule | **Static** | Timetables | `timetables` | `/timetables/today` | List active, completed, and upcoming class blocks | `TEACHER` | **High** |
| **Teacher** | Performance Distribution | **Static** | Student grades | `marks` | `/analytics/marks-distribution` | Count of student grades grouped by letter bracket (A, B...) | `TEACHER` | **Medium** |
| **Teacher** | AI-Assisted Co-Pilot | **Static** | LLM integration | None | `/ai/generate-content` | Feed prompt with curriculum metadata to Gemini API | `TEACHER` | **Medium** |
| **Teacher** | Student Requests & Leaves | **Static** | Student leave table | `leaverequests` (New) | `/leaverequests` (CRUD) | List pending leaves submitted by teacher's classes | `TEACHER` | **High** |
| **Teacher** | Learning Resources list | **Static** | Materials folder | `resources` (New) | `/resources` (CRUD) | Upload notes/slides (AWS S3) and link to class | `TEACHER` | **Medium** |
| **Teacher** | Record Attendance Dialog | **Static** | Attendance records | `attendances` | `/attendances/bulk-record` | Write bulk attendance status logs for class session | `TEACHER` | **Critical** |
| **Student** | Profile Hero Header | **Static** | Profile details | `users` | `/auth/profile` | Current student details, roll number, section | `STUDENT` | **High** |
| **Student** | Attendance Rate Card | **Static** | Attendance records | `attendances` | `/analytics/student/attendance` | Math on student attendance logs (attended/total) | `STUDENT` | **High** |
| **Student** | Current GPA / Growth | **Static** | Grade sheets | `marks` | `/analytics/student/gpa` | Sum GPA from class marks and fetch trend list | `STUDENT` | **High** |
| **Student** | Upcoming Exams / Schedule | **Static** | Exam timetables | `exams` | `/exams/upcoming` | Query exam dates and venue countdowns | `STUDENT` | **High** |
| **Student** | Today's Schedule | **Static** | Timetables | `timetables` | `/timetables/today` | Get today's classes for student's class ID | `STUDENT` | **High** |
| **Student** | Fees & Payments Card | **Static** | Invoices ledger | `invoices`, `receipts` | `/fee-collections/student/outstanding`| Sum outstanding payments, pull collections history | `STUDENT` | **High** |
| **Parent** | Registered Children Status | **Static** | Children details | `users` | `/parents/children` | List profiles, attendance, classes of linked students | `PARENT` | **Critical** |
| **Parent** | Billing & Fees Portal | **Static** | Invoices ledger | `invoices` | `/parents/children/fees` | Fetch unpaid invoices for parent's children | `PARENT` | **Critical** |
| **Staff** | Task Operations Checklist | **Static** | Admin checklist tasks | `tasks` (New) | `/tasks` (CRUD) | Get/Set task checkbox states | `STAFF` | **Low** |
| **Staff** | My Leaves Account | **Static** | Leave records | `leavebalances` (New) | `/leave-balances` | Retrieve leave balances (Sick, Casual, Earned) | `STAFF`, `TEACHER` | **Medium** |

---

## 3. Module Audit

A detailed evaluation of the functional status of each system module:

| Module Name | Feature Name | Frontend Available? | Backend Available? | API Available? | Database Support? | Business Logic Complete? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Student Management** | Roster, Creation, Edit | Yes | Yes | Yes | Yes | Yes |
| **Teacher Management** | Faculty list, details | Yes | Yes | Yes | Yes | Yes |
| **Staff Management** | Staff list, details | Yes | Yes | Yes | Yes | Yes |
| **Admissions** | Application Pipeline | **Mocked** | **No** | **No** | **No** | **No** |
| **Attendance** | Student & Staff Logs | Yes | Yes | Yes | Yes | Yes |
| **Examinations** | Schedules, Publish | Yes | Yes | Yes | Yes | Yes |
| **Assignments** | Task dispatch, Submissions | **Mocked** | **No** | **No** | **No** | **No** |
| **Courses** | Subject allocation | Yes | Yes | Yes | Yes | Yes |
| **Timetable** | Grid, Conflict Detector | Yes | Yes | Yes | Yes | Yes |
| **Fees** | Invoices, Collections | Yes | Yes | Yes | Yes | Yes |
| **Payroll** | Salary structure, Slips | **No** | **No** | **No** | **No** | **No** |
| **Transport** | Routes, Drivers, Dues | **No** | **No** | **No** | **No** | **No** |
| **Library** | Books ledger, Checkouts | **No** | **No** | **No** | **No** | **No** |
| **Hostel** | Rooms, Occupants | **No** | **No** | **No** | **No** | **No** |
| **Inventory** | Stock items, Dues | **No** | **No** | **No** | **No** | **No** |
| **Notifications** | Alerts Center, Templates | Yes | Yes | Yes | Yes | Yes |
| **Messaging** | Chat inbox | **No** | **No** | **No** | **No** | **No** |
| **Reports** | PDF/Excel Export | Yes | Yes | Yes | Yes | Yes |
| **Settings** | General Info, Config | **Static** | **No** | **No** | **No** | **No** |
| **User Management** | Authentication, Profile | Yes | Yes | Yes | Yes | Yes |
| **Role Management** | Permissions mapping | Yes | Yes | Yes | Yes | Yes |

---

## 4. Missing Backend Features & APIs

The backend features and APIs detailed below must be developed from scratch:

### Missing Features
1. **Multi-Tenancy Middleware:** A validation interceptor to parse `X-Tenant-ID` header, verify the school subdomain, and hook a database connection selector to isolate queries by school tenant.
2. **Leave Requests Management:** State machine and endpoints for leave application.
3. **Admissions Workflow Engine:** A tracking pipeline for admission applicants.
4. **Assignments Management:** Classroom task dispatch and grading interface.
5. **Parent-Student Association:** Database support linking Parent accounts with their children's student accounts.

### Missing APIs Gap Analysis

| Endpoint Name | HTTP Method | Request Payload | Response Structure | Auth | Role | Validation Rules |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/leaverequests` | `POST` | `{ startDate: Date, endDate: Date, type: string, reason: string }` | Created LeaveRequest object | JWT | STUDENT, TEACHER, STAFF | Date range must be valid; reason required |
| `/leaverequests` | `GET` | Query params: `{ status: string }` | Array of LeaveRequests | JWT | TEACHER, ADMIN | None |
| `/leaverequests/:id/approve`| `PUT` | `{ remarks?: string }` | Updated request object | JWT | TEACHER, ADMIN | Request must exist and be pending |
| `/admissions/applications` | `POST` | `{ studentName: string, grade: string, priorScore: string, parentEmail: string }` | Application record with ID | None | Public | Valid email format, student name required |
| `/admissions/applications` | `GET` | Query: pagination | Array of applications | JWT | ADMIN, SUPER_ADMIN | None |
| `/admissions/applications/:id/status`| `PATCH` | `{ status: string }` | Updated application | JWT | ADMIN | Status must be valid enum |
| `/assignments` | `POST` | `{ title: string, subjectId: string, classId: string, dueDate: Date, maxMarks: number }` | Created assignment object | JWT | TEACHER | Title required, maxMarks > 0, future due date |
| `/assignments/student` | `GET` | Query: `{ classId: string }` | Array of assignments with student submission status | JWT | STUDENT | classId required |
| `/assignments/:id/submit` | `POST` | FormData: `{ file: Blob }` | Submission receipt | JWT | STUDENT | File must be under 10MB |
| `/assignments/:id/grade` | `PUT` | `{ studentId: string, marks: number, feedback: string }` | Graded submission object | JWT | TEACHER | marks <= assignment.maxMarks |
| `/parents/children` | `GET` | None | Array of Student User profiles | JWT | PARENT | Parent account must be authenticated |
| `/settings` | `GET` | None | Tenant Settings object | JWT | ADMIN | None |
| `/settings` | `PUT` | `{ schoolName: string, email: string, address: string, autoBackup: boolean }` | Updated Settings | JWT | ADMIN | Valid email, schoolName not empty |

---

## 5. Database Gaps

```mermaid
erDiagram
    User ||--o| Student : "discriminates"
    User ||--o| Teacher : "discriminates"
    User ||--o| Staff : "discriminates"
    User ||--o| Parent : "discriminates (NEW)"
    
    Student ||--o{ LeaveRequest : "submits"
    Teacher ||--o{ LeaveRequest : "submits"
    
    Parent }o--o{ Student : "guardian of"
    
    Class ||--o{ Assignment : "assigned to"
    Teacher ||--o{ Assignment : "creates"
    Assignment ||--o{ AssignmentSubmission : "receives"
    Student ||--o{ AssignmentSubmission : "submits"
    
    AdmissionApplication ||--|| Student : "results in"
```

### Missing Collections/Schemas
1. **`Parent` (Discriminator on `User`):**
   - Fields: `children: [{ type: ObjectId, ref: 'User' }]` (links to Student documents).
2. **`LeaveRequest` Schema:**
   - Fields: `requesterId` (User ref), `requesterType` (Student/Teacher/Staff), `startDate` (Date), `endDate` (Date), `type` (Sick/Casual/Medical), `reason` (String), `status` (Pending/Approved/Rejected), `approvedBy` (User ref), `remarks` (String).
3. **`AdmissionApplication` Schema:**
   - Fields: `applicantName` (String), `gradeLevel` (String), `entranceScore` (Number), `status` (Applied/Verified/Interviewed/Approved/Rejected), `documents` (Array of file URLs), `parentEmail` (String).
4. **`Assignment` Schema:**
   - Fields: `title` (String), `description` (String), `subject` (Subject ref), `class` (Class ref), `teacher` (User ref), `dueDate` (Date), `maxMarks` (Number), `attachmentUrl` (String), `isPublished` (Boolean).
5. **`AssignmentSubmission` Schema:**
   - Fields: `assignment` (Assignment ref), `student` (User ref), `fileUrl` (String), `submittedAt` (Date), `status` (Submitted/Graded), `marksObtained` (Number), `feedback` (String).
6. **`SystemSetting` Schema:**
   - Fields: `schoolName` (String), `contactEmail` (String), `address` (String), `mfaEnforced` (Boolean), `integrations` (Map of active integrations toggles).

### Schema Improvements & Optimization Recommendations
- **Multi-Tenancy Indexing:** Add `schoolId: { type: Types.ObjectId, ref: 'School', index: true }` to all database schemas to support isolated index scanning by tenant.
- **Audit Logs Optimization:** Add a TTL (Time-To-Live) index of 365 days on the `auditlogs` collection to automatically prune old logs and prevent database storage overflow.
- **Compound Indexes:**
  - `AssignmentSubmissionSchema`: Compound index on `{ assignment: 1, student: 1 }` (unique).
  - `LeaveRequestSchema`: Index on `{ requesterId: 1, status: 1 }`.
  - `TimetableSchema`: Compounding index on `{ class: 1, dayOfWeek: 1, startTime: 1 }` to prevent timetable overlaps at write time.

---

## 6. Workflow Gaps

The database updates and triggers required to support automated operational loops are listed below:

| Workflow | Current State | Missing Steps | Backend logic required | Database updates required | Notification Triggers |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Admission Pipeline** | Student is directly created in DB via raw inputs | Form review, interview scoring, automated Student ID generation, parent portal dispatch | Verification checker, password generator, roll number sequencer | Write to `admissionapplications`, then create record in `users` | Send welcome email containing parent/student credentials |
| **Attendance Leave backfill** | Attendance status marked present/absent directly | Submission of leave request, approval validation, backfilling attendance list | Overlap check (dates), loop that marks status as `LEAVE` for approved dates | Write to `leaverequests`, updates/upserts `attendances` | Dispatch approval email to applicant. Alert parent of leave status |
| **Assignment Grading** | Grades/Marks direct record entry | Upload of work, evaluation screen, validation against max marks, grading save | File upload validation, grade range validation, updating student progress tracker | Write to `assignmentsubmissions`, inserts or updates `marks` table | Push alert to student upon assignment graded |
| **Fee Collection & Webhooks** | Invoice marked paid manually via cash collection form | Payment initiation, gateway webhook handling, verification, receipts compilation | Stripe/Razorpay signature verification, payment log processor | Inserts `fee-collections`, updates `invoices` balance, creates `receipts` | Email receipts PDF automatically to parent |
| **Leave & Class Coverage** | Mock leave tabs | Coordinator leave approval, substitution allocation check, timetable update | Checks available teachers during time blocks | Updates class schedule `teacher` property for date | Push notification to substitute teacher |

---

## 7. Security Gaps

1. **Multi-Tenancy Bypass (CRITICAL):**
   - *Threat:* The backend has no tenant resolving middleware. Users from Springfield High can view Hogwarts database records by guessing school IDs or paths.
   - *Resolution:* Implement a NestJS `TenantInterceptor` or middleware that extracts `X-Tenant-ID` (or parses subdomains), loads/configures the MongoDB connection context dynamically, and filters all database queries.
2. **Missing Rate Limiting:**
   - *Threat:* Vulnerability to credential stuffing on `/auth/login` and spamming on `/admissions/applications`.
   - *Resolution:* Configure NestJS `ThrottlerModule` globally with limits (e.g., maximum 10 requests per minute on auth endpoints).
3. **Missing CORS Strictness & Secure Headers:**
   - *Threat:* The backend CORS origin is hardcoded to `http://localhost:5173`. Helmet middleware is not registered, exposing vulnerability to clickjacking, XSS, and MIME-sniffing.
   - *Resolution:* Register `helmet()` in `main.ts` and set CORS origins dynamically via environmental variables.
4. **Mocked MFA Toggle:**
   - *Threat:* No actual multi-factor protection, exposing admin portals to credential leaks.
   - *Resolution:* Develop TOTP verification using `otplib` and QR code generator APIs.

---

## 8. Technical Debt Report

- **Duplicate Axios Clients:** The notification feature has its own `apiClient` instance in `notificationAPI.ts`, recreating token intercepts. It should import the unified client from `api/api.ts`.
- **Fetch vs Axios Mismatch:** The fees feature uses `fetch` inside `feesApi.ts` instead of the unified Axios instance. This bypasses the request interceptors entirely, meaning **fee operations never send the `X-Tenant-ID` header**.
- **No Global Error Boundaries:** Frontend features lack error handling wrappers around query hooks. A backend 500 error causes empty pages or crashes instead of rendering styled error boundaries.
- **Lack of Validation Schemas:** Frontend forms rely on HTML5 constraints. They must be refactored to use client-side validation libraries like Formik/Yup or React Hook Form with Zod.

---

## 9. Implementation Roadmap

### Phase 1 — Security & Multi-Tenancy (Priority: CRITICAL)
- **Tasks:**
  - Create NestJS tenant context resolver middleware.
  - Implement dynamic MongoDB tenant database selection.
  - Register `helmet` and configure `ThrottlerModule` rate limits.
  - Fix `feesApi.ts` to use Axios and align headers.
- **Dependencies:** None
- **Complexity:** High

### Phase 2 — Core Workflows & Parent Portal (Priority: HIGH)
- **Tasks:**
  - Create the `Parent` discriminator schema. Connect Parent records to students.
  - Implement Leave Request workflow backend endpoints and database collections.
  - Hook the Teacher attendance dialog to bulk save endpoint.
  - Hook Admin approvals screen to leave requests state updates.
- **Dependencies:** Phase 1
- **Complexity:** High

### Phase 3 — Assignments & Admissions (Priority: HIGH)
- **Tasks:**
  - Create `assignments` and `assignmentsubmissions` schemas and backend module.
  - Hook Student and Teacher dashboards to assignments query hooks.
  - Implement Admissions application pipeline and database storage.
- **Dependencies:** Phase 2
- **Complexity:** Medium

### Phase 4 — Automation, Notifications & Payments (Priority: MEDIUM)
- **Tasks:**
  - Implement Stripe & Razorpay webhook endpoints.
  - Connect webhook payments to automatic invoice settling and receipts generation.
  - Configure real Twilio/SNS SMS triggers (replace mocks).
- **Dependencies:** Phase 1
- **Complexity:** High

### Phase 5 — Optimization, Reports & Settings (Priority: MEDIUM)
- **Tasks:**
  - Replace static `SettingsPage.tsx` with GET/PUT configurations saving to DB.
  - Bind all remaining mock dashboard charts to backend analytics aggregation endpoints.
- **Dependencies:** Phase 3
- **Complexity:** Medium

---

## 10. Development Task Breakdown

### Task 1.1: Multi-Tenancy Middleware
- Develop `TenantMiddleware` in `backend/src/common/middleware/tenant.middleware.ts` to parse `X-Tenant-ID` headers.
- Register middleware in `AppModule`.
- Implement dynamic Mongoose connection resolver.

### Task 1.2: Rate Limiting & Helmet
- Install `@nestjs/throttler` and `helmet`.
- Configure throttler guard globally in `AppModule`.
- Apply `app.use(helmet())` in `main.ts`.

### Task 2.1: Parent User Alignment
- Update `users.module.ts` and `user.schema.ts` to add Parent discriminator.
- Create parent profile mapping endpoints.
- Update `migrate.js` script to properly migrate parent accounts (linking parent user profiles to their children).

### Task 2.2: Leave Requests System
- Create `LeaveRequestsModule` in backend.
- Define `LeaveRequest` Mongoose schema.
- Implement create, list, and state-change (approve/reject) endpoints.
- Update frontend dialogs to invoke leave requests APIs.

---

## 11. Backend Development Checklist

- [ ] Add `@nestjs/throttler` rate limiting guards to auth routes.
- [ ] Add `helmet` secure headers middleware in `main.ts`.
- [ ] Implement `TenantMiddleware` and database context isolator.
- [ ] Create `LeaveRequest` schema, controller, service, and tests.
- [ ] Create `Parent` user discriminator schema.
- [ ] Create `Assignment` and `AssignmentSubmission` schemas and endpoints.
- [ ] Create `AdmissionApplication` schema and pipeline endpoints.
- [ ] Write integration tests for Leave requests workflow (target 80%+ coverage).
- [ ] Write E2E tests validating tenant isolation (assert Hogwarts cannot read Springfield users).

---

## 12. Testing Checklist

- [ ] Verify dynamic loading of user profile fields (Class, Roll number) on Student Dashboard.
- [ ] Verify role-based dashboard redirection (assert Parent role routes to correct portal, no fallback).
- [ ] Test form validation constraints on Student Admission and Exam creation dialogs.
- [ ] Verify attendance record persistence (marking student absent in teacher dialog updates the database record).
- [ ] Verify PDF/Excel report downloads on the admin report console (check columns alignment).
- [ ] Run security scanner checks for header presence (Helmet validation).
- [ ] Test rate limiting limit (assert 11th consecutive login attempt returns 429 Too Many Requests).
- [ ] Perform audit logs verification (actions taken in dashboards create correct `AuditLog` documents).

---

## 13. Recommended Priority Order

1. **Multi-Tenancy & Tenant Security Isolation:** Address this immediately to ensure data privacy before connecting any other features.
2. **Axios Client Refactoring (`feesApi.ts` & `notificationAPI.ts`):** Align API clients to prevent request header bypasses.
3. **Parent User schema & Auth implementation:** Fix Parent account isolation to enable parent logins.
4. **Attendance Saving & Leave approvals workflow:** Bridge attendance dialogs and leave trackers to real tables.
5. **Assignments & Submissions module:** Build classroom core functionalities.
6. **Billing Gateway Webhooks & Real notifications:** Implement payment verification and communications channels.
7. **Reports Scheduling & System configurations save:** Connect general settings and export cron templates.
