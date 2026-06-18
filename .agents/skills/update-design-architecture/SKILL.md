---
name: update-design-architecture
description: Guidelines and patterns for creating or updating application design, styling, and backend/frontend architecture.
---

# Update Application Design and Architecture Skill

This skill guides the agent to design and implement application features in compliance with the codebase's architecture and design systems.

## When to use this skill
- When requested to design, implement, or refactor backend architecture, modules, routes, databases, or services.
- When creating or modifying frontend routes, components, styles, state management, or user interface flows.
- When adding new modules or updating code layout guidelines.

## Architectural Conventions

### 1. Backend Architecture (NestJS + MongoDB)
- **Module Structure**: Follow the Controller-Service-Repository modular pattern. Every logical domain (e.g. `auth`, `users`, `students`) must have a self-contained module.
- **Repository Pattern**: Abstract direct database calls from services using Repository classes. Do not invoke Mongoose models directly in NestJS Services.
- **Strict Input Validation**:
  - Define clear Data Transfer Objects (DTOs) with `class-validator` and `class-transformer`.
  - Always validate request bodies and parameters.
- **Swagger Documentation**: Use `@ApiTags`, `@ApiOperation`, `@ApiResponse`, and `@ApiProperty` decorators on all controllers and DTOs.
- **Security & Authorization**:
  - Secure all endpoints with stateless JWT authentication.
  - Implement Role-Based Access Control (RBAC) using guards (e.g. `@Roles()`).

### 2. Frontend Architecture (React + Vite + TS)
- **Directory Structure**: Group files by features (`src/features/*`). Each feature contains its own:
  - `pages/` (page components)
  - `components/` (sub-components)
  - `api/` (Axios API services)
  - `hooks/` (React Query hooks)
- **Routing**: Define protected routes in `App.tsx` utilizing a central protection guard enforcing authentication state and role validation.
- **Server State**: Use React Query for caching, queries, and mutations. Avoid syncing server data to global context or local component state.
- **HTTP Client**: Wrap Axios for unified API queries, base URLs, and interceptors (e.g., attaching authorization tokens and request tracking headers).

### 3. Architecture Visualizations (Mermaid Diagrams)
- **Mandatory Documentation**: Every new feature or feature update must be accompanied by Mermaid diagrams representing:
  - **High-Level Design (HLD)**: Conceptual system data flow, modules, and component boundaries.
  - **Low-Level Design (LLD)**: Internal class relationships, controllers, services, repositories, API schemas, and state updates.
- **Before/After States**: Provide both **"Before"** and **"After"** diagrams to clearly illustrate how the changes modify the existing architecture.

## UI/UX Design System Guidelines

- **Theme Strategy**: Utilize Material UI (MUI) custom-styled theme settings (defined in `src/theme.ts`).
- **Soft UI Principles**:
  - Border Radius: Set to `8px` or `12px` for a soft rounded aesthetic.
  - Borders: Avoid heavy drop-shadows. Favor flat borders (`1px solid #e2e8f0`).
- **Typography System**:
  - Headings: Use `Outfit` font for modern, bold headings.
  - Body & Buttons: Use `Inter` font for clear readability.
- **Immediate User Feedback**:
  - Use `CircularProgress` inside submission buttons during loading.
  - Use Snackbars/Alerts for success or error operations.
  - Ensure empty list states display meaningful empty-state indicators rather than blank screens.
- **Micro-interactions**: Use transitions and hover states for interactive controls. Code status chips dynamically based on the state/role (e.g. custom color mapping helper).

## Engineering Standards
- **Strict TypeScript**: Never use `any`. Explicitly type all variables, function arguments, and return types.
- **SOLID & DRY**: Minimize code duplication. Refactor reusable operations into helper services or layout components.
- **Automated Tests**: Write Unit and Integration tests for every backend service, controller, and frontend utility. Aim for >80% code coverage.
