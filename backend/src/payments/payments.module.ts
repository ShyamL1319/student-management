import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { Subscription, SubscriptionSchema } from './schemas/subscription.schema';
import { Refund, RefundSchema } from './schemas/refund.schema';
import { QueueJob, QueueJobSchema } from './schemas/queue-job.schema';
import { StripeService } from './services/stripe.service';
import { RazorpayService } from './services/razorpay.service';
import { PhonepeService } from './services/phonepe.service';
import { ReceiptPdfService } from './services/receipt-pdf.service';
import { QueueJobProcessor } from './services/queue-job.processor';
import { PaymentService } from './services/payment.service';
import { PaymentController } from './controllers/payment.controller';
import { WebhookController } from './controllers/webhook.controller';
import { RevenueAnalyticsController } from './controllers/analytics.controller';
import { UsersModule } from '../users/users.module';
import { SchoolsModule } from '../schools/schools.module';
import { FeesModule } from '../fees/fees.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Refund.name, schema: RefundSchema },
      { name: QueueJob.name, schema: QueueJobSchema },
    ]),
    UsersModule,
    SchoolsModule,
    FeesModule,
    NotificationsModule,
  ],
  controllers: [
    PaymentController,
    WebhookController,
    RevenueAnalyticsController,
  ],
  providers: [
    StripeService,
    RazorpayService,
    PhonepeService,
    ReceiptPdfService,
    QueueJobProcessor,
    PaymentService,
  ],
  exports: [PaymentService],
})
export class PaymentsModule {}
