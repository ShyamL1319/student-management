import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AssignmentsController } from '../src/assignments/assignments.controller';
import { AssignmentsService } from '../src/assignments/assignments.service';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { RoleEnum } from '../src/common/enums/role.enum';
import { Types } from 'mongoose';

describe('AssignmentsController (e2e)', () => {
  let app: INestApplication;

  const mockAssignmentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    publish: jest.fn(),
    submit: jest.fn(),
    grade: jest.fn(),
    bulkGrade: jest.fn(),
    getSubmissions: jest.fn(),
    getAnalytics: jest.fn(),
    generatePresignedUploadUrl: jest.fn(),
  };

  const mockUser = {
    _id: new Types.ObjectId().toString(),
    school: new Types.ObjectId().toString(),
    schoolId: new Types.ObjectId().toString(),
    roleType: RoleEnum.TEACHER,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AssignmentsController],
      providers: [
        {
          provide: AssignmentsService,
          useValue: mockAssignmentsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();

    // Inject mock authenticated user into request object
    app.use((req: any, res: any, next: any) => {
      req.user = mockUser;
      next();
    });

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /assignments should create an assignment', async () => {
    const dto = {
      title: 'DADA Homework 1',
      description: 'Practice wand motions',
      subjectId: new Types.ObjectId().toString(),
      classId: new Types.ObjectId().toString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      maxMarks: 100,
      isPublished: false,
    };

    mockAssignmentsService.create.mockResolvedValue({
      _id: 'assignment-id',
      ...dto,
    });

    const response = await request(app.getHttpServer())
      .post('/assignments')
      .send(dto);

    expect(response.status).toBe(201);
    expect(response.body._id).toBe('assignment-id');
    expect(response.body.title).toBe(dto.title);
  });

  it('GET /assignments should list assignments', async () => {
    const mockList = { data: [{ title: 'DADA Homework 1' }], total: 1 };
    mockAssignmentsService.findAll.mockResolvedValue(mockList);

    const response = await request(app.getHttpServer())
      .get('/assignments')
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.data[0].title).toBe('DADA Homework 1');
  });

  it('POST /assignments/:id/submit should submit work', async () => {
    const assignmentId = new Types.ObjectId().toString();
    const submitDto = {
      fileUrl: 'https://s3.com/submissions/potter.pdf',
      fileName: 'potter.pdf',
      fileSize: 1024,
    };

    mockAssignmentsService.submit.mockResolvedValue({
      _id: 'submission-id',
      assignment: assignmentId,
      fileUrl: submitDto.fileUrl,
      fileName: submitDto.fileName,
      fileSize: submitDto.fileSize,
      status: 'Submitted',
    });

    const response = await request(app.getHttpServer())
      .post(`/assignments/${assignmentId}/submit`)
      .send(submitDto);

    expect(response.status).toBe(201);
    expect(response.body._id).toBe('submission-id');
    expect(response.body.status).toBe('Submitted');
  });

  it('PATCH /assignments/submissions/:submissionId/grade should grade submission', async () => {
    const submissionId = new Types.ObjectId().toString();
    const gradeDto = {
      marksObtained: 85,
      feedback: 'Excellent structure!',
    };

    mockAssignmentsService.grade.mockResolvedValue({
      _id: submissionId,
      marksObtained: 85,
      feedback: 'Excellent structure!',
      status: 'Graded',
    });

    const response = await request(app.getHttpServer())
      .patch(`/assignments/submissions/${submissionId}/grade`)
      .send(gradeDto);

    expect(response.status).toBe(200);
    expect(response.body.marksObtained).toBe(85);
    expect(response.body.status).toBe('Graded');
  });

  it('POST /assignments/:id/submissions/bulk-grade should perform bulk evaluation', async () => {
    const assignmentId = new Types.ObjectId().toString();
    const bulkDto = {
      grades: [
        {
          submissionId: new Types.ObjectId().toString(),
          marksObtained: 95,
          feedback: 'Outstanding!',
        },
      ],
    };

    mockAssignmentsService.bulkGrade.mockResolvedValue({
      results: [
        {
          submissionId: bulkDto.grades[0].submissionId,
          status: 'Success',
          id: 'sub-id-1',
        },
      ],
    });

    const response = await request(app.getHttpServer())
      .post(`/assignments/${assignmentId}/submissions/bulk-grade`)
      .send(bulkDto);

    expect(response.status).toBe(201); // In NestJS, POST defaults to 201 unless overriden by @HttpCode
    expect(response.body.results[0].status).toBe('Success');
  });
});
