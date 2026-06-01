/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AttendancesService } from './attendances.service';
import {
  Attendance,
  AttendanceType,
  AttendanceStatus,
} from './schemas/attendance.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AttendancesService', () => {
  let service: AttendancesService;
  let mockModel: any;

  beforeEach(async () => {
    mockModel = {
      create: jest.fn(),
      exists: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      countDocuments: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendancesService,
        {
          provide: getModelToken(Attendance.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<AttendancesService>(AttendancesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new attendance record', async () => {
      const createDto = {
        attendeeType: AttendanceType.STUDENT,
        attendeeId: '507f1f77bcf86cd799439011',
        date: '2026-06-01',
        status: AttendanceStatus.PRESENT,
      };

      mockModel.exists.mockResolvedValue(false);
      mockModel.create.mockResolvedValue({ _id: 'new-id', ...createDto });

      const result = await service.create(createDto);

      expect(result).toEqual({ _id: 'new-id', ...createDto });
      expect(mockModel.create).toHaveBeenCalled();
    });

    it('should throw when attendance already exists for the date', async () => {
      const createDto = {
        attendeeType: AttendanceType.STUDENT,
        attendeeId: '507f1f77bcf86cd799439011',
        date: '2026-06-01',
        status: AttendanceStatus.PRESENT,
      };

      mockModel.exists.mockResolvedValue(true);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('should return attendance when found', async () => {
      const mockAttendance = { _id: '507f1f77bcf86cd799439012' };
      mockModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAttendance),
      });

      const result = await service.findOne('507f1f77bcf86cd799439012');
      expect(result).toEqual(mockAttendance);
    });

    it('should throw NotFoundException when attendance not found', async () => {
      mockModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
