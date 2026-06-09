import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LeaveRequestsService } from './leave-requests.service';
import { LeaveRequest } from './schemas/leave-request.schema';
import { LeaveBalance } from './schemas/leave-balance.schema';
import { Attendance } from '../attendances/schemas/attendance.schema';
import { User } from '../users/schemas/user.schema';
import { NotificationService } from '../notifications/services/notification.service';

describe('LeaveRequestsService', () => {
  let service: LeaveRequestsService;

  const mockLeaveRequestModel = {
    create: jest.fn(),
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndDelete: jest.fn().mockReturnThis(),
    findOneAndDelete: jest.fn().mockReturnThis(),
    countDocuments: jest.fn().mockReturnThis(),
    aggregate: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockLeaveBalanceModel = {
    create: jest.fn(),
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findOneAndUpdate: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockAttendanceModel = {
    create: jest.fn(),
    deleteOne: jest.fn().mockReturnThis(),
    findOneAndUpdate: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockUserModel = {
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockNotificationService = {
    create: jest.fn().mockResolvedValue({}),
  };

  const dummyUserId = new Types.ObjectId().toString();
  const dummySchoolId = new Types.ObjectId().toString();
  const dummyApproverId = new Types.ObjectId().toString();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaveRequestsService,
        {
          provide: getModelToken(LeaveRequest.name),
          useValue: mockLeaveRequestModel,
        },
        {
          provide: getModelToken(LeaveBalance.name),
          useValue: mockLeaveBalanceModel,
        },
        {
          provide: getModelToken(Attendance.name),
          useValue: mockAttendanceModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<LeaveRequestsService>(LeaveRequestsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if startDate is after endDate', async () => {
      const dto = {
        startDate: '2026-06-15T00:00:00.000Z',
        endDate: '2026-06-10T00:00:00.000Z',
        type: 'Sick',
        reason: 'Toothache',
      };

      await expect(
        service.create(dummyUserId, dummySchoolId, 'STUDENT', dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if type is Medical and medicalAttachmentUrl is missing', async () => {
      const dto = {
        startDate: '2026-06-10T00:00:00.000Z',
        endDate: '2026-06-12T00:00:00.000Z',
        type: 'Medical',
        reason: 'Surgery',
      };

      await expect(
        service.create(dummyUserId, dummySchoolId, 'STUDENT', dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully submit student leave and deduct balance', async () => {
      const dto = {
        startDate: '2026-06-10T00:00:00.000Z',
        endDate: '2026-06-12T00:00:00.000Z',
        type: 'Sick',
        reason: 'Toothache',
      };

      const mockBalance = {
        userId: new Types.ObjectId(),
        leaveType: 'Sick',
        allocated: 10,
        used: 0,
        pending: 0,
        year: 2026,
        save: jest.fn().mockResolvedValue(true),
      };

      mockLeaveBalanceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBalance),
      });

      mockLeaveRequestModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const mockCreatedLeave = {
        _id: new Types.ObjectId(),
        ...dto,
        status: 'PENDING',
        currentStep: 1,
        approvalWorkflow: [
          { step: 1, status: 'PENDING', approverRole: 'TEACHER' },
          { step: 2, status: 'PENDING', approverRole: 'ADMIN' },
        ],
      };

      mockLeaveRequestModel.create.mockResolvedValue(mockCreatedLeave);
      mockUserModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.create(dummyUserId, dummySchoolId, 'STUDENT', dto);

      expect(result).toBeDefined();
      expect(mockBalance.pending).toBe(3); // 3 days: 10, 11, 12
      expect(mockLeaveRequestModel.create).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should reject step and overall request', async () => {
      const mockRequest = {
        _id: new Types.ObjectId(),
        requesterId: new Types.ObjectId(),
        requesterType: 'STUDENT',
        startDate: new Date('2026-06-10T00:00:00.000Z'),
        endDate: new Date('2026-06-12T00:00:00.000Z'),
        type: 'Sick',
        status: 'PENDING',
        currentStep: 1,
        approvalWorkflow: [
          { step: 1, status: 'PENDING', approverRole: 'TEACHER' },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      const mockApprover = {
        _id: new Types.ObjectId(),
        roleType: 'TEACHER',
      };

      const mockBalance = {
        pending: 3,
        save: jest.fn().mockResolvedValue(true),
      };

      mockLeaveRequestModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRequest),
      });

      mockUserModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockApprover),
      });

      mockLeaveBalanceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBalance),
      });

      const result = await service.updateStatus(
        mockRequest._id.toString(),
        dummySchoolId,
        mockApprover._id.toString(),
        { status: 'REJECTED', remarks: 'Not allowed' },
      );

      expect(mockRequest.status).toBe('REJECTED');
      expect(mockBalance.pending).toBe(0);
      expect(mockRequest.save).toHaveBeenCalled();
    });

    it('should approve step and transition status on final step', async () => {
      const mockRequest = {
        _id: new Types.ObjectId(),
        requesterId: new Types.ObjectId(),
        requesterType: 'TEACHER',
        startDate: new Date('2026-06-10T00:00:00.000Z'),
        endDate: new Date('2026-06-10T00:00:00.000Z'), // 1 day
        type: 'Casual',
        status: 'PENDING',
        currentStep: 1,
        school: new Types.ObjectId(dummySchoolId),
        approvalWorkflow: [
          { step: 1, status: 'PENDING', approverRole: 'ADMIN' },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      const mockApprover = {
        _id: new Types.ObjectId(),
        roleType: 'ADMIN',
      };

      const mockBalance = {
        pending: 1,
        used: 0,
        save: jest.fn().mockResolvedValue(true),
      };

      mockLeaveRequestModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRequest),
      });

      mockUserModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockApprover),
      });

      mockLeaveBalanceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBalance),
      });

      mockAttendanceModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      const result = await service.updateStatus(
        mockRequest._id.toString(),
        dummySchoolId,
        mockApprover._id.toString(),
        { status: 'APPROVED', remarks: 'Good to go' },
      );

      expect(mockRequest.status).toBe('APPROVED');
      expect(mockBalance.pending).toBe(0);
      expect(mockBalance.used).toBe(1);
      expect(mockAttendanceModel.findOneAndUpdate).toHaveBeenCalled();
      expect(mockRequest.save).toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should cancel pending request and release balance', async () => {
      const userId = new Types.ObjectId();
      const mockRequest = {
        _id: new Types.ObjectId(),
        requesterId: userId,
        requesterType: 'TEACHER',
        startDate: new Date('2026-06-10T00:00:00.000Z'),
        endDate: new Date('2026-06-10T00:00:00.000Z'),
        type: 'Casual',
        status: 'PENDING',
        save: jest.fn().mockResolvedValue(true),
      };

      const mockBalance = {
        pending: 1,
        save: jest.fn().mockResolvedValue(true),
      };

      mockLeaveRequestModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRequest),
      });

      mockLeaveBalanceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBalance),
      });

      const result = await service.cancel(
        mockRequest._id.toString(),
        dummySchoolId,
        userId.toString(),
      );

      expect(mockRequest.status).toBe('CANCELLED');
      expect(mockBalance.pending).toBe(0);
      expect(mockRequest.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if trying to cancel approved request in the past/present', async () => {
      const userId = new Types.ObjectId();
      // startDate is June 1st (past relative to June 8th 2026)
      const mockRequest = {
        _id: new Types.ObjectId(),
        requesterId: userId,
        requesterType: 'TEACHER',
        startDate: new Date('2026-06-01T00:00:00.000Z'),
        endDate: new Date('2026-06-02T00:00:00.000Z'),
        type: 'Casual',
        status: 'APPROVED',
        save: jest.fn().mockResolvedValue(true),
      };

      mockLeaveRequestModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRequest),
      });

      await expect(
        service.cancel(
          mockRequest._id.toString(),
          dummySchoolId,
          userId.toString(),
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
