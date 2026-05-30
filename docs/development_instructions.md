You are a principal software architect and senior full-stack engineer.

Generate the COMPLETE source code for a production-ready Student Management System.

Technology Stack

Backend:
- NestJS
- MongoDB Atlas
- Mongoose
- TypeScript
- JWT Authentication
- Refresh Tokens
- Passport JWT
- Class Validator
- Swagger
- Config Module
- Bcrypt
- Role-Based Access Control (Admin, Teacher, Student)

Frontend:
- React 19
- Vite
- TypeScript
- React Router
- Redux Toolkit
- Axios
- Material UI (MUI)
- React Hook Form
- Recharts
- DayJS

Database:
- MongoDB

General Requirements:
- Generate real implementation code, not pseudocode.
- Every file must contain complete code.
- All imports must be included.
- No placeholders such as "implement here" or "TODO".
- Every module must be functional and connected.
- Follow clean architecture and scalable project structure.
- Use TypeScript everywhere.
- Include validation, error handling, and security best practices.
- Ensure code can run after installation and environment configuration.

Application Features

1. Authentication
- Register
- Login
- Logout
- Refresh Token
- JWT Authentication
- Password Hashing
- Protected Routes
- Role-Based Access Control

Roles:
- Admin
- Teacher
- Student

2. Student Management
- Create Student
- View Students
- View Student Details
- Update Student
- Delete Student
- Search Student
- Pagination
- Filtering
- Sorting

Student Fields:
- studentId
- firstName
- lastName
- email
- phone
- gender
- dateOfBirth
- address
- department
- enrollmentDate
- status

3. Department Management
- Create Department
- Update Department
- Delete Department
- View Departments

4. Course Management
- Create Course
- Update Course
- Delete Course
- View Courses

Course Fields:
- courseCode
- courseName
- creditHours
- description
- department

5. Enrollment Module
- Assign Courses to Students
- Remove Courses
- View Student Enrollments
- View Course Enrollments

6. Marks Management
- Add Marks
- Update Marks
- View Marks
- Calculate GPA
- Calculate CGPA
- Generate Grades

Grade Rules:
90-100 = A+
80-89 = A
70-79 = B
60-69 = C
50-59 = D
Below 50 = F

7. Attendance Management
- Mark Attendance
- Update Attendance
- Attendance Reports
- Present Days
- Absent Days
- Late Days
- Attendance Percentage

Attendance Status:
- Present
- Absent
- Late

8. Dashboard
Admin Dashboard:
- Total Students
- Total Departments
- Total Courses
- Total Enrollments
- Attendance Analytics
- GPA Analytics

Teacher Dashboard:
- Course Performance
- Attendance Summary
- Student Results

Student Dashboard:
- GPA
- Courses
- Attendance
- Academic Progress

9. Reports
- Student Report
- GPA Report
- Attendance Report
- Department Report
- Export PDF
- Export Excel

Backend Deliverables

Generate complete NestJS source code.

Folder Structure:
backend/
├── src/
│   ├── auth/
│   ├── users/
│   ├── students/
│   ├── departments/
│   ├── courses/
│   ├── enrollments/
│   ├── marks/
│   ├── attendance/
│   ├── dashboard/
│   ├── reports/
│   ├── common/
│   ├── config/
│   └── main.ts
├── test/
├── .env.example
├── package.json
├── tsconfig.json
└── README.md

For EACH backend module generate:
- Folder structure
- Schema
- DTOs
- Controller
- Service
- Module
- Validation
- Guards
- API routes
- Swagger decorators
- Error handling

Generate:
- Complete MongoDB models
- Mongoose schemas
- JWT strategy
- Refresh token strategy
- Role guard
- Auth guard
- Exception filters
- Response interceptors
- Middleware
- Configuration files
- Environment setup
- Package.json

Frontend Deliverables

Generate complete React source code.

Folder Structure:
frontend/
├── src/
│   ├── app/
│   ├── routes/
│   ├── pages/
│   ├── features/
│   ├── services/
│   ├── store/
│   ├── components/
│   ├── layouts/
│   ├── hooks/
│   ├── utils/
│   ├── theme/
│   ├── types/
│   ├── assets/
│   └── main.tsx
├── package.json
├── vite.config.ts
└── README.md

Generate:
- Routing
- Redux Toolkit store
- Slices
- RTK Query or Axios services
- Authentication state
- Protected routes
- Dashboard pages
- Student pages
- Department pages
- Course pages
- Enrollment pages
- Marks pages
- Attendance pages
- Report pages
- Profile page
- Settings page

UI Requirements:
- Modern Admin Dashboard
- Responsive Design
- Sidebar
- Navbar
- Cards
- Data Tables
- Search
- Filters
- Pagination
- Charts
- Forms
- Modals
- Toast Notifications
- Loading Indicators
- Error Boundaries

Database Design

Generate:
- Complete MongoDB schema definitions
- Collection relationships
- Indexes
- Validation rules
- Aggregation examples

API Requirements

Generate:
- Full REST API implementation
- Request examples
- Response examples
- Swagger configuration
- Authentication examples

Testing

Generate:
- Jest unit tests
- Service tests
- Controller tests
- React component tests
- API integration tests

Deployment

Generate:
- MongoDB Atlas configuration
- Backend deployment on Render/Railway
- Frontend deployment on Vercel
- Environment variables
- Production build instructions

Code Generation Rules

1. Output code file-by-file.
2. Before each file, show the file path.
3. Wrap every file in its own code block.
4. Generate complete working code.
5. Maintain import consistency.
6. Do not skip files.
7. Do not summarize implementations.
8. Continue automatically through all modules until the entire project is complete.
9. If output length is exceeded, stop at the last completed file and wait for "Continue".
10. Preserve consistency between generated files across all responses.

Output Order

Phase 1:
- Project structure
- MongoDB schemas
- Backend configuration
- Authentication module

Phase 2:
- Student module
- Department module
- Course module

Phase 3:
- Enrollment module
- Marks module
- Attendance module

Phase 4:
- Dashboard module
- Reports module

Phase 5:
- Frontend setup
- Routing
- Redux store
- Authentication UI

Phase 6:
- Student UI
- Department UI
- Course UI
- Enrollment UI
- Marks UI
- Attendance UI

Phase 7:
- Dashboard UI
- Reports UI
- Tests
- Deployment
- README