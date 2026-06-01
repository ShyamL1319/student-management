import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TimetablesService } from './timetables.service';
import { Timetable, DayOfWeek } from './schemas/timetable.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TimetablesService', () => {
  let service: TimetablesService;
  let mockModel: any;

  beforeEach(async () => {
    mockModel = {
      create: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      countDocuments: jest.fn(),
      insertMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimetablesService,
        {
          provide: getModelToken(Timetable.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<TimetablesService>(TimetablesService);
  });

  describe('create', () => {
    it('should create a timetable entry', async () => {
      const createDto = {
        class: '507f1f77bcf86cd799439011',
        academicYear: '507f1f77bcf86cd799439012',
        teacher: '507f1f77bcf86cd799439013',
        subject: '507f1f77bcf86cd799439014',
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '09:00',
        endTime: '10:00',
        room: 'Room 101',
      };

      const result = { _id: '507f1f77bcf86cd799439015', ...createDto };
      mockModel.create.mockResolvedValue(result);
      mockModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      const res = await service.create(createDto);
      expect(res).toEqual(result);
      expect(mockModel.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw BadRequestException for invalid time format', async () => {
      const createDto = {
        class: '507f1f77bcf86cd799439011',
        academicYear: '507f1f77bcf86cd799439012',
        teacher: '507f1f77bcf86cd799439013',
        subject: '507f1f77bcf86cd799439014',
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '25:00', // Invalid
        endTime: '10:00',
      };

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if end time is before start time', async () => {
      const createDto = {
        class: '507f1f77bcf86cd799439011',
        academicYear: '507f1f77bcf86cd799439012',
        teacher: '507f1f77bcf86cd799439013',
        subject: '507f1f77bcf86cd799439014',
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '10:00',
        endTime: '09:00',
      };

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated timetables', async () => {
      const mockData = [
        {
          _id: '507f1f77bcf86cd799439015',
          class: { name: 'Class A' },
          teacher: { firstName: 'John', lastName: 'Doe' },
        },
      ];

      mockModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockData),
      });

      mockModel.countDocuments.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(mockData);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a timetable by id', async () => {
      const mockData = {
        _id: '507f1f77bcf86cd799439015',
        class: { name: 'Class A' },
      };

      mockModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockData),
      });

      const result = await service.findOne('507f1f77bcf86cd799439015');
      expect(result).toEqual(mockData);
    });

    it('should throw NotFoundException if timetable not found', async () => {
      mockModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('detectConflicts', () => {
    it('should detect teacher double booking', async () => {
      const conflictingTimetable = {
        _id: '507f1f77bcf86cd799439016',
        class: { name: 'Class A' },
        teacher: { firstName: 'John', lastName: 'Doe' },
        subject: { name: 'Math' },
        startTime: '09:00',
        endTime: '10:00',
        dayOfWeek: DayOfWeek.MONDAY,
      };

      mockModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([conflictingTimetable]),
      });

      const result = await service.detectConflicts({
        teacher: '507f1f77bcf86cd799439013',
        class: '507f1f77bcf86cd799439011',
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '09:30',
        endTime: '10:30',
      });

      expect(result.hasConflict).toBe(true);
      expect(result.conflicts.length).toBeGreaterThan(0);
    });

    it('should not detect conflict if times do not overlap', async () => {
      mockModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.detectConflicts({
        teacher: '507f1f77bcf86cd799439013',
        class: '507f1f77bcf86cd799439011',
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '09:00',
        endTime: '10:00',
      });

      expect(result.hasConflict).toBe(false);
      expect(result.conflicts.length).toBe(0);
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple timetables', async () => {
      const timetables = [
        {
          class: '507f1f77bcf86cd799439011',
          academicYear: '507f1f77bcf86cd799439012',
          teacher: '507f1f77bcf86cd799439013',
          subject: '507f1f77bcf86cd799439014',
          dayOfWeek: DayOfWeek.MONDAY,
          startTime: '09:00',
          endTime: '10:00',
        },
      ];

      const result = [{ _id: 'new-id', ...timetables[0] }];
      mockModel.insertMany.mockResolvedValue(result);

      const res = await service.bulkCreate(timetables);
      expect(res).toEqual(result);
    });

    it('should throw error if there are conflicts in batch', async () => {
      const timetables = [
        {
          class: '507f1f77bcf86cd799439011',
          academicYear: '507f1f77bcf86cd799439012',
          teacher: '507f1f77bcf86cd799439013',
          subject: '507f1f77bcf86cd799439014',
          dayOfWeek: DayOfWeek.MONDAY,
          startTime: '09:00',
          endTime: '10:00',
        },
        {
          class: '507f1f77bcf86cd799439011',
          academicYear: '507f1f77bcf86cd799439012',
          teacher: '507f1f77bcf86cd799439013', // Same teacher
          subject: '507f1f77bcf86cd799439015',
          dayOfWeek: DayOfWeek.MONDAY,
          startTime: '09:30', // Overlapping
          endTime: '10:30',
        },
      ];

      await expect(service.bulkCreate(timetables)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getWeeklyTimetable', () => {
    it('should return timetable grouped by day of week', async () => {
      const mockData = [
        {
          _id: '507f1f77bcf86cd799439015',
          dayOfWeek: DayOfWeek.MONDAY,
          startTime: '09:00',
          endTime: '10:00',
          class: { name: 'Class A' },
          teacher: { firstName: 'John', lastName: 'Doe' },
        },
      ];

      mockModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockData),
      });

      const result = await service.getWeeklyTimetable('507f1f77bcf86cd799439011');

      expect(result[DayOfWeek.MONDAY]).toBeDefined();
      expect(result[DayOfWeek.MONDAY].length).toBe(1);
    });
  });
});
