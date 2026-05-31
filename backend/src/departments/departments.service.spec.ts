import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsService } from './departments.service';
import { getModelToken } from '@nestjs/mongoose';
import { Department } from './schemas/department.schema';
import { School } from '../schools/schemas/school.schema';

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  const departmentModel = {
    find: jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
  };
  const schoolModel = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,
        { provide: getModelToken(Department.name), useValue: departmentModel },
        { provide: getModelToken(School.name), useValue: schoolModel },
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw when school does not exist', async () => {
    schoolModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(
      service.create({
        school: 'invalid',
        name: 'History',
        isActive: true,
      } as any),
    ).rejects.toThrow('School not found');
  });

  it('should create a department when school exists', async () => {
    schoolModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ id: '1' }),
    });
    departmentModel.create.mockResolvedValue({
      school: '1',
      name: 'History',
      isActive: true,
    });

    const result = await service.create({
      school: '1',
      name: 'History',
      isActive: true,
    });

    expect(result).toEqual({ school: '1', name: 'History', isActive: true });
    expect(schoolModel.findById).toHaveBeenCalledWith('1');
  });
});
