# API Documentation

## Overview
This document lists all public REST endpoints of the School Management System backend, their request/response schemas, authentication requirements, and Swagger annotations.

---
### Auth Module
| Method | Path | Public? | Description | Request DTO | Response |
|--------|------|---------|-------------|------------|----------|
| POST | `/auth/login` | No (uses JWT guard) | User login, returns access & refresh tokens. | `LoginDto` | `{ accessToken, refreshToken, user }` |
| POST | `/auth/register` | **Yes** (public) | Register a new user, sends verification email. | `RegisterDto` | `{ message: string }` |
| POST | `/auth/refresh` | No (refresh guard) | Refresh JWT tokens. | N/A | `{ accessToken, refreshToken }` |
| POST | `/auth/forgot-password` | Yes | Initiate password reset flow. | `ForgotPasswordDto` | `{ message }` |
| POST | `/auth/reset-password` | Yes | Complete password reset. | `ResetPasswordDto` | `{ message }` |
| GET | `/auth/profile` | Yes (JWT) | Get current user profile. | N/A | `User` |
| ... | ... | ... | (Other auth routes unchanged) | | |

---
### Users Module (example)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users` | JWT + RBAC (`ADMIN`) | List users |
| POST | `/users` | JWT + RBAC (`SUPER_ADMIN`) | Create user |
| ... | ... | ... | ... |

---
### Swagger
All endpoints are decorated with `@ApiTags`, `@ApiOperation`, and appropriate response decorators (`@ApiCreatedResponse`, `@ApiBadRequestResponse`, etc.). The new `POST /auth/register` endpoint includes:
```ts
@ApiTags('Auth')
@Post('register')
@Public()
@ApiCreatedResponse({ description: 'Registration successful, verification email sent' })
@ApiBadRequestResponse({ description: 'Invalid payload or email already exists' })
``` 

---
*Generated automatically as part of the implementation plan.*

---
### Academic Years Module
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/academic-years` | JWT + RBAC(`ADMIN`) | List academic years |
| POST | `/academic-years` | JWT + RBAC(`ADMIN`) | Create a new academic year |
| PUT | `/academic-years/:id` | JWT + RBAC(`ADMIN`) | Update an academic year |
| DELETE | `/academic-years/:id` | JWT + RBAC(`ADMIN`) | Delete an academic year |

### Admissions Module
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admissions` | JWT + RBAC(`ADMIN`,`STAFF`) | List admission applications |
| POST | `/admissions` | JWT + RBAC(`ADMIN`,`STAFF`) | Submit a new admission application |
| PUT | `/admissions/:id` | JWT + RBAC(`ADMIN`) | Update admission status |
| DELETE | `/admissions/:id` | JWT + RBAC(`ADMIN`) | Remove an admission record |

### Analytics Module
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/analytics/overview` | JWT + RBAC(`ADMIN`,`TEACHER`) | Fetch key metrics summary |
| GET | `/analytics/enrollment` | JWT + RBAC(`ADMIN`,`TEACHER`) | Enrollment trends data |
| GET | `/analytics/fees` | JWT + RBAC(`ADMIN`,`TEACHER`) | Fee collection statistics |
| GET | `/analytics/attendance` | JWT + RBAC(`ADMIN`,`TEACHER`) | Attendance analytics |

### Audit Logs Module
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/audit-logs` | JWT + RBAC(`ADMIN`,`SUPER_ADMIN`) | Retrieve audit logs with filters |

### Permissions & Roles Module
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/permissions` | JWT + RBAC(`ADMIN`) | List all permissions |
| POST | `/permissions` | JWT + RBAC(`ADMIN`) | Create a permission |
| GET | `/roles` | JWT + RBAC(`ADMIN`) | List roles |
| POST | `/roles` | JWT + RBAC(`ADMIN`) | Create a role |

### Settings Module (Advanced)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/settings` | JWT + RBAC(`ADMIN`,`SUPER_ADMIN`) | Retrieve system settings |
| PUT | `/settings` | JWT + RBAC(`SUPER_ADMIN`) | Update system configuration |

### Reports & Analytics Module
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/reports` | JWT + RBAC(`ADMIN`,`TEACHER`) | List available report templates |
| POST | `/reports/generate` | JWT + RBAC(`ADMIN`,`TEACHER`) | Generate a custom report |

### Departments Module
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/departments` | JWT + RBAC(`ADMIN`) | List departments |
| POST | `/departments` | JWT + RBAC(`ADMIN`) | Create department |

### Classes Module
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/classes` | JWT + RBAC(`ADMIN`) | List classes |
| POST | `/classes` | JWT + RBAC(`ADMIN`) | Create class |

### Sections Module
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/sections` | JWT + RBAC(`ADMIN`) | List sections |
| POST | `/sections` | JWT + RBAC(`ADMIN`) | Create section |

