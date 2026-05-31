# Timetable Module

The Timetable Module manages school timetables, including weekly class schedules, teacher schedules, and automatic conflict detection.

## Features

### 1. **Weekly Timetable**
- View class schedule organized by day of week
- Display all classes for a specific class across the week
- Filter by academic year
- Time slots are automatically sorted

### 2. **Teacher Timetable**
- View all classes assigned to a specific teacher
- Filter by academic year
- See class information, subject, room, and timing
- Helps teachers manage their schedule

### 3. **Class Timetable**
- View all classes for a specific class
- See teacher, subject, and room information
- Filter by day of week or academic year
- Sorted by time for easy reading

### 4. **Conflict Detection**
- Automatically detects scheduling conflicts when creating/updating entries
- Checks for:
  - **Teacher Double Booking**: Teacher assigned to two classes at overlapping times
  - **Class Overlap**: Class assigned two different teachers/subjects at overlapping times
- Prevents saving timetable entries with conflicts
- Provides detailed conflict information on validation failure

## API Endpoints

### Timetable Management

#### Create Timetable Entry
- **POST** `/api/timetables`
- Creates a new timetable entry with automatic conflict detection
- Returns `400 Bad Request` if conflicts are detected

#### Get All Timetables
- **GET** `/api/timetables?page=1&limit=10`
- Query Parameters:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `class`: Filter by class ID
  - `teacher`: Filter by teacher ID
  - `dayOfWeek`: Filter by day (MONDAY, TUESDAY, etc.)
  - `academicYear`: Filter by academic year ID
  - `section`: Filter by section ID
  - `isActive`: Filter by active status

#### Get Timetable by ID
- **GET** `/api/timetables/:id`
- Returns detailed timetable entry with populated references

#### Update Timetable Entry
- **PATCH** `/api/timetables/:id`
- Updates timetable with conflict detection
- Excludes current entry from conflict checks

#### Delete Timetable Entry
- **DELETE** `/api/timetables/:id`
- Soft or hard delete based on configuration

### Schedule Views

#### Get Weekly Timetable for Class
- **GET** `/api/timetables/class/:classId/weekly`
- Returns timetable grouped by day of week
- Query Parameters:
  - `academicYear`: Filter by academic year ID
  - `dayOfWeek`: Filter specific day

#### Get Class Timetable
- **GET** `/api/timetables/class/:classId`
- Returns sorted list of classes for specific class
- Query Parameters: `academicYear`, `dayOfWeek`

#### Get Teacher Timetable
- **GET** `/api/timetables/teacher/:teacherId`
- Returns sorted list of classes for specific teacher
- Query Parameters: `academicYear`, `dayOfWeek`

### Conflict Management

#### Check Conflicts
- **POST** `/api/timetables/check-conflict`
- Request Body:
  ```json
  {
    "teacher": "507f1f77bcf86cd799439013",
    "class": "507f1f77bcf86cd799439011",
    "dayOfWeek": "MONDAY",
    "startTime": "09:00",
    "endTime": "10:00",
    "excludeTimetableId": "507f1f77bcf86cd799439015" // Optional
  }
  ```
- Returns conflict information without creating entry

#### Bulk Create
- **POST** `/api/timetables/bulk-create`
- Request Body: Array of timetable objects
- Validates all entries and internal conflicts before creating
- Returns created entries or error with details

## Data Model

### Timetable Schema

```typescript
{
  class: ObjectId (ref: Class) - Required
  academicYear: ObjectId (ref: AcademicYear) - Required
  teacher: ObjectId (ref: Teacher) - Required
  subject: ObjectId (ref: Subject) - Required
  section: ObjectId (ref: Section) - Optional
  dayOfWeek: String (enum: MONDAY-SATURDAY) - Required
  startTime: String (HH:mm format) - Required
  endTime: String (HH:mm format) - Required
  room: String - Optional
  notes: String - Optional
  isActive: Boolean (default: true)
  createdAt: Date
  updatedAt: Date
}
```

## Frontend Components

### TimetableList
- Displays all timetable entries in paginated table format
- CRUD operations (Create, Read, Update, Delete)
- Inline editing with form dialog
- Populated references (class, teacher, subject)

### WeeklyTimetableView
- Shows class schedule organized by day of week
- Displays all classes for selected class
- Shows teacher, subject, and room information
- Easy-to-read card layout per day

### TeacherTimetableView
- Shows all classes assigned to a teacher
- Displays class information, subject, room, timing
- Useful for teacher scheduling

### ConflictDetector
- Standalone conflict checking interface
- No need to create entry to check conflicts
- Displays conflict type and details
- Helpful for planning timetable changes

## Usage Examples

### Creating a Timetable Entry

```typescript
const timetable = {
  class: '507f1f77bcf86cd799439011',
  academicYear: '507f1f77bcf86cd799439012',
  teacher: '507f1f77bcf86cd799439013',
  subject: '507f1f77bcf86cd799439014',
  dayOfWeek: 'MONDAY',
  startTime: '09:00',
  endTime: '10:00',
  room: 'Room 101',
  notes: 'Regular class',
};

const response = await timetableAPI.create(timetable);
```

### Checking Conflicts

```typescript
const conflict = await timetableAPI.checkConflict({
  teacher: '507f1f77bcf86cd799439013',
  class: '507f1f77bcf86cd799439011',
  dayOfWeek: 'MONDAY',
  startTime: '09:00',
  endTime: '10:00',
});

if (conflict.hasConflict) {
  console.log('Conflicts detected:', conflict.conflicts);
}
```

### Getting Weekly Timetable

```typescript
const weeklySchedule = await timetableAPI.getWeeklyTimetable(
  '507f1f77bcf86cd799439011'
);

// Access by day:
const mondayClasses = weeklySchedule['MONDAY'];
```

## Error Handling

### Common Errors

1. **Invalid Time Format**
   - Status: 400
   - Message: "Invalid time format: 25:00. Expected HH:mm"

2. **End Time Before Start Time**
   - Status: 400
   - Message: "End time must be after start time"

3. **Scheduling Conflict**
   - Status: 400
   - Message: "Scheduling conflict detected: [conflicts array]"
   - Includes detailed conflict information

4. **Not Found**
   - Status: 404
   - Message: "Timetable with ID {id} not found"

## Indexes

For optimal query performance, the following indexes are created:

- `{ class: 1, academicYear: 1, dayOfWeek: 1 }`
- `{ teacher: 1, academicYear: 1 }`
- `{ class: 1, dayOfWeek: 1, startTime: 1, endTime: 1 }`

## Testing

Unit tests cover:
- Timetable creation with validation
- Conflict detection (teacher double booking, class overlap)
- Time format validation
- Time range validation
- Bulk operations
- Weekly schedule grouping
- CRUD operations

Run tests with:
```bash
npm test -- timetables.service.spec.ts
```

## Future Enhancements

- Bulk import from CSV/Excel
- Timetable cloning from previous years
- Room availability checking
- Teacher workload analysis
- Student schedule collision detection
- Calendar view with drag-drop scheduling
- Notifications for schedule changes
- Export to calendar formats (iCal, Google Calendar)
