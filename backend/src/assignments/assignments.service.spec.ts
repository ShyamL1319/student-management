import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AssignmentsService } from './assignments.service';
import { Assignment } from './schemas/assignment.schema';
import { AssignmentSubmission } from './schemas/assignment-submission.schema';
import { NotificationService } from '../notifications/services/notification.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { Mark } from '../marks/schemas/mark.schema';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('AssignmentsService', () => {
  let service: AssignmentsService;
  let assignmentModelMock: any;
  let submissionModelMock: any;
  let markModelMock: any;
  let auditLogsServiceMock: any;
  let notificationServiceMock: any;

  const mockSchoolId = new Types.ObjectId().toString();
  const mockTeacherId = new Types.ObjectId().toString();
  const mockStudentId = new Types.ObjectId().toString();

  beforeEach(async () => {
    assignmentModelMock = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findOneAndDelete: jest.fn(),
      countDocuments: jest.fn(),
    };

    submissionModelMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
    };

    markModelMock = {
      updateOne: jest.fn(() => ({
        exec: jest.fn().mockResolvedValue({}),
      })),
    };

    auditLogsServiceMock = {
      create: jest.fn().mockResolvedValue({}),
    };

    notificationServiceMock = {
      create: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentsService,
        { provide: getModelToken(Assignment.name), useValue: assignmentModelMock },
        { provide: getModelToken(AssignmentSubmission.name), useValue: submissionModelMock },
        { provide: getModelToken(Mark.name), useValue: markModelMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: AuditLogsService, useValue: auditLogsServiceMock },
      ],
    }).compile();

    service = module.get<AssignmentsService>(AssignmentsService);
  });

  it('should prevent submission to a draft assignment', async () => {
    const mockAssignmentId = new Types.ObjectId().toString();
    const mockAssignment = {
      _id: mockAssignmentId,
      isPublished: false,
      latePolicy: { allowLate: true, gracePeriodMinutes: 0 },
    };

    assignmentModelMock.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockAssignment),
    });

    await expect(
      service.submit(mockStudentId, mockSchoolId, mockAssignmentId, {
        fileUrl: 'https://s3.com/submissions/potter.pdf',
        fileName: 'potter.pdf',
        fileSize: 1024,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should allow late submissions if policy permits and calculate penalty during grading', async () => {
    const mockAssignmentId = new Types.ObjectId().toString();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - 2); // 2 days late
    dueDate.setMinutes(dueDate.getMinutes() + 5); // ensures it is slightly less than 2 full days late (e.g. 1.99 days late)

    const mockAssignment = {
      _id: mockAssignmentId,
      maxMarks: 100,
      dueDate,
      latePolicy: {
        allowLate: true,
        gracePeriodMinutes: 0,
        penaltyPercentagePerDay: 10,
        maxPenaltyPercentage: 50,
      },
      subject: new Types.ObjectId(),
    };

    const mockSubmissionId = new Types.ObjectId().toString();
    const mockSubmission = {
      _id: mockSubmissionId,
      isLate: true,
      submittedAt: new Date(),
      student: new Types.ObjectId(mockStudentId),
      assignment: mockAssignment,
      save: jest.fn().mockImplementation(function (this: any) {
        return this;
      }),
    };

    submissionModelMock.findOne.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockSubmission),
    });

    const result = await service.grade(mockTeacherId, mockSchoolId, mockSubmissionId, {
      marksObtained: 90,
      feedback: 'Decent, but late.',
    });

    // 2 days late * 10% = 20% penalty. 20% of 100 maxMarks = 20 marks deduction.
    // 90 raw marks - 20 marks deduction = 70 final marks
    expect(result.marksObtained).toBe(70);
    expect(result.latePenaltyDeducted).toBe(20);
    expect(result.status).toBe('Graded');
  });

  it('should not mark submissions late if within grace period', async () => {
    const mockAssignmentId = new Types.ObjectId().toString();
    const dueDate = new Date();
    dueDate.setMinutes(dueDate.getMinutes() - 10); // Due 10 mins ago

    const mockAssignment = {
      _id: mockAssignmentId,
      isPublished: true,
      dueDate,
      latePolicy: {
        allowLate: true,
        gracePeriodMinutes: 15, // 15 mins grace period
        penaltyPercentagePerDay: 5,
        maxPenaltyPercentage: 50,
      },
      teacher: new Types.ObjectId(),
    };

    assignmentModelMock.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockAssignment),
    });

    submissionModelMock.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    submissionModelMock.create.mockImplementation((args) => Promise.resolve({
      ...args,
      _id: new Types.ObjectId(),
    }));

    const result = await service.submit(mockStudentId, mockSchoolId, mockAssignmentId, {
      fileUrl: 'https://s3.com/submissions/potter.pdf',
      fileName: 'potter.pdf',
      fileSize: 1024,
    });

    expect(result.isLate).toBe(false);
  });
});
