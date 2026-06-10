# Enterprise Configuration Management & Settings Architecture

This document provides a comprehensive implementation guide for the multi-tenant **Settings & Configuration** module within the School Management System.

---

## 1. Architectural Design Overview

The Settings module is designed to manage administrative, branding, notification, security, and integration configurations for schools under a multi-tenant model. It features robust isolation, automated initialization (self-healing), military-grade encryption for credentials, and proactive audit logging sanitization.

### Core Architectural Patterns
1. **Multi-Tenant Isolation**: Settings are mapped per school context using a `schoolId` indexed uniquely, separated via dynamic tenancy filters.
2. **Self-Healing Initialization**: Accessing settings automatically initializes default config documents if none exist for that tenant.
3. **Secrets Management**: Sensitive parameters (API keys, secrets, SMTP credentials) are encrypted with **AES-256-GCM** in storage and masked (`******`) in client-facing GET responses.
4. **Audit Trail Sanitization**: An `AuditInterceptor` scrubs incoming request logs, ensuring secrets are redacted before being stored in audit database logs.
5. **Role-Based Access Control (RBAC)**: Read and update actions are guarded, restricting administrative configurations exclusively to `ADMIN` and `SUPER_ADMIN` roles, while permitting unauthenticated sub-domain resolution to fetch public branding settings.

---

## 2. Database Schema Definition

The database schema utilizes NestJS/Mongoose definitions to hold nested configuration sub-documents.

