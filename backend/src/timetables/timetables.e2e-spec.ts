import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TimetablesController } from './timetables.controller';
import { TimetablesService } from './timetables.service';
import { DayOfWeek } from './schemas/timetable.schema';

describe('Timetables (e2e)', () => {
  let app: INestApplication;
  let timetablesService: TimetablesService;

  const mockTimetableService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getClassTimetable: jest.fn(),
    getWeeklyTimetable: jest.fn(),
    getTeacherTimetable: jest.fn(),
    detectConflicts: jest.fn(),
    bulkCreate: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TimetablesController],
      providers: [
        {
          provide: TimetablesService,
          useValue: mockTimetableService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    timetablesService = moduleFixture.get<TimetablesService>(TimetablesService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /timetables', () => {
    it('should create a timetable entry', async () => {
      const createDto = {
        class: '507f1f77bcf86cd799439011',
        academicYear: '507f1f77bcf86cd799439012',
        teacher: '507f1f77bcf86cd799439013',
        subject: '507f1f77bcf86cd799439014',
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '09:00',
        endTime: '10:00',
        room: 'Room 101',
      };

      const result = { _id: 'new-id', ...createDto };
      mockTimetableService.create.mockResolvedValue(result);

      const response = await request(app.getHttpServer())
        .post('/timetables')
        .send(createDto);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(result);
    });

    it('should return 400 for invalid data', async () => {
      const invalidDto = {
        class: '507f1f77bcf86cd799439011',
        dayOfWeek: 'INVALID_DAY',
        startTime: 'invalid',
      };

      await request(app.getHttpServer())
        .post('/timetables')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /timetables', () => {
    it('should return paginated timetables', async () => {
      const mockData = {
        data: [
          {
            _id: '507f1f77bcf86cd799439015',
            class: { name: 'Class A' },
          },
        ],
        total: 1,
      };

      mockTimetableService.findAll.mockResolvedValue(mockData);

      const response = await request(app.getHttpServer())
        .get('/timetables')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });
  });

  describe('GET /timetables/:id', () => {
    it('should return timetable by id', async () => {
      const mockData = {
        _id: '507f1f77bcf86cd799439015',
        class: { name: 'Class A' },
      };

      mockTimetableService.findOne.mockResolvedValue(mockData);

      const response = await request(app.getHttpServer()).get(
        '/timetables/507f1f77bcf86cd799439015',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });

    it('should return 404 if timetable not found', async () => {
      mockTimetableService.findOne.mockRejectedValue(
        new Error('Timetable not found'),
      );

      await request(app.getHttpServer())
        .get('/timetables/invalid-id')
        .expect(500);
    });
  });

  describe('PATCH /timetables/:id', () => {
    it('should update timetable', async () => {
      const updateDto = {
        room: 'Room 102',
      };

      const result = {
        _id: '507f1f77bcf86cd799439015',
        ...updateDto,
      };

      mockTimetableService.update.mockResolvedValue(result);

      const response = await request(app.getHttpServer())
        .patch('/timetables/507f1f77bcf86cd799439015')
        .send(updateDto);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(result);
    });
  });

  describe('DELETE /timetables/:id', () => {
    it('should delete timetable', async () => {
      mockTimetableService.remove.mockResolvedValue({
        _id: '507f1f77bcf86cd799439015',
      });

      const response = await request(app.getHttpServer()).delete(
        '/timetables/507f1f77bcf86cd799439015',
      );

      expect(response.status).toBe(204);
    });
  });

  describe('GET /timetables/class/:classId/weekly', () => {
    it('should return weekly timetable', async () => {
      const mockData = {
        MONDAY: [{ startTime: '09:00', endTime: '10:00' }],
        TUESDAY: [],
      };

      mockTimetableService.getWeeklyTimetable.mockResolvedValue(mockData);

      const response = await request(app.getHttpServer()).get(
        '/timetables/class/507f1f77bcf86cd799439011/weekly',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });
  });

  describe('GET /timetables/class/:classId', () => {
    it('should return class timetable', async () => {
      const mockData = [
        {
          _id: '507f1f77bcf86cd799439015',
          dayOfWeek: DayOfWeek.MONDAY,
          startTime: '09:00',
        },
      ];

      mockTimetableService.getClassTimetable.mockResolvedValue(mockData);

      const response = await request(app.getHttpServer()).get(
        '/timetables/class/507f1f77bcf86cd799439011',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });
  });

  describe('GET /timetables/teacher/:teacherId', () => {
    it('should return teacher timetable', async () => {
      const mockData = [
        {
          _id: '507f1f77bcf86cd799439015',
          dayOfWeek: DayOfWeek.MONDAY,
          class: { name: 'Class A' },
        },
      ];

      mockTimetableService.getTeacherTimetable.mockResolvedValue(mockData);

      const response = await request(app.getHttpServer()).get(
        '/timetables/teacher/507f1f77bcf86cd799439013',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });
  });

  describe('POST /timetables/check-conflict', () => {
    it('should detect conflicts', async () => {
      const checkDto = {
        teacher: '507f1f77bcf86cd799439013',
        class: '507f1f77bcf86cd799439011',
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: '09:00',
        endTime: '10:00',
      };

      const result = {
        hasConflict: true,
        conflicts: [
          {
            timetableId: '507f1f77bcf86cd799439016',
            class: 'Class A',
            teacher: 'John Doe',
            subject: 'Math',
            startTime: '09:00',
            endTime: '10:00',
            dayOfWeek: 'MONDAY',
            conflictType: 'TEACHER_DOUBLE_BOOKING',
          },
        ],
      };

      mockTimetableService.detectConflicts.mockResolvedValue(result);

      const response = await request(app.getHttpServer())
        .post('/timetables/check-conflict')
        .send(checkDto);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(result);
    });
  });

  describe('POST /timetables/bulk-create', () => {
    it('should bulk create timetables', async () => {
      const bulkDto = [
        {
          class: '507f1f77bcf86cd799439011',
          academicYear: '507f1f77bcf86cd799439012',
          teacher: '507f1f77bcf86cd799439013',
          subject: '507f1f77bcf86cd799439014',
          dayOfWeek: DayOfWeek.MONDAY,
          startTime: '09:00',
          endTime: '10:00',
        },
      ];

      const result = [{ _id: 'new-id', ...bulkDto[0] }];
      mockTimetableService.bulkCreate.mockResolvedValue(result);

      const response = await request(app.getHttpServer())
        .post('/timetables/bulk-create')
        .send(bulkDto);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(result);
    });
  });
});
