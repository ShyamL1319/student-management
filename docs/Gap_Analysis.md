# Gap Analysis

## Overview
This document identifies missing functionality, technical debt, and improvement opportunities based on the current state of the School Management System.

| Area | Gap | Impact | Priority |
|------|-----|--------|----------|
| **Auth** | Missing **Register** endpoint with email verification | Users cannot self‑register; onboarding is manual. | **High** |
| **Auth** | No **password reset** email flow (only stub) | Users cannot recover forgotten passwords securely. | **Medium** |
| **User Schema** | No fields for email verification (`isEmailVerified`, `emailVerificationToken`) | Email verification logic cannot persist state. | **High** |
| **API Docs** | Incomplete documentation for new endpoints and some existing ones. | Developers lack full contract details. | **Medium** |
| **Testing** | Coverage below 80 % for Auth module | Risk of regressions in authentication flow. | **High** |
| **Frontend** | No UI for registration or email verification pages. | Complete user flow is unavailable. | **Future Phase** |
| **RBAC** | Role‑based restrictions not defined for registration (public) | Should be explicit in docs. | **Low** |
| **Deployment** | No CI/CD pipeline for automated migrations of new schema fields. | Manual steps required when deploying updates. | **Medium** |

### Recommended Actions
1. Implement Register endpoint with DTO validation, email verification, and proper Swagger docs. *(Current task)*
2. Extend `User` schema with verification fields and update migration scripts.
3. Add comprehensive API documentation for all modules.
4. Write unit and integration tests for Auth flows to reach 80 % coverage.
5. Plan frontend registration screens for the next phase.
6. Document CI/CD steps for schema migrations.

---
*Generated as part of the implementation plan.*
