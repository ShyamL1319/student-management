# Notifications Module

The Notifications Module provides a comprehensive notification system for the School Management System. It supports multiple channels (Email, SMS, In-App) and handles various event types including Attendance Alerts, Fee Alerts, and Result Alerts.

## Features

### Notification Channels
- **Email**: Send notifications via email
- **SMS**: Send notifications via SMS (Twilio, AWS SNS, or Mock)
- **In-App**: Store in-app notifications in database

### Event Types
- **Attendance Alert**: Triggered when student attendance falls below threshold
- **Fee Alert**: Triggered when fees are pending or overdue
- **Result Alert**: Triggered when exam results are published
- **Exam Schedule**: Exam schedule notifications
- **Timetable Change**: Timetable change notifications
- **Announcement**: General announcements

### Core Features
- User notification preferences management
- Notification templates support
- Retry mechanism for failed notifications
- Unread notification tracking
- Notification history
- Statistics and reporting
- Event-based notification triggers
- Quiet hours configuration
- Do Not Disturb mode

## API Endpoints

### Notifications
- `POST /notifications` - Create and send notification
- `GET /notifications` - Get all notifications for current user
- `GET /notifications/:id` - Get notification by ID
- `PATCH /notifications/:id` - Update notification
- `PATCH /notifications/:id/read` - Mark as read
- `PATCH /notifications/read/all` - Mark all as read
- `POST /notifications/:id/retry` - Retry failed notification
- `DELETE /notifications/:id` - Delete notification
- `DELETE /notifications` - Clear all notifications
- `GET /notifications/unread/count` - Get unread count
- `GET /notifications/statistics` - Get statistics

### Notification Preferences
- `GET /notification-preferences` - Get user preferences
- `PATCH /notification-preferences` - Update preferences
- `PATCH /notification-preferences/channel/:channel/enable` - Enable channel
- `PATCH /notification-preferences/channel/:channel/disable` - Disable channel
- `PATCH /notification-preferences/event/:eventType/enable` - Enable event
- `PATCH /notification-preferences/event/:eventType/disable` - Disable event

### Notification Templates
- `POST /notification-templates` - Create template
- `GET /notification-templates` - Get all templates
- `GET /notification-templates/:id` - Get template by ID
- `PATCH /notification-templates/:id` - Update template
- `DELETE /notification-templates/:id` - Delete template

### Notification Events
- `POST /notification-events/attendance-alert` - Trigger attendance alert
- `POST /notification-events/fee-alert` - Trigger fee alert
- `POST /notification-events/result-alert` - Trigger result alert
- `GET /notification-events` - Get all events
- `GET /notification-events/:id` - Get event by ID
- `GET /notification-events/statistics` - Get event statistics

## Usage Examples

### Create and Send Notification
```bash
curl -X POST http://localhost:3000/notifications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "user123",
    "recipientEmail": "user@example.com",
    "eventType": "attendance-alert",
    "channel": "email",
    "subject": "Attendance Alert",
    "message": "Your attendance is below 75%"
  }'
```

### Get User Notifications
```bash
curl -X GET http://localhost:3000/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Preferences
```bash
curl -X PATCH http://localhost:3000/notification-preferences \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "emailNotifications": true,
    "smsNotifications": false,
    "inAppNotifications": true,
    "doNotDisturb": false
  }'
```

### Trigger Fee Alert
```bash
curl -X POST http://localhost:3000/notification-events/fee-alert \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student123",
    "studentEmail": "student@example.com",
    "studentPhone": "+1234567890",
    "pendingAmount": 5000,
    "dueDate": "2024-12-31"
  }'
```

## Data Models

### Notification Schema
```javascript
{
  recipientId: ObjectId,
  recipientEmail: String,
  recipientPhone: String,
  eventType: String,
  channel: String,
  subject: String,
  message: String,
  templateId: ObjectId,
  templateData: Object,
  status: String,
  sentAt: Date,
  deliveredAt: Date,
  openedAt: Date,
  failureReason: String,
  retryCount: Number,
  isRead: Boolean,
  metadata: Object,
  relatedEntityId: ObjectId,
  relatedEntityType: String,
  createdAt: Date,
  updatedAt: Date
}
```

### NotificationPreference Schema
```javascript
{
  userId: ObjectId,
  emailNotifications: Boolean,
  smsNotifications: Boolean,
  inAppNotifications: Boolean,
  notificationQuietHourStart: String,
  notificationQuietHourEnd: String,
  doNotDisturb: Boolean,
  channelPreferences: Map,
  eventPreferences: Map,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### NotificationTemplate Schema
```javascript
{
  name: String,
  eventType: String,
  channel: String,
  subject: String,
  message: String,
  htmlContent: String,
  variables: [String],
  isActive: Boolean,
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### NotificationEvent Schema
```javascript
{
  eventType: String,
  triggeredBy: ObjectId,
  relatedEntityId: ObjectId,
  relatedEntityType: String,
  notificationIds: [ObjectId],
  eventData: Object,
  successCount: Number,
  failureCount: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Configuration

Add the following to your environment configuration:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@schoolmanagement.com

# SMS Configuration (choose one)
SMS_PROVIDER=mock # or twilio, aws-sns
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

## Testing

Run the test suite:

```bash
npm test -- notifications
```

## Notes

- Email service uses nodemailer for SMTP communication
- SMS service supports multiple providers (Twilio, AWS SNS, or Mock)
- In-app notifications are stored in the database
- Failed notifications can be retried manually or automatically
- User preferences are respected before sending notifications
- Quiet hours can be configured to prevent notifications during certain times
- All notifications are logged and tracked for audit purposes

## Future Enhancements

- Push notifications
- Webhook support
- Notification scheduling
- Bulk notification templates
- Notification analytics dashboard
- Real-time notification delivery tracking
- Notification encryption
