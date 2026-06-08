import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ParentsController } from '../src/parents/parents.controller';
import { ParentsService } from '../src/parents/parents.service';

import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';

describe('ParentsController (e2e)', () => {
  let app: INestApplication;
  
  const mockParentsService = {
    register: jest.fn(),
    linkChild: jest.fn(),
    getChildren: jest.fn(),
    getDashboard: jest.fn(),
    getChildAttendance: jest.fn(),
    getChildAcademic: jest.fn(),
    getChildFees: jest.fn(),
    getChildExams: jest.fn(),
    getNotifications: jest.fn(),
    getMessages: jest.fn(),
    sendMessage: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ParentsController],
      providers: [
        {
          provide: ParentsService,
          useValue: mockParentsService,
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
      req.user = { _id: '507f1f77bcf86cd799439011' };
      next();
    });
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /parents/register should register a parent', async () => {
    const dto = {
      email: 'parent@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };
    mockParentsService.register.mockResolvedValue({ _id: 'parent-id', email: dto.email, roleType: 'PARENT' });

    const response = await request(app.getHttpServer())
      .post('/parents/register')
      .send(dto);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ _id: 'parent-id', email: dto.email, roleType: 'PARENT' });
  });

  it('GET /parents/dashboard should return dashboard summaries', async () => {
    const dashboardData = {
      children: [],
      totalChildrenCount: 0,
    };
    mockParentsService.getDashboard.mockResolvedValue(dashboardData);

    const response = await request(app.getHttpServer())
      .get('/parents/dashboard');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(dashboardData);
  });

  it('GET /parents/children/:studentId/attendance should query child attendance logs', async () => {
    const attendanceLogs = { data: [], total: 0, page: 1, limit: 20 };
    mockParentsService.getChildAttendance.mockResolvedValue(attendanceLogs);

    const response = await request(app.getHttpServer())
      .get('/parents/children/child123/attendance')
      .query({ page: 1, limit: 20 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(attendanceLogs);
  });

  it('POST /parents/messages should dispatch a message', async () => {
    const msgDto = {
      recipientId: 'teacher123',
      subject: 'Sick note',
      content: 'Child is sick.',
    };
    const createdMsg = { _id: 'msg-id', senderId: 'parent-id', ...msgDto };
    mockParentsService.sendMessage.mockResolvedValue(createdMsg);

    const response = await request(app.getHttpServer())
      .post('/parents/messages')
      .send(msgDto);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(createdMsg);
  });
});
