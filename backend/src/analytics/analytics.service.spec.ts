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

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  const mockModel = {
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
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
      mockModel.countDocuments
        .mockResolvedValueOnce(50) // students
        .mockResolvedValueOnce(20) // teachers
        .mockResolvedValueOnce(10); // classes
      mockModel.aggregate.mockResolvedValueOnce([{ totalAmount: 500 }]);

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
        school: schoolId,
      });

      mockModel.countDocuments
        .mockResolvedValueOnce(3) // classes
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
      mockModel.findOne.mockResolvedValueOnce({ _id: studentId });

      mockModel.countDocuments
        .mockResolvedValueOnce(200) // total attendance
        .mockResolvedValueOnce(180) // present
        .mockResolvedValueOnce(10); // marks

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
