# Software Requirements Document (SRD)

## 1. Executive Summary
The School Management System is a production‑grade web application that provides comprehensive administrative, academic, financial, and communication capabilities for K‑12 institutions. It follows a decoupled client‑server architecture built with **NestJS**, **MongoDB**, **React**, **TypeScript**, and **Material‑UI**, adhering to strict security, performance, and quality standards.

## 2. Product Vision
Deliver a secure, scalable, and user‑friendly platform that enables schools to manage students, staff, courses, fees, attendance, examinations, and reporting while offering a modern UI/UX experience.

## 3. Business Objectives
- Streamline school administrative processes.
- Provide real‑time analytics and reporting.
- Ensure data security and compliance (e.g., GDPR).
- Offer multi‑tenant capabilities for multiple schools.

## 4. Stakeholders
| Role | Interest |
|------|----------|
| School Admin | Efficient day‑to‑day operations |
| Teachers | Manage classes, grades, and attendance |
| Parents | View student progress, fees, and communications |
| Students | Access personal information and resources |
| Super Admin | System configuration, multi‑tenant management |

## 5. Scope
- **In‑Scope**: All core modules listed in `backend/src` (Users, Roles, Permissions, Auth, Schools, Academic Years, Departments, Classes, Sections, Teachers, Courses, Subjects, Staff, Students, Timetables, Attendances, Examinations, Marks, Fees, Payments, Notifications, Analytics, Reports, Audit Logs, Dashboard, Health, Metrics, Leave Requests, Admissions, Assignments, Settings, Tenant).
- **Out‑of‑Scope**: External LMS integration, native mobile apps, AI‑driven recommendations (future phases).

## 6. Assumptions
- The repository does **not** contain explicit `PROJECT_ROADMAP.md`, `PHASE_TRACKER.md`, or `FEATURE_MATRIX.md` files; assumptions are derived from the codebase, `README.md`, and existing documentation.
- All UI mockups in `docs/` represent the final visual design.
- Deployment will target AWS/GCP as described in `aws_deployment.md` and `gcp_deployment.md`.

## 7. Traceability Matrix
| Requirement ID | Module | Screen ID |
|----------------|--------|-----------|
| FR‑001 (Login) | Auth | SCR-001 |
| FR‑002 (RBAC) | Auth/Permissions | SCR-003 (Landing) |
| FR‑003 (Student CRUD) | Students | SCR-007 (Student Dashboard) |
| FR‑004 (Attendance) | Attendances | SCR-006 (Teacher Dashboard) |
| FR‑005 (Fees) | Fees/Payments | SCR-005 (Admin Dashboard) |
| FR‑006 (Analytics) | Analytics/Reports | SCR-011 (Reports & Analytics) |
| FR‑007 (Multi‑tenant) | Tenant | SCR-003 (Landing) |
| FR‑008 (Notifications) | Notifications | SCR-010 (Leave Requests) |

## 8. Functional Requirements
| ID | Description | Rationale | Priority | Dependencies | Acceptance Criteria |
|----|-------------|-----------|----------|--------------|----------------------|
| FR‑001 | User authentication via JWT | Secure stateless login | Must | Auth module | Returns access & refresh tokens on valid credentials |
| FR‑002 | Role‑based access control (RBAC) | Enforce least‑privilege | Must | Roles & Permissions modules | Guard blocks unauthorized routes |
| FR‑003 | CRUD for Students | Core data management | Must | Students module | API endpoints for create/read/update/delete with validation |
| FR‑004 | Attendance tracking | Academic compliance | High | Attendances module | UI shows daily attendance, API records entries |
| FR‑005 | Fee invoicing & payment processing | Financial operations | High | Fees & Payments modules | Generate invoice PDF, record payment status |
| FR‑006 | Reporting & analytics dashboard | Decision support | Medium | Analytics & Reports modules | Charts display key KPIs, export CSV |
| FR‑007 | Multi‑tenant isolation | SaaS offering | High | Tenant module, tenantPlugin | Data segregation per tenant, no cross‑tenant leakage |
| FR‑008 | Email & SMS notifications | Communication | Medium | Notifications module | Sends alerts on critical events |

## 9. Non‑Functional Requirements
- **Performance**: API response ≤ 200 ms for 95 % of requests.
- **Scalability**: Horizontal scaling of NestJS workers; MongoDB sharding support.
- **Security**: OWASP Top 10 compliance, rate‑limiting, input sanitisation, TLS everywhere.
- **Availability**: 99.9 % uptime SLA.
- **Maintainability**: 80 %+ test coverage, ESLint/Prettier enforced.

## 10. Security Requirements
- JWT signed with RS256, short‑lived access tokens.
- RBAC enforced via NestJS guards.
- Input validation using class‑validator DTOs.
- Rate limiting via `ThrottlerModule` (default, sensitive, exports).
- Audit logging of all privileged actions.
- TLS enforced at load balancer.

## 11. Performance Requirements
- Support up to 10 000 concurrent users.
- Database indexes on primary lookup fields (`email`, `studentId`, `tenantId`).

## 12. Compliance Requirements
- GDPR‑compliant data handling (right to be forgotten).
- Secure storage of secrets via `.env` and cloud secret managers.

## 13. Reporting Requirements
- Exportable CSV/Excel for Users, Fees, Attendance, Exam results.
- Real‑time dashboards using Chart.js (via `analytics` module).

## 14. Audit Requirements
- Immutable audit logs stored in `audit-logs` collection.
- Searchable via API with admin permissions.

## 15. Integration Requirements
- Email service (SMTP) for notifications.
- Payment gateway stub (future integration).

## 16. Success Metrics
- **Login latency** ≤ 200 ms for 95 % of attempts.
- **Zero** critical findings in OWASP ZAP scans per release.
- **≥ 80 %** test coverage across backend and frontend.
- **99.9 %** system uptime measured over a month.

## 17. License & Third‑Party Components
- NestJS – MIT
- React – MIT
- Material‑UI – MIT
- Sentry – BSD‑3
- otplib – MIT
- bcrypt – MIT
- Other npm dependencies are listed in `package.json` with their respective licenses.

## 18. Acceptance Criteria
All functional requirements must be demonstrable via automated integration tests and documented in Swagger UI. Security tests must pass OWASP ZAP scan.

---
*Document generated automatically based on repository analysis. Assumptions are noted where source information was unavailable.*

---
## 8. Additional Functional Requirements

| ID | Description | Rationale | Priority | Dependencies | Acceptance Criteria |
|----|-------------|-----------|----------|--------------|----------------------|
| FR‑009 | Register new user endpoint | Enable user self‑service onboarding | Must | Auth module | `POST /auth/register` returns success message and sends verification email |
| FR‑010 | Email verification flow | Validate user email addresses | Must | Auth module, Email service | `GET /auth/verify?token=` activates account and returns confirmation |
| FR‑011 | Record attendance | Track daily student attendance | High | Attendances module | `POST /attendances` creates record and UI reflects entry |
| FR‑012 | Fee payment processing | Collect tuition/fee payments | High | Fees & Payments modules | `POST /fees/:studentId/pay` creates payment record and updates fee status |
| FR‑013 | Admin dashboard overview | Provide summary widgets for admin users | Medium | Dashboard module | Dashboard displays key metrics and links to management screens |
| FR‑014 | Manage academic years | Admin can CRUD academic year periods | Medium | AcademicYears module | API endpoints for list/create/update/delete work with proper RBAC |
| FR‑015 | Admissions management | Admin can review and update admission applications | Medium | Admissions module | CRUD endpoints function and UI lists applications |

---