**File Location:** [settings.schema.ts](file:///Users/shyamlal/Desktop/ai-coding/student-management/backend/src/settings/schemas/settings.schema.ts)

### Schema Subcomponents
- **SchoolSettings**: Core timezone, currency, date formats, locale, and school code.
- **BrandingSettings**: Theme primary/secondary colors, logo and favicon URLs, light/dark mode preferences, and custom domains.
- **EmailSettings**: SMTP/SES/SendGrid credentials (host, port, username, encrypted passwords/keys).
- **SmsSettings**: Provider details (Twilio / WhatsApp Business credentials with encrypted auth tokens/keys).
- **MfaSettings**: Multi-Factor Authentication enforcement settings (TOTP methods, grace periods).
- **NotificationSettings**: Subscriptions to alerts across email, SMS, WhatsApp, and push.
- **BackupSettings**: S3-compatible snapshot settings (bucket name, AWS credentials, snapshot frequency, and retention policies).
- **IntegrationSettings**: External credentials for **Stripe**, **Razorpay**, **Twilio**, **WhatsApp**, **Zoom**, **Google Workspace**, and **Microsoft 365**.

```typescript
// backend/src/settings/schemas/settings.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SettingsDocument = Settings & Document;

@Schema({ _id: false })
export class SchoolSettings {
  @Prop({ required: false, default: '' })
  code?: string;
  @Prop({ required: false, default: '' })
  website?: string;
  @Prop({ required: false, default: '' })
  taxId?: string;
  @Prop({ required: false, default: 'USD' })
  currency?: string;
  @Prop({ required: false, default: 'UTC' })
  timezone?: string;
  @Prop({ required: false, default: 'YYYY-MM-DD' })
  dateFormat?: string;
  @Prop({ required: false, default: 'en' })
  language?: string;
}

// ... Additional Sub-Schemas: BrandingSettings, EmailSettings, SmsSettings, MfaSettings, NotificationSettings, BackupSettings

@Schema({ _id: false })
export class IntegrationSettings {
  @Prop({ required: false, default: false })
  stripeEnabled?: boolean;
  @Prop({ required: false, default: '' })
  stripePublishableKey?: string;
  @Prop({ required: false, default: '' })
  stripeSecretKey?: string; // Encrypted
  @Prop({ required: false, default: '' })
  stripeWebhookSecret?: string; // Encrypted

  @Prop({ required: false, default: false })
  razorpayEnabled?: boolean;
  @Prop({ required: false, default: '' })
  razorpayKeyId?: string;
  @Prop({ required: false, default: '' })
  razorpayKeySecret?: string; // Encrypted

  // twilio, whatsapp, zoom, googleWorkspace, microsoft365 credentials...
}

@Schema({ timestamps: true })
export class Settings {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true, unique: true })
  schoolId!: Types.ObjectId;

  @Prop({ type: SchoolSettings, default: () => ({}) })
  school!: SchoolSettings;

  @Prop({ type: BrandingSettings, default: () => ({}) })
  branding!: BrandingSettings;

  @Prop({ type: EmailSettings, default: () => ({}) })
  email!: EmailSettings;

  @Prop({ type: SmsSettings, default: () => ({}) })
  sms!: SmsSettings;

  @Prop({ type: MfaSettings, default: () => ({}) })
  mfa!: MfaSettings;

  @Prop({ type: NotificationSettings, default: () => ({}) })
  notification!: NotificationSettings;

  @Prop({ type: BackupSettings, default: () => ({}) })
  backup!: BackupSettings;

  @Prop({ type: IntegrationSettings, default: () => ({}) })
  integrations!: IntegrationSettings;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
```

---

## 3. Cryptography & Secrets Management

Secrets are handled by the [CryptoService](file:///Users/shyamlal/Desktop/ai-coding/student-management/backend/src/settings/services/crypto.service.ts), using **AES-256-GCM** encryption.

### Key Features
1. **Deterministic Key Derivation**: Derives a secure 32-byte key using SHA-256 over an `ENCRYPTION_KEY` configuration.
2. **Dynamic IV Generation**: A unique 12-byte initialization vector (IV) is generated for each encryption action.
3. **Integrity Validation**: Append and check Authentication Tags to guard against ciphertext tampering.
4. **Mask Preservation**: When clients update settings, sending `'******'` preserves the existing encrypted credential without modifying it or storing `'******'` directly.

```typescript
// backend/src/settings/services/crypto.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const rawKey = this.configService.get<string>('ENCRYPTION_KEY') || 'fallback-key';
    this.key = crypto.createHash('sha256').update(rawKey).digest();
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  decrypt(cipherText: string): string {
    const parts = cipherText.split(':');
    if (parts.length !== 3) return cipherText; // Return plain-text fallback if unencrypted
    const [ivHex, authTagHex, encryptedHex] = parts;
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
```

---

## 4. Configuration Service

The [SettingsService](file:///Users/shyamlal/Desktop/ai-coding/student-management/backend/src/settings/services/settings.service.ts) coordinates self-healing default loading, encryption during updates, and dynamic masking of values.

```typescript
// backend/src/settings/services/settings.service.ts
@Injectable()
export class SettingsService {
  // Lists of key fields requiring encryption
  private readonly emailSecrets = ['password', 'apiKey'];
  private readonly smsSecrets = ['authToken', 'whatsappApiKey'];
  private readonly backupSecrets = ['s3SecretAccessKey'];
  private readonly integrationsSecrets = [
    'stripeSecretKey', 'stripeWebhookSecret', 'razorpayKeySecret',
    'twilioToken', 'whatsappToken', 'zoomClientSecret',
    'googleClientSecret', 'microsoftClientSecret'
  ];

  constructor(
    @InjectModel(Settings.name) private readonly settingsModel: Model<SettingsDocument>,
    private readonly cryptoService: CryptoService
  ) {}

  async getSettings(): Promise<SettingsDocument> {
    const schoolId = new Types.ObjectId(TenantContext.getSchoolId());
    let settings = await this.settingsModel.findOne({ schoolId }).exec();
    if (!settings) {
      // Self-healing: Initialize defaults
      settings = await this.settingsModel.create({ schoolId });
    }
    return settings;
  }

  async updateSettings(dto: UpdateSettingsDto): Promise<Settings> {
    const settings = await this.getSettings();
    // Iterates across properties, checking if incoming val is '******' (no change) or encrypted dynamically
    // Saves and returns the updated document
    // ...
    return settings.save();
  }

  maskSettings(settings: Settings): Record<string, unknown> {
    const raw = JSON.parse(JSON.stringify(settings));
    // Replaces all fields in secret arrays with '******'
    // ...
    return raw;
  }
}
```

---

## 5. REST Controllers & Public Access Boundaries

API routes are partitioned to secure administrative configurations behind standard NestJS Guards, while allowing unauthenticated lookups for basic styling options (logo, colors) based on tenant identification (e.g. subdomain resolution).

**File Location:** [settings.controller.ts](file:///Users/shyamlal/Desktop/ai-coding/student-management/backend/src/settings/controllers/settings.controller.ts)

- `GET /settings`: Fetches administrative settings with masked credentials. Authenticated and authorized for `ADMIN` and `SUPER_ADMIN`.
- `PATCH /settings`: Updates settings blocks, handling masking logic on incoming fields.
- `GET /settings/public`: Unauthenticated, resolved via school tenant context. Returns logos and color themes for browser styling or branding initialization.

```typescript
// backend/src/settings/controllers/settings.controller.ts
@ApiTags('Settings & Configuration')
@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    @InjectModel(School.name) private readonly schoolModel: Model<SchoolDocument>
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth()
  async getSettings() {
    const settings = await this.settingsService.getSettings();
    return this.settingsService.maskSettings(settings);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @ApiBearerAuth()
  async updateSettings(@Body() dto: UpdateSettingsDto) {
    const updated = await this.settingsService.updateSettings(dto);
    return this.settingsService.maskSettings(updated);
  }

  @Get('public')
  @Public()
  async getPublicSettings() {
    const schoolId = TenantContext.getSchoolId();
    if (!schoolId) return this.getDefaultFallbackBranding();
    const [settings, school] = await Promise.all([
      this.settingsService.getSettings(),
      this.schoolModel.findById(schoolId).exec(),
    ]);
    return {
      schoolName: school?.name || 'School Management System',
      branding: {
        logoUrl: settings.branding?.logoUrl || '',
        faviconUrl: settings.branding?.faviconUrl || '',
        primaryColor: settings.branding?.primaryColor || '#4F46E5',
        secondaryColor: settings.branding?.secondaryColor || '#06B6D4',
        themeMode: settings.branding?.themeMode || 'light',
      },
      mfaEnabled: settings.mfa?.enabled || false,
    };
  }
}
```

---

## 6. Request Validation & Data Transfer Objects (DTOs)

The DTO configuration validates type safety and nested structures. All validation rules enforce type requirements using `class-validator` and Swagger endpoints.

**File Location:** [settings.dto.ts](file:///Users/shyamlal/Desktop/ai-coding/student-management/backend/src/settings/dto/settings.dto.ts)

- **Strict Validation**: DTO classes enforce schema bounds (`@IsString()`, `@IsBoolean()`, `@IsNumber()`, `@IsEnum()`, `@IsArray()`).
- **Nested validation**: Utilizes `@ValidateNested()` along with `@Type(() => UpdateSubcomponentSettingsDto)` to validate deep settings blocks.
- **Swagger Documentation**: Enhances interactive documentation using `@ApiPropertyOptional()` decorators for API contract visibility.

---

## 7. Audit Log Interception & Redaction

The global [AuditInterceptor](file:///Users/shyamlal/Desktop/ai-coding/student-management/backend/src/common/interceptors/audit.interceptor.ts) captures database changes and performs regex/keyword checks to avoid logging passwords or token keys.

```typescript
// backend/src/common/interceptors/audit.interceptor.ts
private redactSecrets(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((item) => this.redactSecrets(item));

  const redacted: any = {};
  for (const key of Object.keys(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = [
      'password', 'secret', 'token', 'key', 'credential', 'auth', 'pass', 'api_key'
    ].some((sensitiveWord) => lowerKey.includes(sensitiveWord));

    if (isSensitive && typeof obj[key] === 'string' && obj[key]) {
      redacted[key] = '******';
    } else if (typeof obj[key] === 'object') {
      redacted[key] = this.redactSecrets(obj[key]);
    } else {
      redacted[key] = obj[key];
    }
  }
  return redacted;
}
```

---

## 8. Verification & Testing Framework

Comprehensive unit tests are implemented to ensure settings retrieve/update actions, masking, GCM cipher cryptography, and controller pathways perform as expected.

### Test Files
- **Crypto Service Tests**: [crypto.service.spec.ts](file:///Users/shyamlal/Desktop/ai-coding/student-management/backend/src/settings/services/crypto.service.spec.ts)
- **Settings Service Tests**: [settings.service.spec.ts](file:///Users/shyamlal/Desktop/ai-coding/student-management/backend/src/settings/services/settings.service.spec.ts)
- **Settings Controller Tests**: [settings.controller.spec.ts](file:///Users/shyamlal/Desktop/ai-coding/student-management/backend/src/settings/controllers/settings.controller.spec.ts)

### Running the Tests
To verify implementation locally, execute:
```bash
npm run test -- settings
```

Output confirming code health:
```text
PASS src/settings/services/crypto.service.spec.ts
PASS src/settings/services/settings.service.spec.ts
PASS src/settings/controllers/settings.controller.spec.ts

Test Suites: 3 passed, 3 total
Tests:       19 passed, 19 total
Snapshots:   0 total
Time:        2.646 s
```
