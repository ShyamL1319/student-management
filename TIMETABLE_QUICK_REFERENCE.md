# Timetable Module - Developer's Quick Reference

## 📚 Module Structure

```
backend/src/timetables/
├── dto/
│   ├── create-timetable.dto.ts
│   ├── update-timetable.dto.ts
│   └── check-conflict.dto.ts
├── schemas/
│   └── timetable.schema.ts
├── timetables.controller.ts
├── timetables.module.ts
├── timetables.service.ts
├── timetables.service.spec.ts
├── timetables.e2e-spec.ts
└── README.md

frontend/src/features/timetables/
├── components/
│   ├── TimetableList.tsx
│   ├── WeeklyTimetableView.tsx
│   ├── TeacherTimetableView.tsx
│   ├── ConflictDetector.tsx
│   └── index.ts
├── pages/
│   └── TimetablePage.tsx
├── api/
│   └── timetableAPI.ts
└── README.md
```

## 🔧 Common Tasks

### Adding a New Timetable Entry

**Backend:**
```typescript
// In your service
const timetable = await this.timetablesService.create({
  class: classId,
  academicYear: academicYearId,
  teacher: teacherId,
  subject: subjectId,
  dayOfWeek: 'MONDAY',
  startTime: '09:00',
  endTime: '10:00',
  room: 'Room 101'
});
```

**Frontend:**
```typescript
import { timetableAPI } from '../api/timetables/timetableAPI';

const newTimetable = await timetableAPI.create({
  class: '507f1f77bcf86cd799439011',
  academicYear: '507f1f77bcf86cd799439012',
  teacher: '507f1f77bcf86cd799439013',
  subject: '507f1f77bcf86cd799439014',
  dayOfWeek: 'MONDAY',
  startTime: '09:00',
  endTime: '10:00',
  room: 'Room 101'
});
```

### Checking for Conflicts

```typescript
const conflictResult = await timetableAPI.checkConflict({
  teacher: teacherId,
  class: classId,
  dayOfWeek: 'MONDAY',
  startTime: '09:00',
  endTime: '10:00'
});

if (conflictResult.hasConflict) {
  console.log('Conflicts found:', conflictResult.conflicts);
}
```

### Getting a Weekly Schedule

```typescript
// Get weekly schedule for a class
const weeklySchedule = await timetableAPI.getWeeklyTimetable(classId);

// Access by day
console.log(weeklySchedule['MONDAY']); // Array of Monday classes
console.log(weeklySchedule['TUESDAY']); // Array of Tuesday classes
```

### Getting a Teacher's Schedule

```typescript
const teacherSchedule = await timetableAPI.getTeacherTimetable(teacherId, {
  academicYear: academicYearId
});

// teacherSchedule is an array sorted by day and time
```

## 📋 API Endpoints Quick Reference

| Operation | Method | Endpoint | Notes |
|-----------|--------|----------|-------|
| List | GET | `/timetables` | Paginated |
| Create | POST | `/timetables` | With conflict detection |
| Get One | GET | `/timetables/:id` | Populated references |
| Update | PATCH | `/timetables/:id` | With conflict detection |
| Delete | DELETE | `/timetables/:id` | - |
| Class Schedule | GET | `/timetables/class/:id` | Sorted by time |
| Weekly View | GET | `/timetables/class/:id/weekly` | Grouped by day |
| Teacher Schedule | GET | `/timetables/teacher/:id` | Sorted by time |
| Check Conflicts | POST | `/timetables/check-conflict` | No entry created |
| Bulk Create | POST | `/timetables/bulk-create` | Array of entries |

## 🔍 Query Parameters

All list endpoints accept:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `class` - Filter by class ID
- `teacher` - Filter by teacher ID
- `dayOfWeek` - Filter by day
- `academicYear` - Filter by academic year ID
- `section` - Filter by section ID
- `isActive` - Filter by active status

Example:
```
GET /timetables?page=2&limit=20&dayOfWeek=MONDAY&academicYear=507f1f77bcf86cd799439012
```

## 🛡️ Error Handling

### Common Errors

**400 - Invalid Time Format**
```json
{
  "statusCode": 400,
  "message": "Invalid time format: 25:00. Expected HH:mm",
  "error": "Bad Request"
}
```

**400 - Scheduling Conflict**
```json
{
  "statusCode": 400,
  "message": "Scheduling conflict detected: [...]",
  "error": "Bad Request"
}
```

**404 - Not Found**
```json
{
  "statusCode": 404,
  "message": "Timetable with ID 507f1f77bcf86cd799439015 not found",
  "error": "Not Found"
}
```

### Handling in Frontend

