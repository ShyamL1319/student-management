# Frontend Timetable Module

This module provides UI components and pages for managing school timetables.

## Components

### TimetableList
A comprehensive data table for managing all timetable entries.

**Features:**
- Paginated list of all timetables
- Inline CRUD operations
- Filter by class, teacher, day, academic year
- Dialog-based form for creating and editing entries
- Responsive design with Material-UI

**Props:** None (uses API directly)

**Usage:**
```tsx
import { TimetableList } from '../features/timetables/components';

<TimetableList />
```

### WeeklyTimetableView
Displays class schedule organized by day of week.

**Features:**
- Weekly schedule grouped by day (Monday-Saturday)
- Shows teacher, subject, and room information
- Filter by academic year
- Time slots automatically sorted
- Card-based layout for each day

**Props:**
- `classId?: string` - Optional initial class ID

**Usage:**
```tsx
import { WeeklyTimetableView } from '../features/timetables/components';

<WeeklyTimetableView classId="507f1f77bcf86cd799439011" />
```

### TeacherTimetableView
Shows all classes assigned to a specific teacher.

**Features:**
- All classes for a teacher
- Filter by academic year
- Shows class, subject, room, and section information
- Sortable by time
- Empty state handling

**Props:**
- `teacherId?: string` - Optional initial teacher ID

**Usage:**
```tsx
import { TeacherTimetableView } from '../features/timetables/components';

<TeacherTimetableView teacherId="507f1f77bcf86cd799439013" />
```

### ConflictDetector
Standalone conflict checking tool.

**Features:**
- Check for scheduling conflicts before saving
- No entry creation required
- Displays conflict type and details
- Shows conflicting timetable information
- Helps in planning schedules

**Props:** None

**Usage:**
```tsx
import { ConflictDetector } from '../features/timetables/components';

<ConflictDetector />
```

## Pages

### TimetablePage
Main page with tabbed interface combining all timetable functionality.

**Tabs:**
1. **All Timetables** - Manage all timetable entries
2. **Weekly Schedule** - View class weekly schedule
3. **Teacher Schedule** - View teacher assignments
4. **Conflict Detection** - Check for scheduling conflicts

**Usage:**
```tsx
import TimetablePage from '../features/timetables/pages/TimetablePage';

<TimetablePage />
```

## API Integration

The module uses `timetableAPI` for all backend communication:

```typescript
import { timetableAPI } from '../api/timetables/timetableAPI';

// Create
await timetableAPI.create(timetable);

// Get all with filters
await timetableAPI.getAll({ page: 1, limit: 10 });

// Get by ID
await timetableAPI.getById(id);

// Update
await timetableAPI.update(id, updateData);

// Delete
await timetableAPI.delete(id);

// Get class timetable
await timetableAPI.getClassTimetable(classId);

// Get weekly timetable
await timetableAPI.getWeeklyTimetable(classId);

// Get teacher timetable
await timetableAPI.getTeacherTimetable(teacherId);

// Check conflicts
await timetableAPI.checkConflict(conflict);

// Bulk create
await timetableAPI.bulkCreate(timetables);
```

## Data Types

### Timetable
```typescript
interface Timetable {
  _id?: string;
  class: string;
  academicYear: string;
  teacher: string;
  subject: string;
  section?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room?: string;
  notes?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

### ConflictResponse
```typescript
interface ConflictResponse {
  hasConflict: boolean;
  conflicts: Array<{
    timetableId: string;
    class: string;
    teacher: string;
    subject: string;
    startTime: string;
    endTime: string;
    dayOfWeek: string;
    conflictType: 'TEACHER_DOUBLE_BOOKING' | 'CLASS_OVERLAP';
  }>;
}
```

## Styling

Components use Material-UI (MUI) for styling:
- `Box` for layout
- `Card` for grouping
- `Table` for data display
- `Dialog` for forms
- `Alert` for notifications
- `Chip` for status indicators

Custom styling can be added via `sx` prop or creating theme overrides.

## Error Handling

All components include error handling with user-friendly messages:

```tsx
{error && (
  <Alert severity="error" sx={{ mb: 2 }}>
    {error}
  </Alert>
)}
```

## Loading States

Components show loading indicator during API calls:

```tsx
{loading && (
  <Box display="flex" justifyContent="center" alignItems="center">
    <CircularProgress />
  </Box>
)}
```

## Routing

Add to your routing configuration:

```tsx
import TimetablePage from './features/timetables/pages/TimetablePage';

const routes = [
  {
    path: '/timetables',
    component: TimetablePage,
  },
];
```

## Features

### Time Slot Management
- 24-hour format (HH:mm)
- Validation of time ranges
- Automatic sorting by time

### Conflict Detection
- Teacher double booking detection
- Class overlap detection
- Real-time validation on create/update
- Detailed conflict information

### Filtering
- By class, teacher, day of week
- By academic year
- By section
- By active status

### Pagination
- Page-based navigation
- Configurable items per page
- Total count display

## State Management

Components manage their own state using React hooks:
- `useState` for component data
- `useEffect` for data fetching
- Error and loading states

For global state management, integrate with Redux or Context API as needed.

## Accessibility

Components follow WCAG guidelines:
- Semantic HTML
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management in dialogs

## Performance

- Pagination to limit API calls
- Sorted queries
- Indexed database queries
- Memoized components where needed

## Testing

Example test structure:

```tsx
describe('TimetableList', () => {
  it('should render timetable list', () => {
    render(<TimetableList />);
    // assertions
  });

  it('should handle create', () => {
    // test create functionality
  });
});
```

## Future Enhancements

- Calendar view with drag-drop
- Bulk import from CSV/Excel
- Print/export functionality
- Notifications for schedule changes
- Room availability overlay
- Teacher workload visualization
- Student schedule collision detection
