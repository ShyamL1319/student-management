import { Test, TestingModule } from '@nestjs/testing';
import { ExaminationsService } from './examinations.service';
import { getModelToken } from '@nestjs/mongoose';
import { Exam } from './schemas/exam.schema';

describe('ExaminationsService', () => {
  let service: ExaminationsService;
  const examModel = {
    find: jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExaminationsService,
        { provide: getModelToken(Exam.name), useValue: examModel },
      ],
    }).compile();

    service = module.get<ExaminationsService>(ExaminationsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create an exam', async () => {
    examModel.create.mockResolvedValue({ name: 'Mid Term', type: 'MID_TERM' });
    const res = await service.create({ name: 'Mid Term', type: 'MID_TERM' } as any);
    expect(res).toEqual({ name: 'Mid Term', type: 'MID_TERM' });
  });
});
