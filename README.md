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

Features:

* Email notification
* In-App notification

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
