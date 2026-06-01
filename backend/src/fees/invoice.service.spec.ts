import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { InvoiceService } from './invoice.service';
import { Invoice } from './schemas/invoice.schema';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let mockModel: any;

  beforeEach(async () => {
    mockModel = jest.fn();
    mockModel.find = jest.fn().mockReturnThis();
    mockModel.findOne = jest.fn();
    mockModel.findById = jest.fn();
    mockModel.findByIdAndUpdate = jest.fn();
    mockModel.findByIdAndDelete = jest.fn();
    mockModel.countDocuments = jest.fn().mockResolvedValue(0);
    mockModel.lean = jest.fn().mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        {
          provide: getModelToken(Invoice.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create invoice with ISSUED status', async () => {
      const dto = {
        studentId: 'student1',
        classId: 'class1',
        academicYearId: 'year1',
        invoiceDate: new Date(),
        dueDate: new Date(),
        feeItems: [{ feeName: 'Tuition', amount: 5000 }],
        totalAmount: 5000,
        netAmount: 5000,
        issuedBy: 'admin1',
      };

      const mockSave = jest.fn().mockResolvedValue({
        _id: 'id1',
        invoiceNumber: 'INV-2026-06-00001',
        status: 'ISSUED',
        pendingAmount: 5000,
        ...dto,
      });

      mockModel.mockImplementation(() => ({
        save: mockSave,
      }));
      mockModel.prototype.save = mockSave;

      const result = await service.create(dto);
      expect(result).toBeDefined();
      expect(result.status).toBe('ISSUED');
    });
  });

  describe('recordPayment', () => {
    it('should update invoice payment status', async () => {
      const mockInvoice = {
        _id: 'id1',
        netAmount: 5000,
        paidAmount: 0,
        status: 'ISSUED',
      };

      mockModel.findById = jest.fn().mockResolvedValue(mockInvoice);
      mockModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
        ...mockInvoice,
        paidAmount: 5000,
        status: 'PAID',
        pendingAmount: 0,
      });

      const result = await service.recordPayment('id1', 5000);
      expect(result.status).toBe('PAID');
    });
  });

  describe('getOverdueInvoices', () => {
    it('should get overdue invoices', async () => {
      const mockOverdue = [
        { invoiceNumber: 'INV-2026-06-00001', status: 'OVERDUE', dueDate: new Date('2026-05-01') },
      ];

      mockModel.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockOverdue),
      });

      const result = await service.getOverdueInvoices();
      expect(result.length).toBe(1);
    });
  });
});
