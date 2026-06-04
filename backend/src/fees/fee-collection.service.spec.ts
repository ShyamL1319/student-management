import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { FeeCollectionService } from './fee-collection.service';
import { FeeCollection } from './schemas/fee-collection.schema';

describe('FeeCollectionService', () => {
  let service: FeeCollectionService;
  let mockModel: any;

  beforeEach(async () => {
    mockModel = jest.fn();
    mockModel.find = jest.fn().mockReturnThis();
    mockModel.findById = jest.fn();
    mockModel.findByIdAndUpdate = jest.fn();
    mockModel.findByIdAndDelete = jest.fn();
    mockModel.lean = jest.fn().mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeeCollectionService,
        {
          provide: getModelToken(FeeCollection.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<FeeCollectionService>(FeeCollectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create fee collection with PENDING status', async () => {
      const dto = {
        studentId: 'student1',
        feeStructureId: 'fee1',
        classId: 'class1',
        academicYearId: 'year1',
        amountDue: 5000,
        dueDate: new Date(),
      };

      const mockSave = jest
        .fn()
        .mockResolvedValue({ _id: 'id1', status: 'PENDING', ...dto });
      mockModel.mockImplementation(() => ({
        save: mockSave,
      }));
      mockModel.prototype.save = mockSave;

      const result = await service.create(dto);
      expect(result).toBeDefined();
    });
  });

  describe('recordPayment', () => {
    it('should update payment status to PAID when full payment made', async () => {
      const mockFeeCollection = {
        _id: 'id1',
        amountDue: 5000,
        discount: 0,
        amountPaid: 0,
        dueDate: new Date(),
      };

      mockModel.findById = jest.fn().mockResolvedValue(mockFeeCollection);
      mockModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
        ...mockFeeCollection,
        amountPaid: 5000,
        status: 'PAID',
      });

      const result = await service.recordPayment('id1', 5000, 'CASH');
      expect(result.status).toBe('PAID');
    });
  });

  describe('getPendingFees', () => {
    it('should get all pending fees for a student', async () => {
      const mockPendingFees = [
        { studentId: 'student1', status: 'PENDING', amountDue: 5000 },
        { studentId: 'student1', status: 'OVERDUE', amountDue: 3000 },
      ];

      mockModel.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockPendingFees),
      });

      const result = await service.getPendingFees('student1');
      expect(result.length).toBe(2);
    });
  });

  describe('getOutstandingAmount', () => {
    it('should calculate outstanding amount for a student', async () => {
      const mockFees = [
        {
          studentId: 'student1',
          amountDue: 5000,
          discount: 0,
          amountPaid: 2000,
        },
        {
          studentId: 'student1',
          amountDue: 3000,
          discount: 500,
          amountPaid: 0,
        },
      ];

      mockModel.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockFees),
      });

      const result = await service.getOutstandingAmount('student1');
      expect(result.outstanding).toBeGreaterThan(0);
      expect(result.count).toBe(2);
    });
  });
});
