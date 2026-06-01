/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ReceiptService } from './receipt.service';
import { Receipt } from './schemas/receipt.schema';

describe('ReceiptService', () => {
  let service: ReceiptService;
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
        ReceiptService,
        {
          provide: getModelToken(Receipt.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<ReceiptService>(ReceiptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create receipt with auto-generated receipt number', async () => {
      const dto = {
        studentId: 'student1',
        feeCollectionId: 'fee1',
        amountReceived: 5000,
        paymentDate: new Date(),
        paymentMethod: 'CASH',
        receivedBy: 'admin1',
      };

      const mockSave = jest.fn().mockResolvedValue({
        _id: 'id1',
        receiptNumber: 'RCP-2026-06-00001',
        status: 'ISSUED',
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

  describe('findByStudent', () => {
    it('should find all receipts for a student', async () => {
      const mockReceipts = [
        {
          studentId: 'student1',
          receiptNumber: 'RCP-2026-06-00001',
          status: 'ISSUED',
        },
      ];

      mockModel.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockReceipts),
      });

      const result = await service.findByStudent('student1');
      expect(result.length).toBe(1);
    });
  });

  describe('cancel', () => {
    it('should cancel a receipt', async () => {
      const mockReceipt = { _id: 'id1', status: 'CANCELLED' };

      mockModel.findByIdAndUpdate = jest.fn().mockResolvedValue(mockReceipt);

      const result = await service.cancel('id1');
      expect(result.status).toBe('CANCELLED');
    });
  });
});
