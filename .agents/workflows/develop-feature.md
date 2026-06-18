---
name: develop-feature
description: Guide for developing backend and frontend features step-by-step to prevent excessive code generation and token consumption.
---

# Develop Feature Workflow

Use this workflow to structure feature development, saving token bandwidth by addressing components incrementally rather than all at once.

## Steps

### Step 1: Design Phase
- Define the business logic requirements.
- Map the data entities needed.
- Write down the endpoints and routing structure.
- **Visualize Architecture**: Create Mermaid diagrams showing:
  - **High-Level Design (HLD)** (conceptual boundaries, module interactions) both **Before** and **After** the changes.
  - **Low-Level Design (LLD)** (class structures, schemas, routes, controller-to-repository relations) both **Before** and **After** the changes.
- **Stop**: Present this design along with the before/after Mermaid diagrams to the user for feedback before writing any code.


### Step 2: Backend Foundations
- Create Mongoose schema / database models under `backend/src/<feature>/schemas/`.
- Define Data Transfer Objects (DTOs) for incoming requests and register validation decorators.
- Implement Repository class to handle schema queries.

### Step 3: Backend Business Logic
- Create NestJS Services to hold the business logic. Inject the repository.
- Write Unit and Integration tests for services to ensure behavior works correctly.

### Step 4: Backend API Delivery
- Create Controllers and map endpoints.
- Secure endpoints with authentication and RBAC guards.
- Document endpoints with Swagger.

### Step 5: Frontend API Integration
- Setup Axios services to query the backend endpoints.
- Implement React Query custom hooks (`useQuery` / `useMutation`) for caching and lifecycle state.

### Step 6: Frontend Pages & Components
- Build UI layout, fields, tables, actions, and menus using Material UI.
- Apply Soft UI borders, Outfitters/Inter fonts, and loading states.
