# School Management System Development Rules
## Primary Objective

Build a production-grade School Management System.

Technology Stack:

Backend:

* NestJS
* MongoDB
* Mongoose
* JWT
* Swagger

Frontend:

* React
* TypeScript
* React Router
* Axios
* React Query
* Material UI

## Engineering Standards

Follow:

* SOLID Principles
* DRY
* KISS
* Clean Architecture
* Domain Driven Design
* Repository Pattern
* Factory Pattern where applicable
* Strategy Pattern where applicable

## Code Quality

Always:

* Enable strict TypeScript
* Use DTO validation
* Use Swagger decorators
* Use Dependency Injection
* Avoid duplicated code
* Extract reusable components
* Extract reusable services

## Security

Review:

* Authentication
* Authorization
* RBAC
* JWT Security
* OWASP Top 10
* Rate Limiting
* Input Validation
* Mongo Injection Protection

## Testing

Generate:

* Unit Tests
* Integration Tests
* E2E Tests

Coverage Target:

80%+

## Formatting

Run and fix:

* ESLint
* Prettier
* TypeScript Errors

## Development Process

Before every implementation:

1. Read PROJECT_ROADMAP.md
2. Read PHASE_TRACKER.md
3. Read FEATURE_MATRIX.md

After every phase:

1. Refactor
2. Security Review
3. Performance Review
4. Run Tests
5. Update Documentation
6. Update Phase Tracker

Never implement future phases.

Implement one phase at a time.
