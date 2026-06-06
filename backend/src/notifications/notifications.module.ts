import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';
import {
  NotificationTemplate,
  NotificationTemplateSchema,
} from './schemas/notification-template.schema';
import {
  NotificationPreference,
  NotificationPreferenceSchema,
} from './schemas/notification-preference.schema';
import {
  NotificationEvent,
  NotificationEventSchema,
} from './schemas/notification-event.schema';
import { NotificationService } from './services/notification.service';
import { NotificationTemplateService } from './services/notification-template.service';
import { NotificationPreferenceService } from './services/notification-preference.service';
import { NotificationEventService } from './services/notification-event.service';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { InAppService } from './services/in-app.service';
import { NotificationController } from './notification.controller';
import { NotificationPreferenceController } from './notification-preference.controller';
import { NotificationTemplateController } from './notification-template.controller';
import { NotificationEventController } from './notification-event.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: NotificationTemplate.name, schema: NotificationTemplateSchema },
      {
        name: NotificationPreference.name,
        schema: NotificationPreferenceSchema,
      },
      { name: NotificationEvent.name, schema: NotificationEventSchema },
    ]),
  ],
  controllers: [
    NotificationController,
    NotificationPreferenceController,
    NotificationTemplateController,
    NotificationEventController,
  ],
  providers: [
    NotificationService,
    NotificationTemplateService,
    NotificationPreferenceService,
    NotificationEventService,
    EmailService,
    SmsService,
    InAppService,
  ],
  exports: [NotificationService, NotificationEventService, MongooseModule],
})
export class NotificationsModule {}
