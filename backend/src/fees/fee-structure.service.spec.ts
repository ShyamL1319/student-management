import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { FeeStructureService } from './fee-structure.service';
import { FeeStructure } from './schemas/fee-structure.schema';

describe('FeeStructureService', () => {
  let service: FeeStructureService;
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
        FeeStructureService,
        {
          provide: getModelToken(FeeStructure.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<FeeStructureService>(FeeStructureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a fee structure', async () => {
      const dto = {
        classId: 'class1',
        academicYearId: 'year1',
        feeName: 'Tuition',
        amount: 5000,
        dueDate: new Date(),
      };

      const mockSave = jest.fn().mockResolvedValue({ _id: 'id1', ...dto });
      mockModel.mockImplementation(() => ({
        save: mockSave,
      }));
      mockModel.prototype.save = mockSave;

      const result = await service.create(dto);
      expect(result).toBeDefined();
    });
  });

  describe('findByClass', () => {
    it('should find all fee structures for a class', async () => {
      const mockFees = [
        { classId: 'class1', feeName: 'Tuition', amount: 5000 },
      ];

      mockModel.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockFees),
      });

      const result = await service.findByClass('class1');
      expect(result).toEqual(mockFees);
      expect(mockModel.find).toHaveBeenCalled();
    });
  });

  describe('deactivate', () => {
    it('should deactivate a fee structure', async () => {
      const mockFee = { _id: 'id1', feeName: 'Tuition', isActive: false };

      mockModel.findByIdAndUpdate = jest.fn().mockResolvedValue(mockFee);

      const result = await service.deactivate('id1');
      expect(result.isActive).toBe(false);
    });
  });
});
