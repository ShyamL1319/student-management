import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PaymentService } from './payment.service';
import { StripeService } from './stripe.service';
import { RazorpayService } from './razorpay.service';
import { PhonepeService } from './phonepe.service';
import { ReceiptPdfService } from './receipt-pdf.service';
import { QueueJobProcessor } from './queue-job.processor';
import { EmailService } from '../../notifications/services/email.service';
import { ConfigService } from '@nestjs/config';
import { Payment } from '../schemas/payment.schema';
import { Subscription } from '../schemas/subscription.schema';
import { Refund } from '../schemas/refund.schema';
import { QueueJob } from '../schemas/queue-job.schema';
import { Invoice } from '../../fees/schemas/invoice.schema';
import { FeeCollection } from '../../fees/schemas/fee-collection.schema';
import { Receipt } from '../../fees/schemas/receipt.schema';
import { Student } from '../../students/schemas/student.schema';
import { School } from '../../schools/schemas/school.schema';

describe('PaymentService', () => {
  let service: PaymentService;
  let mockPaymentModel: any;
  let mockInvoiceModel: any;
  let mockStudentModel: any;
  let mockSchoolModel: any;
  let mockStripeService: any;
  let mockRazorpayService: any;
  let mockReceiptPdfService: any;

  beforeEach(async () => {
    mockPaymentModel = jest.fn();
    mockPaymentModel.create = jest.fn();
    mockPaymentModel.findOne = jest.fn();

    mockInvoiceModel = jest.fn();
    mockInvoiceModel.findById = jest.fn();

    mockStudentModel = jest.fn();
    mockStudentModel.findById = jest.fn();

    mockSchoolModel = jest.fn();
    mockSchoolModel.findById = jest.fn();

    mockStripeService = {
      createPaymentIntent: jest.fn(),
      createRefund: jest.fn(),
    };

    mockRazorpayService = {
      createOrder: jest.fn(),
      createRefund: jest.fn(),
    };

    mockReceiptPdfService = {
      generateAndEmailReceipt: jest.fn(),
    };

    const mockPhonepeService = {
      createPaymentRequest: jest.fn(),
      createRefund: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: getModelToken(Payment.name), useValue: mockPaymentModel },
        { provide: getModelToken(Subscription.name), useValue: jest.fn() },
        { provide: getModelToken(Refund.name), useValue: jest.fn() },
        { provide: getModelToken(QueueJob.name), useValue: jest.fn() },
        { provide: getModelToken(Invoice.name), useValue: mockInvoiceModel },
        { provide: getModelToken(FeeCollection.name), useValue: jest.fn() },
        { provide: getModelToken(Receipt.name), useValue: jest.fn() },
        { provide: getModelToken(Student.name), useValue: mockStudentModel },
        { provide: getModelToken(School.name), useValue: mockSchoolModel },
        { provide: StripeService, useValue: mockStripeService },
        { provide: RazorpayService, useValue: mockRazorpayService },
        { provide: PhonepeService, useValue: mockPhonepeService },
        { provide: ReceiptPdfService, useValue: mockReceiptPdfService },
        { provide: QueueJobProcessor, useValue: { setPaymentService: jest.fn() } },
        { provide: EmailService, useValue: { sendEmail: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initiatePayment', () => {
    it('should initiate Stripe checkout session successfully', async () => {
      const mockStudent = { _id: 'student123', schoolId: 'school123' };
      const mockInvoice = { _id: 'invoice123', pendingAmount: 500, netAmount: 500, invoiceNumber: 'INV001', status: 'ISSUED' };

      mockStudentModel.findById.mockResolvedValue(mockStudent);
      mockInvoiceModel.findById.mockResolvedValue(mockInvoice);
      mockSchoolModel.findById.mockResolvedValue({ name: 'Test Academy' });

      mockStripeService.createPaymentIntent.mockResolvedValue({
        id: 'intent_123',
        client_secret: 'secret_123',
      });

      mockPaymentModel.create.mockResolvedValue({
        _id: 'payment123',
        status: 'PENDING',
      });

      const result = await service.initiatePayment('student123', 'invoice123', 'STRIPE');

      expect(result).toBeDefined();
      expect(result.clientSecret).toBe('secret_123');
      expect(mockStripeService.createPaymentIntent).toHaveBeenCalled();
    });

    it('should initiate Razorpay checkout order successfully', async () => {
      const mockStudent = { _id: 'student123', schoolId: 'school123' };
      const mockInvoice = { _id: 'invoice123', pendingAmount: 300, netAmount: 300, invoiceNumber: 'INV002', status: 'ISSUED' };

      mockStudentModel.findById.mockResolvedValue(mockStudent);
      mockInvoiceModel.findById.mockResolvedValue(mockInvoice);
      mockSchoolModel.findById.mockResolvedValue({ name: 'Test Academy' });

      mockRazorpayService.createOrder.mockResolvedValue({
        id: 'order_123',
        amount: 30000,
        currency: 'INR',
      });

      mockPaymentModel.create.mockResolvedValue({
        _id: 'payment456',
        status: 'PENDING',
      });

      const result = await service.initiatePayment('student123', 'invoice123', 'RAZORPAY');

      expect(result).toBeDefined();
      expect(result.orderId).toBe('order_123');
      expect(mockRazorpayService.createOrder).toHaveBeenCalled();
    });
  });
});
