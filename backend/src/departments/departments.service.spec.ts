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

  it('should create a department with auto-generated code and description when school exists', async () => {
    schoolModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ id: '1' }),
    });
    departmentModel.create.mockImplementation((dto) => Promise.resolve(dto));

    const result = await service.create({
      school: '1',
      name: 'Computer Science',
      description: 'Department of CS',
      isActive: true,
    } as any);

    expect(result).toEqual({
      school: '1',
      name: 'Computer Science',
      code: 'COMP',
      description: 'Department of CS',
      isActive: true,
    });
    expect(schoolModel.findById).toHaveBeenCalledWith('1');
  });

  it('should create a department with custom code and description', async () => {
    schoolModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ id: '1' }),
    });
    departmentModel.create.mockImplementation((dto) => Promise.resolve(dto));

    const result = await service.create({
      school: '1',
      name: 'Mechanical Engineering',
      code: 'MECH-ENG',
      description: 'Department of ME',
      isActive: true,
    } as any);

    expect(result).toEqual({
      school: '1',
      name: 'Mechanical Engineering',
      code: 'MECH-ENG',
      description: 'Department of ME',
      isActive: true,
    });
  });

  describe('update', () => {
    it('should update department and modify description and code', async () => {
      const existingDept = {
        _id: 'dep1',
        school: '1',
        name: 'Civil Engineering',
        code: 'CIVI',
        description: 'Old Description',
        isActive: true,
      };

      departmentModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(existingDept),
        }),
      });

      departmentModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            ...existingDept,
            name: 'New Civil',
            code: 'NEWCIV',
            description: 'New Description',
          }),
        }),
      });

      const result = await service.update('dep1', {
        name: 'New Civil',
        code: 'NEWCIV',
        description: 'New Description',
      } as any);

      expect(result.description).toBe('New Description');
      expect(result.code).toBe('NEWCIV');
      expect(departmentModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'dep1',
        {
          name: 'New Civil',
          code: 'NEWCIV',
          description: 'New Description',
        },
        { new: true },
      );
    });
  });
});
