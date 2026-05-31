import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { getModelToken } from '@nestjs/mongoose';
import { Course } from './schemas/course.schema';
import { Department } from '../departments/schemas/department.schema';

describe('CoursesService', () => {
  let service: CoursesService;
  const courseModel = {
    find: jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
  };
  const departmentModel = { findById: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: getModelToken(Course.name), useValue: courseModel },
        { provide: getModelToken(Department.name), useValue: departmentModel },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should throw when department does not exist', async () => {
    departmentModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    await expect(
      service.create({ department: 'd1', name: 'Course 1' } as any),
    ).rejects.toThrow('Department not found');
  });

  it('should create when department exists', async () => {
    departmentModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ id: 'd1' }),
    });
    courseModel.create.mockResolvedValue({
      department: 'd1',
      name: 'Course 1',
    });

    const res = await service.create({
      department: 'd1',
      name: 'Course 1',
    });
    expect(res).toEqual({ department: 'd1', name: 'Course 1' });
  });
});
