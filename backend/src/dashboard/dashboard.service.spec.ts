import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { getModelToken } from '@nestjs/mongoose';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const mockModel = {};
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getModelToken('Student'), useValue: mockModel },
        { provide: getModelToken('Attendance'), useValue: mockModel },
        { provide: getModelToken('Mark'), useValue: mockModel },
        { provide: getModelToken('Exam'), useValue: mockModel },
        { provide: getModelToken('Timetable'), useValue: mockModel },
        { provide: getModelToken('Invoice'), useValue: mockModel },
        { provide: getModelToken('Notification'), useValue: mockModel },
        { provide: getModelToken('Subject'), useValue: mockModel },
        { provide: getModelToken('AcademicYear'), useValue: mockModel },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});