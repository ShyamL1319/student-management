---
name: generate-tests
description: Guide for creating backend and frontend tests to ensure coverage targets are met efficiently.
---

# Generate Tests Workflow

Use this workflow to write unit, integration, and E2E tests for the application.

## Test Guidelines

### 1. Backend Testing (NestJS)
- **File Naming**: Place tests next to the implementation file (e.g., `user.service.spec.ts`).
- **Dependencies & Mocking**:
  - Use `Test.createTestingModule()` to mock dependencies.
  - Mock repository calls using Jest mock functions (e.g., `jest.fn()`).
  - Do not spin up real databases in unit tests.
- **Coverage**:
  - Test positive paths (happy path).
  - Test failure/exception conditions (validating guards, DTO constraints, missing resource payloads).

### 2. Frontend Testing (React)
- **Unit & Component Testing**:
  - Render components using standard testing libraries.
  - Verify layout labels, active text inputs, and select options.
  - Mock API requests (e.g. mock Axios responses).
- **Behavior Validation**:
  - Test button submission clicks and trigger conditions.
  - Verify loading spinners appear on fetch and disappear on resolving.
  - Assert that success alerts or error Snackbars display correctly.

### 3. Execution Commands
- Backend: `npm --prefix backend run test`
- Frontend: `npm --prefix frontend run test`
