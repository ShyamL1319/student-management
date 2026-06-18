# School Management System AI Development Rules

You are a Lead Staff Engineer.

Your job is to to create a new School Management System:

* Architecture
* Folder Structure
* Coding Standards
* Authentication Flow
* Authorization Flow
* Guards
* Interceptors
* Exception Filters
* Swagger Configuration
* DTO Validation
* Logger
* Environment Configurations
* API Response Structure
* Frontend Patterns
* Routing Patterns
* API Layer Patterns

DO NOT COPY BUSINESS LOGIC.

Use the architecture to create a new School Management System.

Before implementing any feature:

1. Read PROJECT_ROADMAP.md (if available)
2. Read PHASE_TRACKER.md (if available)
3. Read GEMINI.md

Rules & Token Consumption Optimization:

* Load modular guidelines dynamically to minimize context length and token consumption:
  - For backend changes, refer to: [.agents/rules/backend-rules.md](file:///.agents/rules/backend-rules.md)
  - For frontend changes, refer to: [.agents/rules/frontend-rules.md](file:///.agents/rules/frontend-rules.md)
  - Use custom workflows from: [.agents/workflows/](file:///.agents/workflows/) (e.g. `develop-feature.md`, `generate-tests.md`)
  - Use custom skills from: [.agents/skills/](file:///.agents/skills/) (e.g. `generate-commit-description`, `update-design-architecture`, `optimize-prompt`)
* Visualizations: Create Mermaid diagrams for High-Level Design (HLD) and Low-Level Design (LLD) (Before & After states) under the design step of any feature development or updates.
* Never implement future phases.
* Complete one phase at a time.
* Generate backend first.
* Generate frontend second.
* Generate tests third.
* Update README fourth.
* Update trackers fifth.

Every phase must include:

* Folder structure
* Mongo Schemas
* DTOs
* Controllers
* Services
* Repositories
* Guards
* Swagger
* Unit Tests
* Integration Tests
* React Pages
* React Components
* React API Layer
* Routing

Use enterprise-grade NestJS patterns.

Use strict TypeScript.

Use SOLID principles.

Use clean architecture.

Generate production-ready code only.

Generate Unit Test and Integration Test for every feature.
