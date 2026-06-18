# Backend Architecture & Development Rules

These rules apply when developing, modifying, or testing the backend application.

## Core Technologies
- NestJS (Modular framework)
- MongoDB with Mongoose ORM
- JSON Web Token (JWT) Security
- Swagger OpenAPI documentation

## Architecture Guidelines
1. **Directory Pattern**:
   - Organize by module (e.g. `src/users/`, `src/auth/`).
   - Every module must contain a controller, service, repository, entity/schema, and folder for DTOs.
2. **Repository Pattern**:
   - Abstract database operations into a repository layer.
   - Do not inject mongoose models directly into services. Inject custom repository classes instead.
3. **Data Validation (DTOs)**:
   - Always define input DTOs for request payloads.
   - Decorate fields with validation decorators from `class-validator` (e.g. `@IsString()`, `@IsEmail()`, `@IsNotEmpty()`).
   - Decorate fields with class-transformer decorators (e.g. `@Type()`) if parsing nested objects.
4. **API Documentation (Swagger)**:
   - Decorate controller classes with `@ApiTags()`.
   - Decorate endpoints with `@ApiOperation()`, `@ApiResponse()`, and standard HTTP status codes.
   - Decorate DTO properties with `@ApiProperty()` or `@ApiPropertyOptional()`.
5. **Security**:
   - Apply Authentication Guards (`JwtAuthGuard`) by default to protect routes.
   - Apply Authorization Guards (`RolesGuard`) with `@Roles()` decorator to enforce RBAC permissions.
   - Ensure rate limiting is configured on public endpoints.

## Testing Standards
- Every service, controller, and repository must have a corresponding unit test file (e.g., `*.service.spec.ts`).
- Write integration/E2E tests for API routes to verify full request-response lifecycle.
- Maintain test coverage above 80%.
