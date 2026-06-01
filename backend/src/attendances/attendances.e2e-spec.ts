import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AttendancesController } from './attendances.controller';
import { AttendancesService } from './attendances.service';
import { AttendanceType, AttendanceStatus } from './schemas/attendance.schema';

describe('Attendances (e2e)', () => {
  let app: INestApplication;
  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getDailyReport: jest.fn(),
    getMonthlyReport: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AttendancesController],
      providers: [{ provide: AttendancesService, useValue: mockService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  it('POST /attendances should create a record', async () => {
    const createDto = {
      attendeeType: AttendanceType.STUDENT,
      attendeeId: '507f1f77bcf86cd799439011',
      date: '2026-06-01',
      status: AttendanceStatus.PRESENT,
    };
    mockService.create.mockResolvedValue({ _id: 'new-id', ...createDto });

    const response = await request(app.getHttpServer())
      .post('/attendances')
      .send(createDto);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ _id: 'new-id', ...createDto });
  });

  it('GET /attendances should return list', async () => {
    const responseData = { data: [], total: 0 };
    mockService.findAll.mockResolvedValue(responseData);

    const response = await request(app.getHttpServer())
      .get('/attendances')
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(responseData);
  });
});
