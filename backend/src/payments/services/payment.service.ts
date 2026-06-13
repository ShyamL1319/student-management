import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from '../schemas/payment.schema';
import {
  Subscription,
  SubscriptionDocument,
} from '../schemas/subscription.schema';
import { Refund, RefundDocument } from '../schemas/refund.schema';
import { QueueJob, QueueJobDocument } from '../schemas/queue-job.schema';
import { Invoice, InvoiceDocument } from '../../fees/schemas/invoice.schema';
import {
  FeeCollection,
  FeeCollectionDocument,
} from '../../fees/schemas/fee-collection.schema';
import { Receipt, ReceiptDocument } from '../../fees/schemas/receipt.schema';
import {
  Student,
  StudentDocument,
} from '../../students/schemas/student.schema';
import { School, SchoolDocument } from '../../schools/schemas/school.schema';
import { StripeService } from './stripe.service';
import { RazorpayService } from './razorpay.service';
import { PhonepeService } from './phonepe.service';
import { ReceiptPdfService } from './receipt-pdf.service';
import { QueueJobProcessor } from './queue-job.processor';
import { TenantContext } from '../../tenant/tenant.context';
import { EmailService } from '../../notifications/services/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService implements OnModuleInit {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Refund.name)
    private readonly refundModel: Model<RefundDocument>,
    @InjectModel(QueueJob.name)
    private readonly queueJobModel: Model<QueueJobDocument>,
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(FeeCollection.name)
    private readonly feeCollectionModel: Model<FeeCollectionDocument>,
    @InjectModel(Receipt.name)
    private readonly receiptModel: Model<ReceiptDocument>,
    @InjectModel(Student.name)
    private readonly studentModel: Model<StudentDocument>,
    @InjectModel(School.name)
    private readonly schoolModel: Model<SchoolDocument>,
    private readonly stripeService: StripeService,
    private readonly razorpayService: RazorpayService,
    private readonly phonepeService: PhonepeService,
    private readonly receiptPdfService: ReceiptPdfService,
    private readonly queueProcessor: QueueJobProcessor,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    // Inject paymentService instance into queueProcessor to break circular dependencies
    this.queueProcessor.setPaymentService(this);
  }

  /**
   * Initiate dynamic payment with Stripe or Razorpay
   */
  async initiatePayment(
    studentId: string,
    invoiceId: string,
    gateway: 'STRIPE' | 'RAZORPAY' | 'PHONEPE',
  ): Promise<any> {
    const student = await this.studentModel.findById(studentId);
    if (!student)
      throw new NotFoundException(`Student with ID ${studentId} not found`);

    const invoice = await this.invoiceModel.findById(invoiceId);
    if (!invoice)
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);

    if (invoice.status === 'PAID') {
      throw new BadRequestException('Invoice is already fully paid');
    }

    const school = await this.schoolModel.findById(student.schoolId);
    const paymentSettings = (school as any)?.paymentSettings || {};

    const amount = Math.round(invoice.pendingAmount * 100); // converting to minor units (cents / paise)
    const currency = 'INR'; // Default

    if (gateway === 'STRIPE') {
      const stripeIntent = await this.stripeService.createPaymentIntent(
        amount,
        currency,
        {
          invoiceId: invoice._id.toString(),
          studentId: student._id.toString(),
          schoolId: student.schoolId?.toString() || '',
        },
        paymentSettings.stripeSecretKey,
      );

      const payment = await this.paymentModel.create({
        studentId: student._id,
        invoiceId: invoice._id,
        amount: amount,
        currency: currency,
        gateway: 'STRIPE',
        gatewayTransactionId: stripeIntent.id,
        status: 'PENDING',
      });

      return {
        paymentId: payment._id.toString(),
        clientSecret: stripeIntent.client_secret,
        gateway: 'STRIPE',
      };
    } else if (gateway === 'RAZORPAY') {
      const razorpayOrder = await this.razorpayService.createOrder(
        amount,
        currency,
        invoice.invoiceNumber,
        {
          invoiceId: invoice._id.toString(),
          studentId: student._id.toString(),
          schoolId: student.schoolId?.toString() || '',
        },
        paymentSettings.razorpayKeyId,
        paymentSettings.razorpayKeySecret,
      );

      const payment = await this.paymentModel.create({
        studentId: student._id,
        invoiceId: invoice._id,
        amount: amount,
        currency: currency,
        gateway: 'RAZORPAY',
        gatewayTransactionId: razorpayOrder.id,
        status: 'PENDING',
      });

      return {
        paymentId: payment._id.toString(),
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        gateway: 'RAZORPAY',
      };
    } else if (gateway === 'PHONEPE') {
      const transactionId = `TXN-INV-${invoice.invoiceNumber}-${Date.now()}`;
      const redirectUrl = `${this.configService.get<string>('CORS_ORIGIN') || 'https://psei.school.com:5173'}/parent/payment/callback`;
      const callbackUrl = `${this.configService.get<string>('VITE_API_BASE_URL') || 'https://api.psei.school.com:3000'}/payments/webhook/phonepe`;

      const phonepeReq = await this.phonepeService.createPaymentRequest(
        amount,
        transactionId,
        student._id.toString(),
        redirectUrl,
        callbackUrl,
        paymentSettings,
      );

      const payment = await this.paymentModel.create({
        studentId: student._id,
        invoiceId: invoice._id,
        amount: amount,
        currency: currency,
        gateway: 'PHONEPE',
        gatewayTransactionId: transactionId,
        status: 'PENDING',
      });

      return {
        paymentId: payment._id.toString(),
        redirectUrl: phonepeReq.redirectUrl,
        gateway: 'PHONEPE',
      };
    } else {
      throw new BadRequestException('Invalid payment gateway.');
    }
  }

  /**
   * Process payment success event (invoked asynchronously by background processor)
   */
  async processPaymentSuccess(
    gatewayTransactionId: string,
    gatewayPaymentId: string,
    rawResponse: any,
  ): Promise<void> {
    const payment = await this.paymentModel.findOne({ gatewayTransactionId });
    if (!payment) {
      throw new NotFoundException(
        `Payment record with gateway transaction ID ${gatewayTransactionId} not found`,
      );
    }

    if (payment.status === 'SUCCESS') {
      this.logger.log(
        `Payment transaction ${gatewayTransactionId} was already marked as SUCCESS.`,
      );
      return;
    }

    // Set multi-tenant isolation context dynamically based on payment school context
    await TenantContext.run(
      {
        schoolId: payment.schoolId?.toString() || '',
        tenantId: '',
        subdomain: '',
      },
      async () => {
        payment.status = 'SUCCESS';
        payment.gatewayPaymentId = gatewayPaymentId;
        payment.gatewayResponse = rawResponse;
        await payment.save();

        // 1. Update Invoice status
        if (payment.invoiceId) {
          const invoice = await this.invoiceModel.findById(payment.invoiceId);
          if (invoice) {
            const amountPaidDecimal = payment.amount / 100;
            invoice.paidAmount = (invoice.paidAmount || 0) + amountPaidDecimal;
            invoice.pendingAmount = Math.max(
              0,
              invoice.netAmount - invoice.paidAmount,
            );
            invoice.status = invoice.pendingAmount === 0 ? 'PAID' : 'PARTIAL';
            await invoice.save();

            // 2. Generate Receipt
            const count = await this.receiptModel.countDocuments();
            const year = new Date().getFullYear();
            const month = String(new Date().getMonth() + 1).padStart(2, '0');
            const receiptNumber = `RCP-${year}-${month}-${String(count + 1).padStart(5, '0')}`;

            const receipt = await this.receiptModel.create({
              receiptNumber,
              studentId: payment.studentId,
              feeCollectionId:
                invoice.feeItems?.[0]?.feeStructureId || new Types.ObjectId(),
              amountReceived: amountPaidDecimal,
              paymentDate: new Date(),
              paymentMethod: payment.gateway,
              transactionId: gatewayPaymentId,
              status: 'ISSUED',
              receivedBy: 'ONLINE_PAYMENT_GATEWAY',
              feeDetails: {
                invoiceNumber: invoice.invoiceNumber,
                feeItems: invoice.feeItems,
              },
            });

            // 3. Retrieve student information and send pdf email receipt
            const student = await this.studentModel.findById(payment.studentId);
            if (student) {
              const recipientEmail =
                student.email || (student as any).parentEmail;
              if (recipientEmail) {
                await this.receiptPdfService.generateAndEmailReceipt(
                  recipientEmail,
                  `${student.firstName} ${student.lastName}`,
                  {
                    receiptNumber: receipt.receiptNumber,
                    studentName: `${student.firstName} ${student.lastName}`,
                    studentRollNumber: student.rollNumber,
                    className: 'Class Info',
                    paymentDate: receipt.paymentDate,
                    paymentMethod: receipt.paymentMethod,
                    transactionId: receipt.transactionId,
                    amountReceived: receipt.amountReceived,
                    currency: payment.currency,
                    feeDetails: receipt.feeDetails,
                  },
                );
              }
            }
          }
        }
      },
    );
  }

  /**
   * Process payment failure event (invoked asynchronously by background processor)
   */
  async processPaymentFailure(
    gatewayTransactionId: string,
    failureReason: string,
  ): Promise<void> {
    const payment = await this.paymentModel.findOne({ gatewayTransactionId });
    if (!payment) {
      throw new NotFoundException(
        `Payment record with transaction ID ${gatewayTransactionId} not found`,
      );
    }

    if (payment.status === 'FAILED') return;

    await TenantContext.run(
      {
        schoolId: payment.schoolId?.toString() || '',
        tenantId: '',
        subdomain: '',
      },
      async () => {
        payment.status = 'FAILED';
        payment.failureReason = failureReason;
        await payment.save();

        // Log the failure job to alert the customer
        await this.queueJobModel.create({
          jobType: 'RETRY_PAYMENT_ALERT',
          payload: { paymentId: payment._id.toString() },
          status: 'PENDING',
        });
      },
    );
  }

  /**
   * Ingest Stripe/Razorpay refund events
   */
  async processRefundEvent(
    gatewayTransactionId: string,
    refundAmountMinor: number,
    rawResponse: any,
  ): Promise<void> {
    const payment = await this.paymentModel.findOne({ gatewayTransactionId });
    if (!payment) return;

    await TenantContext.run(
      {
        schoolId: payment.schoolId?.toString() || '',
        tenantId: '',
        subdomain: '',
      },
      async () => {
        const refundAmount = refundAmountMinor / 100;
        payment.refundedAmount = (payment.refundedAmount || 0) + refundAmount;
        payment.status =
          payment.refundedAmount >= payment.amount / 100
            ? 'REFUNDED'
            : 'PARTIALLY_REFUNDED';
        await payment.save();

        if (payment.invoiceId) {
          const invoice = await this.invoiceModel.findById(payment.invoiceId);
          if (invoice) {
            invoice.paidAmount = Math.max(0, invoice.paidAmount - refundAmount);
            invoice.pendingAmount = invoice.netAmount - invoice.paidAmount;
            invoice.status = invoice.paidAmount === 0 ? 'ISSUED' : 'PARTIAL';
            await invoice.save();
          }
        }
      },
    );
  }

  /**
   * Alert parents when transactions fail
   */
  async sendPaymentFailedAlert(paymentId: string): Promise<void> {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment) return;

    const student = await this.studentModel.findById(payment.studentId);
    if (!student) return;

    const recipientEmail = student.email || (student as any).parentEmail;
    if (!recipientEmail) return;

    await this.emailService.sendEmail(
      recipientEmail,
      'Payment Transaction Failed',
      `Dear Parent,

The payment transaction of ${payment.currency} ${(payment.amount / 100).toFixed(2)} using ${payment.gateway} has failed.
Reason: ${payment.failureReason || 'Declined by financial institution.'}

Please log in to the Parent Portal to try again.

Thank you,
School Administration`,
    );
  }

  /**
   * Initiate manual Refund via API
   */
  async initiateRefund(
    paymentId: string,
    amount: number,
    reason: string,
  ): Promise<any> {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment)
      throw new NotFoundException(`Payment record ${paymentId} not found`);

    if (
      payment.status !== 'SUCCESS' &&
      payment.status !== 'PARTIALLY_REFUNDED'
    ) {
      throw new BadRequestException(
        'Cannot refund a transaction that has not succeeded.',
      );
    }

    const school = await this.schoolModel.findById(payment.schoolId);
    const paymentSettings = (school as any)?.paymentSettings || {};

    const amountMinor = Math.round(amount * 100);

    let refundResult: any;
    if (payment.gateway === 'STRIPE') {
      refundResult = await this.stripeService.createRefund(
        payment.gatewayTransactionId,
        amountMinor,
        paymentSettings.stripeSecretKey,
      );
    } else if (payment.gateway === 'RAZORPAY') {
      refundResult = await this.razorpayService.createRefund(
        payment.gatewayPaymentId,
        amountMinor,
        { reason },
        paymentSettings.razorpayKeyId,
        paymentSettings.razorpayKeySecret,
      );
    } else if (payment.gateway === 'PHONEPE') {
      const refundTxnId = `RFD-${payment.gatewayTransactionId.replace('TXN-', '')}-${Date.now()}`;
      refundResult = await this.phonepeService.createRefund(
        payment.gatewayTransactionId,
        refundTxnId,
        amountMinor,
        paymentSettings,
      );
    } else {
      throw new BadRequestException(
        'Refund not supported for cash/cheque through automated gateways.',
      );
    }

    await this.refundModel.create({
      paymentId: payment._id,
      amount: amountMinor,
      currency: payment.currency,
      gatewayRefundId: refundResult.id,
      status: 'SUCCESS',
      reason,
      gatewayResponse: refundResult,
    });

    await this.processRefundEvent(
      payment.gatewayTransactionId,
      amountMinor,
      refundResult,
    );

    return { success: true, refundId: refundResult.id };
  }

  /**
   * Subscribes a student to automated billing
   */
  async createSubscription(
    studentId: string,
    planId: string,
    gateway: 'STRIPE' | 'RAZORPAY',
  ): Promise<any> {
    const student = await this.studentModel.findById(studentId);
    if (!student) throw new NotFoundException(`Student ${studentId} not found`);

    const school = await this.schoolModel.findById(student.schoolId);
    const paymentSettings = (school as any)?.paymentSettings || {};

    if (gateway === 'STRIPE') {
      const customer = await this.stripeService.createCustomer(
        student.email,
        `${student.firstName} ${student.lastName}`,
        { schoolId: student.schoolId?.toString() || '' },
        paymentSettings.stripeSecretKey,
      );

      const stripeSub = await this.stripeService.createSubscription(
        customer.id,
        planId,
        { studentId: student._id.toString() },
        paymentSettings.stripeSecretKey,
      );

      const sub = await this.subscriptionModel.create({
        studentId: student._id,
        gateway: 'STRIPE',
        gatewayCustomerId: customer.id,
        gatewaySubscriptionId: stripeSub.id,
        status: stripeSub.status.toUpperCase(),
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        planId,
        isActive: true,
      });

      return sub;
    } else if (gateway === 'RAZORPAY') {
      const razorpayCustomer = await this.razorpayService.createCustomer(
        `${student.firstName} ${student.lastName}`,
        student.email,
        student.phone,
        { schoolId: student.schoolId?.toString() || '' },
        paymentSettings.razorpayKeyId,
        paymentSettings.razorpayKeySecret,
      );

      const razorpaySub = await this.razorpayService.createSubscription(
        razorpayCustomer.id,
        planId,
        12, // 12 cycles for monthly fees
        { studentId: student._id.toString() },
        paymentSettings.razorpayKeyId,
        paymentSettings.razorpayKeySecret,
      );

      const sub = await this.subscriptionModel.create({
        studentId: student._id,
        gateway: 'RAZORPAY',
        gatewayCustomerId: razorpayCustomer.id,
        gatewaySubscriptionId: razorpaySub.id,
        status: 'PENDING',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        planId,
        isActive: true,
      });

      return sub;
    }
  }

  /**
   * Cancels active customer subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<any> {
    const sub = await this.subscriptionModel.findById(subscriptionId);
    if (!sub)
      throw new NotFoundException(`Subscription ${subscriptionId} not found`);

    const student = await this.studentModel.findById(sub.studentId);
    const school = await this.schoolModel.findById(student?.schoolId);
    const paymentSettings = (school as any)?.paymentSettings || {};

    if (sub.gateway === 'STRIPE') {
      await this.stripeService.cancelSubscription(
        sub.gatewaySubscriptionId,
        paymentSettings.stripeSecretKey,
      );
    } else {
      await this.razorpayService.cancelSubscription(
        sub.gatewaySubscriptionId,
        paymentSettings.razorpayKeyId,
        paymentSettings.razorpayKeySecret,
      );
    }

    sub.status = 'CANCELLED';
    sub.isActive = false;
    await sub.save();

    return sub;
  }

  /**
   * Revenue analytics engine
   */
  async getRevenueAnalytics(): Promise<any> {
    const successPayments = await this.paymentModel.find({ status: 'SUCCESS' });
    const refundedPayments = await this.paymentModel.find({
      status: { $in: ['REFUNDED', 'PARTIALLY_REFUNDED'] },
    });
    const failedPayments = await this.paymentModel.countDocuments({
      status: 'FAILED',
    });
    const pendingPayments = await this.paymentModel.countDocuments({
      status: 'PENDING',
    });

    const totalCollected = successPayments.reduce(
      (sum, p) => sum + p.amount / 100,
      0,
    );
    const totalRefunded = refundedPayments.reduce(
      (sum, r) => sum + (r.refundedAmount || 0),
      0,
    );
    const netRevenue = totalCollected - totalRefunded;

    const totalTx = successPayments.length + failedPayments + pendingPayments;
    const failureRate = totalTx > 0 ? (failedPayments / totalTx) * 100 : 0;

    // MRR approximation from active subscriptions
    const activeSubs = await this.subscriptionModel.find({ status: 'ACTIVE' });
    const estimatedMRR = activeSubs.length * 50; // Assume baseline plan rate of $50/Rs.50 for estimation if dynamic plan billing lookup isn't resolved

    return {
      totalCollected,
      totalRefunded,
      netRevenue,
      transactions: {
        success: successPayments.length,
        failed: failedPayments,
        pending: pendingPayments,
        total: totalTx,
      },
      failureRate: Number(failureRate.toFixed(2)),
      estimatedMRR,
    };
  }
}
