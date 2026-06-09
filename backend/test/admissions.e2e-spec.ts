import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AdmissionsController } from '../src/admissions/admissions.controller';
import { AdmissionsService } from '../src/admissions/admissions.service';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { AdmissionStage } from '../src/admissions/schemas/admission.schema';

describe('AdmissionsController (e2e)', () => {
  let app: INestApplication;

  const mockAdmissionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
    scheduleInterview: jest.fn(),
    evaluate: jest.fn(),
    enroll: jest.fn(),
    getAnalytics: jest.fn(),
    getReport: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AdmissionsController],
      providers: [
        {
          provide: AdmissionsService,
          useValue: mockAdmissionsService,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

    app = moduleFixture.createNestApplication();
    app.use((req: any, res: any, next: any) => {
      req.user = {
        _id: '507f1f77bcf86cd799439011',
        schoolId: '507f1f77bcf86cd799439012',
      };
      next();
    });
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /admissions/apply should submit public application', async () => {
    const dto = {
      studentInfo: {
        firstName: 'Alice',
        lastName: 'Smith',
        dob: '2018-05-15',
        gender: 'Female',
        address: '123 Main St',
      },
      parentInfo: {
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob@example.com',
        phone: '1234567890',
        relationship: 'Father',
      },
      gradeLevel: 'Grade 6',
    };

    mockAdmissionsService.create.mockResolvedValue({
      _id: 'app-id-123',
      ...dto,
      status: AdmissionStage.SUBMITTED,
    });

    const response = await request(app.getHttpServer())
      .post('/admissions/apply')
      .query({ schoolId: '507f1f77bcf86cd799439012' })
      .send(dto);

    expect(response.status).toBe(201);
    expect(response.body._id).toBe('app-id-123');
    expect(response.body.status).toBe(AdmissionStage.SUBMITTED);
  });

  it('GET /admissions should list applications', async () => {
    mockAdmissionsService.findAll.mockResolvedValue({
      data: [{ _id: 'app-id', gradeLevel: 'Grade 6', status: AdmissionStage.SUBMITTED }],
      total: 1,
    });

    const response = await request(app.getHttpServer()).get('/admissions');

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.data[0].gradeLevel).toBe('Grade 6');
  });

  it('GET /admissions/analytics should return analytics data', async () => {
    const analytics = {
      totalApplications: 10,
      byStatus: { Submitted: 10 },
      conversionRates: { enrollmentRate: 0 },
    };
    mockAdmissionsService.getAnalytics.mockResolvedValue(analytics);

    const response = await request(app.getHttpServer()).get('/admissions/analytics');

    expect(response.status).toBe(200);
    expect(response.body.totalApplications).toBe(10);
  });

  it('GET /admissions/report should return report data', async () => {
    mockAdmissionsService.getReport.mockResolvedValue([
      { applicationId: 'app-id', studentName: 'Alice Smith', status: AdmissionStage.SUBMITTED },
    ]);

    const response = await request(app.getHttpServer()).get('/admissions/report');

    expect(response.status).toBe(200);
    expect(response.body[0].studentName).toBe('Alice Smith');
  });

  it('POST /admissions/:id/schedule should schedule interview', async () => {
    const scheduleDto = {
      scheduledDate: '2026-07-01',
      scheduledTime: '10:00 AM',
      interviewMode: 'Online',
    };

    mockAdmissionsService.scheduleInterview.mockResolvedValue({
      _id: 'app-id',
      status: AdmissionStage.INTERVIEW,
      interviewDetails: scheduleDto,
    });

    const response = await request(app.getHttpServer())
      .post('/admissions/app-id/schedule')
      .send(scheduleDto);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe(AdmissionStage.INTERVIEW);
  });

  it('POST /admissions/:id/evaluate should record scores', async () => {
    const evalDto = {
      documentScore: 8,
      interviewScore: 9,
      entranceScore: 85,
      evaluationRemarks: 'Strong candidate',
    };

    mockAdmissionsService.evaluate.mockResolvedValue({
      _id: 'app-id',
      status: AdmissionStage.EVALUATION,
      scoring: { ...evalDto, totalScore: 102 },
    });

    const response = await request(app.getHttpServer())
      .post('/admissions/app-id/evaluate')
      .send(evalDto);

    expect(response.status).toBe(201);
    expect(response.body.scoring.totalScore).toBe(102);
  });

  it('POST /admissions/:id/enroll should finalize enrollment', async () => {
    mockAdmissionsService.enroll.mockResolvedValue({
      _id: 'app-id',
      status: AdmissionStage.ENROLLMENT,
      createdStudentId: 'student-id-123',
    });

    const response = await request(app.getHttpServer())
      .post('/admissions/app-id/enroll');

    expect(response.status).toBe(201);
    expect(response.body.status).toBe(AdmissionStage.ENROLLMENT);
    expect(response.body.createdStudentId).toBe('student-id-123');
  });
});
