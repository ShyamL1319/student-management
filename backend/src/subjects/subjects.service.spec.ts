import { Test, TestingModule } from '@nestjs/testing';
import { SubjectsService } from './subjects.service';
import { getModelToken } from '@nestjs/mongoose';
import { Subject } from './schemas/subject.schema';
import { Course } from '../courses/schemas/course.schema';
import { Teacher } from '../teachers/schemas/teacher.schema';

describe('SubjectsService', () => {
  let service: SubjectsService;
  const subjectModel = {
    find: jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
  };
  const courseModel = { findById: jest.fn() };
  const teacherModel = { countDocuments: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectsService,
        { provide: getModelToken(Subject.name), useValue: subjectModel },
        { provide: getModelToken(Course.name), useValue: courseModel },
        { provide: getModelToken(Teacher.name), useValue: teacherModel },
      ],
    }).compile();

    service = module.get<SubjectsService>(SubjectsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should throw when course not found', async () => {
    courseModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    await expect(
      service.create({ name: 'Sub 1', course: 'c1' } as any),
    ).rejects.toThrow('Course not found');
  });

  it('should throw when teacher missing', async () => {
    courseModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ id: 'c1' }),
    });
    teacherModel.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(0),
    });
    await expect(
      service.create({ name: 'Sub 1', teachers: ['t1'] } as any),
    ).rejects.toThrow('One or more teachers not found');
  });
});
