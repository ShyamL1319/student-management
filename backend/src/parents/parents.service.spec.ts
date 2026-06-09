import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ParentsService } from './parents.service';
import { User } from '../users/schemas/user.schema';
import { Role } from '../roles/schemas/role.schema';
import { Student } from '../students/schemas/student.schema';
import { Attendance } from '../attendances/schemas/attendance.schema';
import { Mark } from '../marks/schemas/mark.schema';
import { Invoice } from '../fees/schemas/invoice.schema';
import { Exam } from '../examinations/schemas/exam.schema';
import { Notification } from '../notifications/schemas/notification.schema';
import { Message } from './schemas/message.schema';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Types } from 'mongoose';

describe('ParentsService', () => {
  let service: ParentsService;

  // Mock document instances
  const mockParentUser = {
    _id: new Types.ObjectId(),
    email: 'parent@example.com',
    roleType: 'PARENT',
    children: [new Types.ObjectId('507f1f77bcf86cd799439011')],
    save: jest.fn().mockResolvedValue(true),
    toObject: jest.fn().mockReturnValue({
      _id: 'parentUserId',
      email: 'parent@example.com',
      roleType: 'PARENT',
      children: ['507f1f77bcf86cd799439011'],
    }),
  };

  const mockStudent = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    admissionNumber: 'ADM-2026-000001',
    dob: new Date('2015-05-15'),
    parentId: null,
    save: jest.fn().mockResolvedValue(true),
  };

  const mockRole = {
    _id: new Types.ObjectId(),
    name: 'PARENT',
  };

  // Mock Model constructors and queries
  const mockUserModelSave = jest.fn();
  const mockUserModelToObject = jest.fn();

  function mockUserModelConstructor(this: any, data: any) {
    this.save = mockUserModelSave;
    this.toObject = mockUserModelToObject;
    Object.assign(this, data);
  }

  mockUserModelConstructor.findOne = jest.fn();
  mockUserModelConstructor.findById = jest.fn();
  mockUserModelConstructor.updateOne = jest.fn();
  mockUserModelConstructor.findByIdAndUpdate = jest.fn();

  const mockUserModel = mockUserModelConstructor as any;

  const mockRoleModel = {
    findOne: jest.fn(),
  };

  const mockStudentModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
  };

  const mockAttendanceModel = {
    find: jest.fn(),
    countDocuments: jest.fn(),
  };

  const mockMarkModel = {
    find: jest.fn(),
  };

  const mockInvoiceModel = {
    find: jest.fn(),
  };

  const mockExamModel = {
    find: jest.fn(),
  };

  const mockNotificationModel = {
    find: jest.fn(),
  };

  const mockMessageModel = {
    find: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParentsService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: getModelToken(Role.name), useValue: mockRoleModel },
        { provide: getModelToken(Student.name), useValue: mockStudentModel },
        {
          provide: getModelToken(Attendance.name),
          useValue: mockAttendanceModel,
        },
        { provide: getModelToken(Mark.name), useValue: mockMarkModel },
        { provide: getModelToken(Invoice.name), useValue: mockInvoiceModel },
        { provide: getModelToken(Exam.name), useValue: mockExamModel },
        {
          provide: getModelToken(Notification.name),
          useValue: mockNotificationModel,
        },
        { provide: getModelToken(Message.name), useValue: mockMessageModel },
      ],
    }).compile();

    service = module.get<ParentsService>(ParentsService);

    // Mock queries
    mockUserModel.findOne.mockReturnValue({
      setOptions: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(null),
    });

    mockRoleModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockRole),
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a parent', async () => {
      mockUserModelSave.mockResolvedValue({
        toObject: () => ({ email: 'parent@example.com', roleType: 'PARENT' }),
      });

      const result = await service.register({
        email: 'parent@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        relationshipType: 'Father',
      });

      expect(result.email).toBe('parent@example.com');
      expect(result.roleType).toBe('PARENT');
    });

    it('should throw BadRequestException if email already exists', async () => {
      mockUserModel.findOne.mockReturnValue({
        setOptions: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockParentUser),
      });

      await expect(
        service.register({
          email: 'parent@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('linkChild', () => {
    it('should successfully link a student child if dob matches', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockParentUser),
      });

      mockStudentModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStudent),
      });

      const result = await service.linkChild(mockParentUser._id.toString(), {
        admissionNumber: 'ADM-2026-000001',
        dob: '2015-05-15',
      });

      expect(result.message).toBe('Child linked successfully');
      expect(result.studentId).toEqual(mockStudent._id);
    });

    it('should throw BadRequestException if student dob is mismatch', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockParentUser),
      });

      mockStudentModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStudent),
      });

      await expect(
        service.linkChild(mockParentUser._id.toString(), {
          admissionNumber: 'ADM-2026-000001',
          dob: '2015-06-20', // mismatched month
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyChildAccess', () => {
    it('should throw ForbiddenException if parent does not own student records', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockParentUser),
      });

      mockStudentModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStudent),
      });

      // Child ID not in parent.children list
      const unauthorizedStudentId = new Types.ObjectId().toString();

      await expect(
        service.getChildFees(
          mockParentUser._id.toString(),
          unauthorizedStudentId,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
