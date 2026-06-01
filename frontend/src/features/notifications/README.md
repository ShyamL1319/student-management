# Frontend Notifications Module

This module provides a comprehensive notification management system for the School Management System frontend.

## Components

### NotificationBell
A header component that displays the unread notification count and provides quick access to notifications.

```tsx
import { NotificationBell } from '@/features/notifications';

<NotificationBell onNotificationClick={() => navigate('/notifications')} />
```

**Features:**
- Displays unread count with animated badge
- Real-time unread count updates
- Quick dropdown preview
- Navigation to full notification center

### NotificationCenter
Main page component for managing and viewing all notifications.

```tsx
import { NotificationCenter } from '@/features/notifications';

<NotificationCenter />
```

**Features:**
- View all notifications
- Filter by status (all, unread, failed)
- Mark notifications as read
- Retry failed notifications
- Delete notifications
- Clear all notifications
- View notification statistics

### NotificationPreferences
Page component for managing notification preferences and settings.

```tsx
import { NotificationPreferences } from '@/features/notifications';

<NotificationPreferences />
```

**Features:**
- Enable/disable notification channels (Email, SMS, In-App)
- Configure quiet hours
- Toggle Do Not Disturb mode
- Event type preferences

## API Integration

The module includes a complete API client (`notificationAPI`) with the following methods:

### Notifications
- `create(notification)` - Create and send a notification
- `getAll(params)` - Get all notifications with filtering
- `getById(id)` - Get single notification
- `update(id, data)` - Update notification
- `markAsRead(id)` - Mark as read
- `markAllAsRead()` - Mark all as read
- `delete(id)` - Delete notification
- `clearAll()` - Delete all notifications
- `getUnreadCount()` - Get unread notification count
- `getStatistics()` - Get notification statistics
- `retryFailed(id)` - Retry failed notification

### Preferences
- `getPreferences()` - Get user preferences
- `updatePreferences(data)` - Update preferences
- `enableChannel(channel)` - Enable a notification channel
- `disableChannel(channel)` - Disable a notification channel
- `enableEvent(eventType)` - Enable event notifications
- `disableEvent(eventType)` - Disable event notifications

### Templates
- `createTemplate(template)` - Create notification template
- `getTemplates(filters)` - Get all templates
- `getTemplateById(id)` - Get template by ID
- `updateTemplate(id, data)` - Update template
- `deleteTemplate(id)` - Delete template

### Events
- `triggerAttendanceAlert(data)` - Trigger attendance alert
- `triggerFeeAlert(data)` - Trigger fee alert
- `triggerResultAlert(data)` - Trigger result alert
- `getEvents(filters)` - Get all events
- `getEventById(id)` - Get event by ID
- `getEventStatistics()` - Get event statistics

## Integration with Sidebar

Add to your sidebar/navigation:

```tsx
import { Link } from 'react-router-dom';

<Link to="/notifications" className="sidebar-item">
  <i className="fas fa-bell"></i>
  Notifications
</Link>

<Link to="/notification-preferences" className="sidebar-item">
  <i className="fas fa-cog"></i>
  Notification Settings
</Link>
```

## Usage Examples

### Display Notification Center
```tsx
import { NotificationCenter } from '@/features/notifications';

export const NotificationPage = () => {
  return (
    <div>
      <NotificationCenter />
    </div>
  );
};
```

### Add to Header
```tsx
import { NotificationBell } from '@/features/notifications';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const navigate = useNavigate();

  return (
    <header>
      <h1>School Management System</h1>
      <NotificationBell onNotificationClick={() => navigate('/notifications')} />
    </header>
  );
};
```

### Trigger Notifications from Other Modules

```tsx
import { notificationAPI } from '@/features/notifications';

// Trigger attendance alert
const handleLowAttendance = async (student) => {
  await notificationAPI.triggerAttendanceAlert({
    studentId: student._id,
    studentEmail: student.email,
    studentPhone: student.phone,
    absenceCount: 5,
    attendancePercentage: 70,
  });
};

// Trigger fee alert
const handlePendingFees = async (student) => {
  await notificationAPI.triggerFeeAlert({
    studentId: student._id,
    studentEmail: student.email,
    studentPhone: student.phone,
    pendingAmount: 5000,
    dueDate: '2024-12-31',
  });
};

// Trigger result alert
const handleResultPublished = async (student) => {
  await notificationAPI.triggerResultAlert({
    studentId: student._id,
    studentEmail: student.email,
    studentPhone: student.phone,
    examName: 'Midterm Exam',
    totalMarks: 100,
    obtainedMarks: 85,
    percentage: 85,
  });
};
```

## Styling

All components come with pre-built CSS modules. You can customize the appearance by modifying the CSS files or overriding the styles in your global CSS.

### Theme Colors
- Primary: #007bff (Blue)
- Success: #28a745 (Green)
- Danger: #dc3545 (Red)
- Warning: #ffc107 (Yellow)

## Responsive Design

All components are fully responsive and work on:
- Desktop (1024px and above)
- Tablet (768px to 1024px)
- Mobile (below 768px)

## Environment Variables

Make sure your `.env` file has:
```
VITE_API_URL=http://localhost:3000/api
```

## File Structure

```
notifications/
├── components/
│   ├── NotificationBell.tsx
│   └── NotificationBell.css
├── pages/
│   ├── NotificationCenter.tsx
│   ├── NotificationCenter.css
│   ├── NotificationPreferences.tsx
│   └── NotificationPreferences.css
├── notificationAPI.ts
├── index.ts
└── README.md
```

## Future Enhancements

- Real-time notifications using WebSocket
- Sound notifications
- Desktop notifications
- Notification scheduling
- Notification templates editor
- Advanced filtering and search
- Notification analytics
