import { Test, TestingModule } from '@nestjs/testing';
import { TeachersService } from './teachers.service';
import { getModelToken } from '@nestjs/mongoose';
import { Teacher } from './schemas/teacher.schema';

describe('TeachersService', () => {
  let service: TeachersService;
  const teacherModel = {
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
        TeachersService,
        { provide: getModelToken(Teacher.name), useValue: teacherModel },
      ],
    }).compile();

    service = module.get<TeachersService>(TeachersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create a teacher', async () => {
    const dto = { name: 'John Doe' };
    teacherModel.create.mockResolvedValue(dto);

    const res = await service.create(dto as any);
    expect(res).toEqual(dto);
    expect(teacherModel.create).toHaveBeenCalledWith(dto);
  });

  it('should return a teacher by id', async () => {
    const item = { id: '1', name: 'John' };
    teacherModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(item),
    });

    const res = await service.findOne('1');
    expect(res).toEqual(item);
  });
});
