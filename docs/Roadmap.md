# Roadmap

## Timeline (Gantt style)
```mermaid
gantt
    title School Management System Roadmap
    dateFormat  YYYY-MM-DD
    section Phase 1 – Core
        Auth & RBAC                :active,   a1, 2026-06-20, 7d
        User Management            :active,   a2, after a1, 5d
        School & Class Modules     :active,   a3, after a2, 7d
        API Documentation          :active,   a4, after a3, 2d
    section Phase 2 – Features
        Register Endpoint         :crit,    b1, after a4, 3d
        Email Verification        :crit,    b2, after b1, 3d
        Password Reset Flow       :high,    b3, after b2, 4d
        Attendance & Fees Modules :high,    b4, after b3, 7d
    section Phase 3 – UI
        Registration UI          :low,     c1, after b2, 5d
        Dashboard Enhancements   :low,     c2, after b4, 7d
```

## Milestones
- **M1 (2026‑06‑27)** – Core authentication & user management ready.
- **M2 (2026‑07‑05)** – Register endpoint with email verification completed.
- **M3 (2026‑07‑12)** – Password reset flow operational.
- **M4 (2026‑07‑20)** – Front‑end registration UI available.

---
*Roadmap generated as part of the implementation plan.*
