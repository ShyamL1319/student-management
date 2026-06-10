# Settings & Configuration Module

The Settings & Configuration module manages school-specific configurations, branding, and integration setups with multi-tenant isolation, automated self-healing initialization, secrets encryption, and audit log scrubbing.

## Features

- **School Settings**: Core school-specific configurations (timezone, currency, date formats, locale, code).
- **Branding Settings**: Dynamic UI configurations (logo and favicon URLs, theme primary/secondary colors, light/dark modes).
- **Email Settings**: Dynamic SMTP, AWS SES, or SendGrid integration configurations.
- **SMS Settings**: SMS configurations (Twilio configuration or custom WhatsApp Business API keys).
- **MFA Settings**: Enforcement levels (all, admin_only, optional), allowed methods (TOTP), and grace periods.
- **Notification Settings**: Subscriptions for email, SMS, and WhatsApp alert channels.
- **Backup Settings**: DB snapshot configurations (retention policies, S3 bucket storage details).
- **Integration Settings**: API key management for Stripe, Razorpay, Twilio, WhatsApp, Zoom, Google Workspace, and Microsoft 365.
- **Secrets Management**: AES-256-GCM encryption for credentials in database storage, and masking (`******`) in public-facing GET responses.
- **Audit Logging Redaction**: Automatic interception and sanitization of credentials inside request body logs to prevent credentials leaking into the database audit trails.

## API Endpoints

### Administrative Configuration (Admins/Super Admins only)
- `GET /settings` - Retrieve masked configuration settings for the active school context.
- `PATCH /settings` - Update configuration settings for the active school context.

### Public Branding (Unauthenticated)
- `GET /settings/public` - Fetch public branding colors, logos, and MFA activation flags based on subdomain resolution.

## Database Models

- `Settings`: Dynamic Mongoose model holding all subdocument settings blocks (School, Branding, Email, SMS, MFA, Notifications, Backups, Integrations) isolated per school.

## Testing

Run unit tests for settings and security utilities:
```bash
npm run test -- src/settings
```