### Teachers Module
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/teachers` | JWT + RBAC(`ADMIN`) | List teachers |
| POST | `/teachers` | JWT + RBAC(`ADMIN`) | Add teacher |

### Students Management (enhanced)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/students` | JWT + RBAC(`ADMIN`,`STAFF`) | List students |
| POST | `/students` | JWT + RBAC(`ADMIN`,`STAFF`) | Add student (bulk import supported) |
| PUT | `/students/:id` | JWT + RBAC(`ADMIN`,`STAFF`) | Update student record |
| DELETE | `/students/:id` | JWT + RBAC(`ADMIN`) | Remove student |
---

---
### Academic Years Module
| Method | Path | Auth | Description | Request DTO | Response |
|--------|------|------|-------------|------------|----------|
| GET | `/academic-years` | JWT + RBAC(`ADMIN`) | List academic years | N/A | `AcademicYear[]` |
| POST | `/academic-years` | JWT + RBAC(`ADMIN`) | Create new academic year | `CreateAcademicYearDto` | `{ message: string }` |
| PUT | `/academic-years/:id` | JWT + RBAC(`ADMIN`) | Update academic year | `UpdateAcademicYearDto` | `{ message: string }` |
| DELETE | `/academic-years/:id` | JWT + RBAC(`ADMIN`) | Delete academic year | N/A | `{ message: string }` |

---
### Admissions Module
| Method | Path | Auth | Description | Request DTO | Response |
|--------|------|------|-------------|------------|----------|
| GET | `/admissions` | JWT + RBAC(`ADMIN`,`STAFF`) | List admission applications | N/A | `Admission[]` |
| POST | `/admissions` | JWT + RBAC(`ADMIN`,`STAFF`) | Submit new admission | `CreateAdmissionDto` | `{ message: string }` |
| PUT | `/admissions/:id` | JWT + RBAC(`ADMIN`) | Update admission status | `UpdateAdmissionDto` | `{ message: string }` |
| DELETE | `/admissions/:id` | JWT + RBAC(`ADMIN`) | Remove admission | N/A | `{ message: string }` |

---
### Analytics Module
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/analytics/overview` | JWT + RBAC(`ADMIN`,`TEACHER`) | Key metrics summary |
| GET | `/analytics/enrollment` | JWT + RBAC(`ADMIN`,`TEACHER`) | Enrollment trends |
| GET | `/analytics/fees` | JWT + RBAC(`ADMIN`,`TEACHER`) | Fee collection stats |
| GET | `/analytics/attendance` | JWT + RBAC(`ADMIN`,`TEACHER`) | Attendance analytics |

---
### Audit Logs Module
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/audit-logs` | JWT + RBAC(`ADMIN`,`SUPER_ADMIN`) | Retrieve audit logs with filters |

---
### Permissions & Roles Module
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/permissions` | JWT + RBAC(`ADMIN`) | List permissions |
| POST | `/permissions` | JWT + RBAC(`ADMIN`) | Create permission |
| GET | `/roles` | JWT + RBAC(`ADMIN`) | List roles |
| POST | `/roles` | JWT + RBAC(`ADMIN`) | Create role |

---
### Settings Module (Advanced)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/settings` | JWT + RBAC(`ADMIN`,`SUPER_ADMIN`) | Retrieve system settings |
| PUT | `/settings` | JWT + RBAC(`SUPER_ADMIN`) | Update configuration |

---
### Reports & Analytics Module
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/reports` | JWT + RBAC(`ADMIN`,`TEACHER`) | List report templates |
| POST | `/reports/generate` | JWT + RBAC(`ADMIN`,`TEACHER`) | Generate custom report |

---
### Departments Module
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/departments` | JWT + RBAC(`ADMIN`) | List departments |
| POST | `/departments` | JWT + RBAC(`ADMIN`) | Create department |

---
### Classes Module
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/classes` | JWT + RBAC(`ADMIN`) | List classes |
| POST | `/classes` | JWT + RBAC(`ADMIN`) | Create class |

---
### Sections Module
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/sections` | JWT + RBAC(`ADMIN`) | List sections |
| POST | `/sections` | JWT + RBAC(`ADMIN`) | Create section |

---
### Teachers Module
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/teachers` | JWT + RBAC(`ADMIN`) | List teachers |
| POST | `/teachers` | JWT + RBAC(`ADMIN`) | Add teacher |

---
### Students Management (enhanced)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/students` | JWT + RBAC(`ADMIN`,`STAFF`) | List students |
| POST | `/students` | JWT + RBAC(`ADMIN`,`STAFF`) | Add student (bulk) |
| PUT | `/students/:id` | JWT + RBAC(`ADMIN`,`STAFF`) | Update student |
| DELETE | `/students/:id` | JWT + RBAC(`ADMIN`) | Remove student |

---
### Attendances Module
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/attendances` | JWT + RBAC(`ADMIN`,`TEACHER`) | List attendance records |
| POST | `/attendances` | JWT + RBAC(`ADMIN`,`TEACHER`) | Record attendance |

---
### Fees Module
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/fees` | JWT + RBAC(`ADMIN`,`STAFF`) | List fees |
| POST | `/fees` | JWT + RBAC(`ADMIN`,`STAFF`) | Create fee entry |

---
### Payments Module
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/fees/:studentId/pay` | JWT + RBAC(`ADMIN`,`STAFF`) | Record payment for a student |

---
