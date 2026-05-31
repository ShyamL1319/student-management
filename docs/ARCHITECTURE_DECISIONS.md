# Architecture Decisions

## Authentication Architecture
- **Provider:** Custom JWT Authentication.
- **Implementation:** Authentication is handled globally using custom NestJS AuthGuards and JSON Web Tokens (JWT). Passwords are encrypted securely before storage.

## Authorization Architecture
- **Strategy:** Role-Based Access Control (RBAC).
- **Implementation:** Implemented via custom NestJS Roles Guards to protect endpoints based on user roles (Super Admin, School Admin, Teacher, Staff, Student, Parent).

## API Architecture
- **Framework:** NestJS Controllers (`*.controller.ts`) for Backend and Axios for Frontend API interactions.
- **Paradigm:** RESTful JSON endpoints are used for stateless interactions across all entities.
- **Execution:** Node.js server execution via NestJS framework.

## DTO Architecture
- **Validation Library:** `class-validator` and `class-transformer`.
- **Implementation:** Data Transfer Objects are structured via TypeScript classes adorned with validation decorators. NestJS `ValidationPipe` enforces validation automatically on API payload bodies, ensuring robust data integrity before reaching the controller.

## Database Architecture
- **Provider:** MongoDB.
- **ORM:** Mongoose.
- **Implementation:** The application connects to a MongoDB cluster. Data models are defined using Mongoose schemas and injected into NestJS services using `@nestjs/mongoose`.

## Error Handling
- **Strategy:** Normalization and Structured Responses.
- **Implementation:** Custom NestJS Exception Filters are used to intercept thrown errors globally. This maps domain-specific errors like Mongoose validation faults and duplicate key violations to consistent, structured JSON responses with descriptive HTTP status codes (e.g., `400` for bad payloads, `500` for server errors).

## Logging Strategy
- **Framework:** NestJS built-in `Logger`.
- **Implementation:** Errors and critical diagnostics are logged using the native NestJS logging service, ensuring consistent and easily configurable log outputs.

## Swagger Strategy
- **Implementation:** The backend utilizes `@nestjs/swagger` to automatically generate an OpenAPI standard specification. The Swagger UI is served at a dedicated endpoint to document API routes, payload expectations (DTOs), and responses.

## Testing Strategy
- **Unit Testing:** Jest (`jest`) is configured to test discrete business logic (services, controllers, and utilities) for both frontend and backend.
- **End-to-End (E2E) Testing:** Supertest is used for backend API E2E tests. Playwright or Cypress can be utilized for holistic browser-based integration tests on the frontend.