```typescript
try {
  const result = await timetableAPI.create(data);
} catch (error: any) {
  const message = error.response?.data?.message || 'Unknown error';
  console.error('Failed to create timetable:', message);
  // Show user-friendly error message
}
```

## 🧪 Testing

### Run Unit Tests
```bash
npm test -- timetables.service.spec.ts
```

### Run E2E Tests
```bash
npm run test:e2e -- timetables.e2e-spec.ts
```

### Test Conflict Detection

```typescript
// Should detect conflict
const conflict = await service.detectConflicts({
  teacher: teacherId,
  class: classId,
  dayOfWeek: 'MONDAY',
  startTime: '09:30', // Overlaps with 09:00-10:00
  endTime: '10:30'
});

expect(conflict.hasConflict).toBe(true);
```

## 📊 Data Types

### Timetable Entity

```typescript
{
  _id: string;
  class: ObjectId | ClassDocument;
  academicYear: ObjectId | AcademicYearDocument;
  teacher: ObjectId | TeacherDocument;
  subject: ObjectId | SubjectDocument;
  section?: ObjectId | SectionDocument;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  room?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Conflict Type

```typescript
type ConflictType = 'TEACHER_DOUBLE_BOOKING' | 'CLASS_OVERLAP';

// TEACHER_DOUBLE_BOOKING: Same teacher scheduled twice at overlapping times
// CLASS_OVERLAP: Same class scheduled with different teachers at overlapping times
```

## 🎨 Frontend Components

### TimetableList
```tsx
<TimetableList />
```
- Full CRUD interface
- Pagination
- Filtering
- Form dialog for create/edit

### WeeklyTimetableView
```tsx
<WeeklyTimetableView classId="id" />
```
- Weekly schedule by day
- Optional: `academicYear` in query params

### TeacherTimetableView
```tsx
<TeacherTimetableView teacherId="id" />
```
- Teacher's schedule
- Optional: `academicYear` in query params

### ConflictDetector
```tsx
<ConflictDetector />
```
- Standalone conflict checker
- No entry creation

## 🔐 Authentication & Authorization

All endpoints require:
- **JWT Token** in Authorization header: `Bearer <token>`
- **RBAC Guards** to restrict operations by user role

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('timetables')
export class TimetablesController { ... }
```

## 📈 Performance Tips

1. **Use pagination** for large datasets
2. **Filter by academic year** to reduce results
3. **Use weekly/teacher endpoints** instead of filtering all entries
4. **Batch bulk operations** instead of individual creates
5. **Use indexes** for frequently queried fields

## 🚀 Extending the Module

### Adding a New Endpoint

1. **Create DTO** in `dto/` folder
2. **Add method** to `TimetablesService`
3. **Add route** to `TimetablesController`
4. **Add Swagger docs** with `@ApiOperation` decorator
5. **Write tests** for new functionality

Example:
```typescript
// In service
async getTimetableByRoom(room: string): Promise<Timetable[]> {
  return this.timetableModel.find({ room }).exec();
}

// In controller
@Get('room/:room')
getByRoom(@Param('room') room: string) {
  return this.timetablesService.getTimetableByRoom(room);
}
```

### Adding a New Filter

1. Add field to query parameters
2. Update service `findAll` method
3. Update DTOs if needed
4. Update tests

## 📝 Documentation References

- **Backend API Docs**: `backend/src/timetables/README.md`
- **Frontend Component Docs**: `frontend/src/features/timetables/README.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY_PHASE_14.md`
- **Phase Tracker**: `PHASE_TRACKER.md`

## 🐛 Debugging

### Enable Debug Logging

```typescript
// In service
private logger = new Logger('TimetablesService');

async create(dto: CreateTimetableDto) {
  this.logger.debug(`Creating timetable for class ${dto.class}`);
  // ...
}
```

### Common Issues

**Issue**: Conflicts not being detected
- Check time format (must be HH:mm)
- Verify teacher/class IDs are correct
- Check day of week is in enum values

**Issue**: Slow queries
- Verify indexes exist in MongoDB
- Use pagination
- Filter by academic year

**Issue**: 404 errors
- Verify timetable ID exists
- Check ObjectId is valid format
- Ensure related documents exist (class, teacher, etc.)

## 🔗 Related Modules

- **Classes** - Class references
- **Teachers** - Teacher assignments
- **Subjects** - Subject content
- **AcademicYears** - Academic year filtering
- **Sections** - Section details
- **Attendance** - Uses timetable for marking attendance
- **Marks** - May reference timetable for sessions

---

**Last Updated**: May 31, 2026
**Version**: 1.0
**Status**: Production Ready
