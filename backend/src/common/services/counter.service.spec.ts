import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CounterService } from './counter.service';
import { Counter } from '../schemas/counter.schema';

describe('CounterService', () => {
  let service: CounterService;
  const mockCounterModel = {
    findOneAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CounterService,
        {
          provide: getModelToken(Counter.name),
          useValue: mockCounterModel,
        },
      ],
    }).compile();

    service = module.get<CounterService>(CounterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNextSequence', () => {
    it('should increment sequence and return the new value', async () => {
      const mockResult = { seq: 42 };
      mockCounterModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockResult),
      });

      const seq = await service.getNextSequence('test_counter');
      expect(seq).toBe(42);
      expect(mockCounterModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'test_counter' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true },
      );
    });

    it('should throw an error if findOneAndUpdate returns null', async () => {
      mockCounterModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getNextSequence('test_counter')).rejects.toThrow(
        'Failed to generate sequence for counter: test_counter',
      );
    });
  });

  describe('generateAdmissionNumber', () => {
    it('should return a formatted admission number', async () => {
      const mockResult = { seq: 5 };
      mockCounterModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockResult),
      });

      const admissionNumber = await service.generateAdmissionNumber();
      const year = new Date().getFullYear();
      expect(admissionNumber).toBe(`PSEI-${year}-000005`);
    });
  });

  describe('generateRollNumber', () => {
    it('should return a formatted roll number scoped by class and academic year', async () => {
      const mockResult = { seq: 12 };
      mockCounterModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockResult),
      });

      const classId = '60783f2a';
      const academicYearId = '2026';
      const rollNumber = await service.generateRollNumber(
        classId,
        academicYearId,
      );
      expect(rollNumber).toBe('PSEIGEN783F2A000012');
      expect(mockCounterModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: `roll_number:${classId}:${academicYearId}` },
        { $inc: { seq: 1 } },
        { new: true, upsert: true },
      );
    });
  });
});
