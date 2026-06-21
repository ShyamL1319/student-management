# Database Documentation

## Overview
The system uses **MongoDB** with Mongoose schemas. Below is a high‑level ER diagram of the core collections.

```mermaid
erDiagram
    USER ||--o{ ROLE : assigned
    USER }|..|{ SCHOOL : belongs_to
    ROLE ||--o{ PERMISSION : has
    SCHOOL ||--o{ CLASS : contains
    CLASS ||--o{ SECTION : contains
    SECTION ||--o{ STUDENT : enrolled
    STUDENT ||--o{ ATTENDANCE : records
    STUDENT ||--o{ MARK : records
    STUDENT ||--o{ FEE : invoicing
    TEACHER ||--o{ CLASS : teaches
    TEACHER ||--o{ SUBJECT : teaches
    PAYMENT }|..|{ FEE : pays
    PAYMENT }|..|{ STUDENT : for
```

### Key Collections
| Collection | Important Fields | Indexes |
|------------|----------------|--------|
| **User** | `_id`, `email`, `firstName`, `lastName`, `role`, `schoolId`, `passwordHash`, `refreshTokenHash`, `mfaSecret`, `mfaEnabled` | Unique index on `email` |
| **Role** | `_id`, `name`, `permissions` | Unique index on `name` |
| **School** | `_id`, `name`, `address` | - |
| **Class** | `_id`, `name`, `schoolId`, `teacherId` | - |
| **Section** | `_id`, `name`, `classId` | - |
| **Student** | `_id`, `firstName`, `lastName`, `schoolId`, `classId`, `sectionId`, `email` | Index on `email` |
| **Attendance** | `_id`, `studentId`, `date`, `status` | Compound index on `studentId`+`date` |
| **Fee** | `_id`, `studentId`, `amount`, `dueDate`, `paid` | Index on `studentId` |
| **Payment** | `_id`, `studentId`, `feeId`, `amount`, `date` | Index on `studentId` |

*All collections are defined in `backend/src/*/schemas/*.schema.ts`.*

---
*Documentation generated as part of the implementation plan.*


### Additional Collections
| Collection | Important Fields | Indexes |
|------------|------------------|---------|
| **AcademicYear** | `_id`, `name`, `startDate`, `endDate`, `schoolId` | Unique index on `schoolId`+`name` |
| **Admission** | `_id`, `studentInfo`, `status`, `appliedDate`, `schoolId` | Index on `schoolId` |
| **AuditLog** | `_id`, `action`, `performedBy`, `timestamp`, `entityId`, `entityType` | Index on `performedBy`, `timestamp` |
| **Permission** | `_id`, `name`, `description` | Unique index on `name` |
| **Settings** | `_id`, `key`, `value`, `tenantId` | Unique index on `tenantId`+`key` |
| **Report** | `_id`, `title`, `type`, `createdBy`, `createdAt`, `data` | Index on `createdBy` |
| **Department** | `_id`, `name`, `schoolId` | Unique index on `schoolId`+`name` |
| **Teacher** | `_id`, `firstName`, `lastName`, `email`, `schoolId`, `departmentId` | Unique index on `email` |

*All collections are defined in their respective `backend/src/*/schemas/*.schema.ts` files.*

---
## Extended ER Diagram (Including New Modules)

```mermaid
erDiagram
    USER ||--o{ ROLE : assigned
    USER }|..|{ SCHOOL : belongs_to
    ROLE ||--o{ PERMISSION : has
    SCHOOL ||--o{ CLASS : contains
    CLASS ||--o{ SECTION : contains
    SECTION ||--o{ STUDENT : enrolled
    STUDENT ||--o{ ATTENDANCE : records
    STUDENT ||--o{ MARK : records
    STUDENT ||--o{ FEE : invoicing
    TEACHER ||--o{ CLASS : teaches
    TEACHER ||--o{ SUBJECT : teaches
    PAYMENT }|..|{ FEE : pays
    PAYMENT }|..|{ STUDENT : for
    ACADEMIC_YEAR ||--|| SCHOOL : belongs_to
    ADMISSION }|..|{ STUDENT : applicant
    AUDIT_LOG }|..|{ USER : performed_by
    SETTINGS }|..|{ TENANT : scoped_to
    REPORT }|..|{ USER : created_by
    DEPARTMENT ||--|| SCHOOL : part_of
    TEACHER ||--|| DEPARTMENT : belongs_to
```
```
