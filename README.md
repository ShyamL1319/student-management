# School Management System (NestJS + React + MongoDB)

## Objective

Create a completely new enterprise-grade School Management System while preserving:

* Folder structure
* Coding standards
* Architecture patterns
* Authentication strategy
* Authorization flow
* Guards
* Interceptors
* Exception filters
* DTO validation
* Repository patterns
* Environment configuration
* API response standards
* Logger implementation
* Swagger documentation
* React architecture
* Routing structure
* Redux/Context patterns if present
* Axios API layer
* UI design system

The new project must NOT be a modified copy of LinkShortner.

Instead, it should use the same architecture to build a School Management Platform.

---

# Technology Stack

Backend:

* NestJS
* MongoDB
* Mongoose
* JWT Authentication
* Role Based Access Control

Frontend:

* React
* TypeScript
* React Router
* Material UI / existing design system
* Axios
* React Query

Database:

* MongoDB

---

# User Roles

1. Super Admin
2. School Admin
3. Teacher
4. Staff
5. Student
6. Parent

---

# Core Modules

## Authentication

* Login
* Logout
* Refresh Token
* Forgot Password
* Reset Password
* Change Password
* Profile Management
* Role Based Authorization

---

## Student Module

Student CRUD

Fields:

* admissionNumber
* rollNumber
* firstName
* lastName
* gender
* dateOfBirth
* bloodGroup
* email
* phone
* address
* class
* section
* parentDetails
* status

Features:

* Student profile
* Student search
* Student filters
* Student promotion

---

## Teacher Module

Teacher CRUD

Fields:

* employeeId
* firstName
* lastName
* qualification
* department
* specialization
* joiningDate
* salary
* email
* phone

Features:

* Assign classes
* Assign subjects
* Attendance tracking

---

## Staff Module

Staff CRUD

Fields:

* employeeId
* designation
* department
* salary
* contactInfo

---

## Department Module

CRUD

Examples:

* Science
* Commerce
* Arts
* Administration

---

## Course Module

CRUD

Fields:

* courseCode
* courseName
* description
* department
* assignedTeacher

---

## Subject Module

CRUD

Fields:

* subjectCode
* subjectName
* department
* teacher

---

## Class Module

CRUD

Fields:

* className
* section
* classTeacher

---

## Attendance Module

Student Attendance

Features:

* Daily attendance
* Monthly attendance
* Attendance reports
* Student, teacher, and staff attendance types

Teacher Attendance

Staff Attendance

---

## Marks Module

Exam Types:

* Unit Test
* Mid Term
* Final Exam

Features:

* Enter marks
* Edit marks
* Grade calculation
* GPA calculation
* Rank generation

---

## Examination Module

CRUD

Fields:

* examName
* examDate
* examType

---

## Timetable Module

Features:

* Class timetable
* Teacher timetable

---

## Fee Management

Features:

* Fee structure
* Fee collection
* Pending dues
* Reports

---

## Notification Module

**Status**: ✅ Fully Implemented

### Notification Channels
* Email (via SMTP with nodemailer)
* SMS (Twilio, AWS SNS, or Mock providers)
* In-App (Database storage)

### Event Types
* Attendance Alerts - Low attendance warnings
* Fee Alerts - Pending/overdue payment notifications
* Result Alerts - Exam result published notifications
* Exam Schedule - Exam schedule notifications
* Timetable Change - Schedule change notifications
* Announcements - General announcements

### Core Features
* Create and send notifications via multiple channels
* User notification preferences management
* Notification status tracking (pending, sent, failed, delivered, opened)
* Retry mechanism for failed notifications
* Unread notification count and tracking
* Mark as read (single and bulk)
* Notification history and search
* Statistics and reporting
* Event-based triggers
* Quiet hours configuration
* Do Not Disturb mode
* Notification templates
* Template variable substitution
* Metadata storage for tracking

### API Endpoints
**Notifications:**
- `POST /notifications` - Create and send
- `GET /notifications` - Get all with filtering
- `GET /notifications/:id` - Get single
- `PATCH /notifications/:id` - Update
- `PATCH /notifications/:id/read` - Mark as read
- `PATCH /notifications/read/all` - Mark all as read
- `POST /notifications/:id/retry` - Retry failed
- `DELETE /notifications/:id` - Delete single
- `DELETE /notifications` - Clear all
- `GET /notifications/unread/count` - Get unread count
- `GET /notifications/statistics` - Get statistics

**Preferences:**
- `GET /notification-preferences` - Get user preferences
- `PATCH /notification-preferences` - Update preferences
- `PATCH /notification-preferences/channel/:channel/enable` - Enable channel
- `PATCH /notification-preferences/channel/:channel/disable` - Disable channel
- `PATCH /notification-preferences/event/:eventType/enable` - Enable event
- `PATCH /notification-preferences/event/:eventType/disable` - Disable event

**Templates:**
- `POST /notification-templates` - Create template
- `GET /notification-templates` - Get all
- `GET /notification-templates/:id` - Get single
- `PATCH /notification-templates/:id` - Update
- `DELETE /notification-templates/:id` - Delete

**Events:**
- `POST /notification-events/attendance-alert` - Trigger attendance alert
- `POST /notification-events/fee-alert` - Trigger fee alert
- `POST /notification-events/result-alert` - Trigger result alert
- `GET /notification-events` - Get all events
- `GET /notification-events/:id` - Get single event
- `GET /notification-events/statistics` - Get event statistics

### Frontend Components
* **NotificationCenter** - Main notification management page
  - View all notifications with filtering
  - Statistics dashboard
  - Mark as read/unread
  - Retry failed notifications
  - Delete notifications
  
* **NotificationPreferences** - User preference settings
  - Enable/disable channels
  - Configure quiet hours
  - Event type preferences
  - Do Not Disturb mode

* **NotificationBell** - Header component
  - Real-time unread count display
  - Animated badge
  - Quick dropdown

---

---

## Dashboard Module

Admin Dashboard

Statistics:

* Total Students
* Total Teachers
* Total Staff
* Attendance %
* Exam Statistics

Teacher Dashboard

Student Dashboard

Parent Dashboard

---

# Non Functional Requirements

* Modular architecture
* Scalable design
* SOLID principles
* Clean Architecture
* Enterprise folder structure
* Swagger documentation
* Unit tests
* Integration tests
* Pagination
* Sorting
* Filtering
* Search
* Audit Logs

---

# Deliverables

Generate implementation in phases.

Never generate entire project at once.

After each phase:

1. Generate code
2. Generate folder structure
3. Generate README updates
4. Generate migration notes
5. Generate API documentation
6. Generate frontend screens
7. Update project tracking files

Keep track of completed phases.

Generate markdown files for project governance.

---

# Current Progress

* **Phase 1 (Setup):** Completed. Bootstrap of NestJS Backend, React Vite Frontend, MongoDB, Docker, and Swagger.
* **Phase 2 (Authentication):** Completed. Auth module with JWT, Refresh Tokens, RBAC, Users/Roles schemas, Login, Forgot/Reset Password, and Profile pages.
