import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AnalyticsService } from './analytics.service';
import { Types } from 'mongoose';

import { User } from '../users/schemas/user.schema';
import { School } from '../schools/schemas/school.schema';
import { Student } from '../students/schemas/student.schema';
import { Teacher } from '../teachers/schemas/teacher.schema';
import { Class } from '../classes/schemas/class.schema';
import { FeeCollection } from '../fees/schemas/fee-collection.schema';
import { Attendance } from '../attendances/schemas/attendance.schema';
import { Mark } from '../marks/schemas/mark.schema';
import { Exam } from '../examinations/schemas/exam.schema';
import { LeaveRequest } from '../leave-requests/schemas/leave-request.schema';
import { AdmissionApplication } from '../admissions/schemas/admission.schema';
import { Assignment } from '../assignments/schemas/assignment.schema';
import { AssignmentSubmission } from '../assignments/schemas/assignment-submission.schema';
import { Invoice } from '../fees/schemas/invoice.schema';
import { Message } from '../parents/schemas/message.schema';
import { AuditLog } from '../audit-logs/schemas/audit-log.schema';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { LeaveRequestsService } from '../leave-requests/leave-requests.service';
import { ParentsService } from '../parents/parents.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let mockModel: any;

  beforeEach(async () => {
    mockModel = {
      countDocuments: jest.fn(),
      aggregate: jest.fn(),
      findOne: jest.fn().mockReturnThis(),
      find: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
      db: {
        collection: jest.fn().mockReturnValue({
          find: jest.fn().mockReturnThis(),
          toArray: jest.fn().mockResolvedValue([]),
          findOne: jest.fn().mockResolvedValue(null),
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: getModelToken(User.name), useValue: mockModel },
        { provide: getModelToken(School.name), useValue: mockModel },
        { provide: getModelToken(Student.name), useValue: mockModel },
        { provide: getModelToken(Teacher.name), useValue: mockModel },
        { provide: getModelToken(Class.name), useValue: mockModel },
        { provide: getModelToken(FeeCollection.name), useValue: mockModel },
        { provide: getModelToken(Attendance.name), useValue: mockModel },
        { provide: getModelToken(Mark.name), useValue: mockModel },
        { provide: getModelToken(Exam.name), useValue: mockModel },
        { provide: getModelToken(LeaveRequest.name), useValue: mockModel },
        {
          provide: getModelToken(AdmissionApplication.name),
          useValue: mockModel,
        },
        { provide: getModelToken(Assignment.name), useValue: mockModel },
        {
          provide: getModelToken(AssignmentSubmission.name),
          useValue: mockModel,
        },
        { provide: getModelToken(Invoice.name), useValue: mockModel },
        { provide: getModelToken(Message.name), useValue: mockModel },
        { provide: getModelToken(AuditLog.name), useValue: mockModel },
        {
          provide: AuditLogsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: LeaveRequestsService,
          useValue: {
            getBalances: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: ParentsService,
          useValue: {
            getDashboard: jest
              .fn()
              .mockResolvedValue({ totalChildrenCount: 1, children: [] }),
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSuperAdminDashboard', () => {
    it('should return system-wide stats', async () => {
      mockModel.exec.mockResolvedValueOnce([{ name: 'Hogwarts' }]); // activeSchools

      mockModel.countDocuments
        .mockResolvedValueOnce(5) // schools
        .mockResolvedValueOnce(100) // users
        .mockResolvedValueOnce(50) // students
        .mockResolvedValueOnce(20); // teachers
      mockModel.aggregate.mockResolvedValueOnce([{ totalAmount: 1000 }]);

      const result = await service.getSuperAdminDashboard();

      expect(result.widgets.totalSchools).toBe(5);
      expect(result.widgets.totalUsers).toBe(100);
      expect(result.widgets.totalStudents).toBe(50);
      expect(result.widgets.totalTeachers).toBe(20);
      expect(result.widgets.globalRevenue).toBe(1000);
    });
  });

  describe('getSchoolAdminDashboard', () => {
    it('should return school-wide stats', async () => {
      mockModel.exec
        .mockResolvedValueOnce([]) // outstandingInvoices
        .mockResolvedValueOnce([]); // attendances

      mockModel.countDocuments
        .mockResolvedValueOnce(50) // students
        .mockResolvedValueOnce(20) // teachers
        .mockResolvedValueOnce(10); // classes
      mockModel.aggregate
        .mockResolvedValueOnce([{ totalAmount: 500 }]) // collected revenue
        .mockResolvedValueOnce([]) // collectionsByMonth
        .mockResolvedValueOnce([]); // marksBySubject

      const result = await service.getSchoolAdminDashboard(
        new Types.ObjectId().toString(),
      );

      expect(result.widgets.totalStudents).toBe(50);
      expect(result.widgets.totalTeachers).toBe(20);
      expect(result.widgets.totalClasses).toBe(10);
      expect(result.widgets.totalRevenue).toBe(500);
      expect(result.charts.attendanceRate).toBe(95);
    });
  });

  describe('getTeacherDashboard', () => {
    it('should return teacher stats', async () => {
      const teacherId = new Types.ObjectId();
      const schoolId = new Types.ObjectId();
      mockModel.findOne.mockResolvedValueOnce({
        _id: teacherId,
        schoolId,
      });

      mockModel.exec
        .mockResolvedValueOnce(new Array(3)) // myClasses
        .mockResolvedValueOnce([]) // assignments
        .mockResolvedValueOnce([]); // studentLeaves

      mockModel.countDocuments
        .mockResolvedValueOnce(100) // students
        .mockResolvedValueOnce(2); // exams

      const result = await service.getTeacherDashboard(
        new Types.ObjectId().toString(),
      );

      expect(result.widgets.myClasses).toBe(3);
      expect(result.widgets.totalStudents).toBe(100);
      expect(result.widgets.upcomingExams).toBe(2);
    });
  });

  describe('getStudentDashboard', () => {
    it('should return student stats', async () => {
      const studentId = new Types.ObjectId();
      const schoolId = new Types.ObjectId();

      mockModel.findOne.mockReturnValue(mockModel);
      mockModel.find.mockReturnValue(mockModel);

      mockModel.exec
        .mockResolvedValueOnce({
          _id: studentId,
          schoolId,
          class: { _id: new Types.ObjectId() },
        }) // student
        .mockResolvedValueOnce(new Array(10)) // myMarks
        .mockResolvedValueOnce([]) // exams
        .mockResolvedValueOnce([]) // invoices
        .mockResolvedValueOnce([]) // assignments
        .mockResolvedValueOnce([]); // submissions

      mockModel.countDocuments
        .mockResolvedValueOnce(200) // total attendance
        .mockResolvedValueOnce(180); // present

      const result = await service.getStudentDashboard(
        new Types.ObjectId().toString(),
      );

      expect(result.widgets.attendancePercentage).toBe(90);
      expect(result.widgets.totalMarksRecords).toBe(10);
    });
  });

  describe('getParentDashboard', () => {
    it('should return parent stats', async () => {
      const result = await service.getParentDashboard(
        new Types.ObjectId().toString(),
      );
      expect(result.widgets.childrenCount).toBe(1);
    });
  });
});
