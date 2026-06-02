import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ReportsService } from './reports.service';
import { Student } from '../students/schemas/student.schema';
import { Teacher } from '../teachers/schemas/teacher.schema';
import { Attendance } from '../attendances/schemas/attendance.schema';
import { Exam } from '../examinations/schemas/exam.schema';
import { Mark } from '../marks/schemas/mark.schema';
import { FeesReportService } from '../fees/fees-report.service';

describe('ReportsService', () => {
  let service: ReportsService;

  const mockModel = {
    find: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue([]),
  };

  const mockFeesReportService = {
    generateCollectionReport: jest.fn().mockResolvedValue({ details: [] }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: getModelToken(Student.name), useValue: mockModel },
        { provide: getModelToken(Teacher.name), useValue: mockModel },
        { provide: getModelToken(Attendance.name), useValue: mockModel },
        { provide: getModelToken(Exam.name), useValue: mockModel },
        { provide: getModelToken(Mark.name), useValue: mockModel },
        { provide: FeesReportService, useValue: mockFeesReportService },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('exportStudentReport', () => {
    it('should generate an excel buffer for student report', async () => {
      const buffer = await service.exportStudentReport('excel', {});
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should generate a pdf buffer for student report', async () => {
      const buffer = await service.exportStudentReport('pdf', {});
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe('exportTeacherReport', () => {
    it('should generate an excel buffer for teacher report', async () => {
      const buffer = await service.exportTeacherReport('excel', {});
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe('exportFeeReport', () => {
    it('should call feesReportService and return a buffer', async () => {
      const buffer = await service.exportFeeReport('excel', {});
      expect(mockFeesReportService.generateCollectionReport).toHaveBeenCalled();
      expect(buffer).toBeInstanceOf(Buffer);
    });
  });
});
