import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QueueJob, QueueJobDocument } from '../schemas/queue-job.schema';
import { StripeService } from './stripe.service';
import { RazorpayService } from './razorpay.service';
import { PhonepeService } from './phonepe.service';

@Injectable()
export class QueueJobProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueJobProcessor.name);
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private paymentService: any = null; // Dynamically resolved to avoid circular dependencies

  constructor(
    @InjectModel(QueueJob.name)
    private readonly queueModel: Model<QueueJobDocument>,
    private readonly stripeService: StripeService,
    private readonly razorpayService: RazorpayService,
    private readonly phonepeService: PhonepeService,
  ) {}

  onModuleInit() {
    this.logger.log('Initializing Payment Queue Processor loop...');
    // Poll every 10 seconds
    this.timer = setInterval(() => {
      this.processQueue().catch((err) =>
        this.logger.error('Error during queue processing loop', err),
      );
    }, 10000);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  /**
   * Set payment service instance to resolve circular dependencies
   */
  setPaymentService(paymentService: any) {
    this.paymentService = paymentService;
  }

  /**
   * Background runner to pick up and process tasks
   */
  async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const now = new Date();
      // Find jobs that are PENDING or FAILED but haven't reached max attempts, and are scheduled for execution
      const jobs = await this.queueModel
        .find({
          status: { $in: ['PENDING', 'FAILED'] },
          attempts: { $lt: 3 }, // maxAttempts = 3
          $or: [{ processAfter: null }, { processAfter: { $lte: now } }],
        })
        .sort({ createdAt: 1 })
        .limit(5)
        .exec();

      for (const job of jobs) {
        await this.runJob(job);
      }
    } catch (error) {
      this.logger.error('Error finding pending jobs in queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async runJob(job: QueueJobDocument) {
    this.logger.log(
      `Processing Job ID: ${job._id.toString()}, Type: ${job.jobType}`,
    );
    job.status = 'PROCESSING';
    job.attempts += 1;
    await job.save();

    try {
      switch (job.jobType) {
        case 'PROCESS_WEBHOOK':
          await this.handleWebhookJob(job.payload);
          break;
        case 'RETRY_PAYMENT_ALERT':
          await this.handleRetryAlertJob(job.payload);
          break;
        default:
          throw new Error(`Unsupported job type: ${job.jobType}`);
      }

      job.status = 'COMPLETED';
      await job.save();
      this.logger.log(`Job ID: ${job._id.toString()} completed successfully.`);
    } catch (error) {
      this.logger.error(
        `Job ID: ${job._id.toString()} failed. Error: ${error.message}`,
      );
      job.status = 'FAILED';
      job.lastError = error.message;

      // Exponential backoff: retry in 2^attempts minutes
      const backoffMinutes = Math.pow(2, job.attempts);
      job.processAfter = new Date(Date.now() + backoffMinutes * 60 * 1000);
      await job.save();
    }
  }

  /**
   * Process webhook events asynchronously
   */
  private async handleWebhookJob(payload: {
    gateway: 'STRIPE' | 'RAZORPAY' | 'PHONEPE';
    signature: string;
    body: string;
    webhookSecret?: string;
    apiKey?: string;
  }) {
    if (!this.paymentService) {
      throw new Error(
        'PaymentService is not yet injected into QueueProcessor.',
      );
    }

    if (payload.gateway === 'STRIPE') {
      const event = await this.stripeService.constructEvent(
        payload.body,
        payload.signature,
        payload.webhookSecret,
        payload.apiKey,
      );

      this.logger.log(`Ingesting Stripe webhook event: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as any;
          await this.paymentService.processPaymentSuccess(
            paymentIntent.id,
            paymentIntent.latest_charge || paymentIntent.id,
            paymentIntent,
          );
          break;
        }
        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as any;
          const failureReason =
            paymentIntent.last_payment_error?.message || 'Payment failed';
          await this.paymentService.processPaymentFailure(
            paymentIntent.id,
            failureReason,
          );
          break;
        }
        case 'charge.refunded': {
          const charge = event.data.object as any;
          await this.paymentService.processRefundEvent(
            charge.payment_intent,
            charge.amount_refunded,
            charge,
          );
          break;
        }
        default:
          this.logger.log(`Unhandled Stripe event type: ${event.type}`);
      }
    } else if (payload.gateway === 'RAZORPAY') {
      // Razorpay signature verify was done in controller, but we can do validation here as well
      const isValid = this.razorpayService.verifySignature(
        payload.body,
        payload.signature,
        payload.webhookSecret,
      );

      if (!isValid) {
        throw new Error(
          'Razorpay webhook signature verification failed during background processing.',
        );
      }

      const event = JSON.parse(payload.body);
      const eventType = event.event;
      this.logger.log(`Ingesting Razorpay webhook event: ${eventType}`);

      switch (eventType) {
        case 'order.paid': {
          const order = event.payload.order.entity;
          const payment = event.payload.payment.entity;
          await this.paymentService.processPaymentSuccess(
            order.id,
            payment.id,
            event,
          );
          break;
        }
        case 'payment.failed': {
          const payment = event.payload.payment.entity;
          const failureReason = payment.error_description || 'Payment failed';
          await this.paymentService.processPaymentFailure(
            payment.order_id,
            failureReason,
          );
          break;
        }
        case 'refund.processed': {
          const refund = event.payload.refund.entity;
          await this.paymentService.processRefundEvent(
            refund.payment_id,
            refund.amount,
            event,
          );
          break;
        }
        default:
          this.logger.log(`Unhandled Razorpay event type: ${eventType}`);
      }
    } else if (payload.gateway === 'PHONEPE') {
      const isValid = this.phonepeService.verifySignature(
        payload.body,
        payload.signature,
        payload.webhookSecret,
      );

      if (!isValid) {
        throw new Error('PhonePe webhook signature verification failed.');
      }

      // PhonePe payload body contains base64 response under webhook body response
      const decodedBody = JSON.parse(
        Buffer.from(payload.body, 'base64').toString('utf8'),
      );
      const state = decodedBody.success;
      const merchantTransactionId = decodedBody.data.merchantTransactionId;
      const transactionId = decodedBody.data.transactionId; // phonepe transaction ID

      if (state) {
        await this.paymentService.processPaymentSuccess(
          merchantTransactionId,
          transactionId,
          decodedBody,
        );
      } else {
        const failureReason = decodedBody.message || 'PhonePe payment failed';
        await this.paymentService.processPaymentFailure(
          merchantTransactionId,
          failureReason,
        );
      }
    }
  }

  /**
   * Processes retry tasks (e.g. notifications for failed transactions)
   */
  private async handleRetryAlertJob(payload: { paymentId: string }) {
    if (!this.paymentService) {
      throw new Error(
        'PaymentService is not yet injected into QueueProcessor.',
      );
    }
    // We can fetch the failed payment record and trigger a notification retry
    await this.paymentService.sendPaymentFailedAlert(payload.paymentId);
  }
}
