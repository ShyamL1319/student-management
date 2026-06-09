import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsService } from './departments.service';
import { getModelToken } from '@nestjs/mongoose';
import { Department } from './schemas/department.schema';

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,
        { provide: getModelToken(Department.name), useValue: departmentModel },
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a department with auto-generated code and description', async () => {
    departmentModel.create.mockImplementation((dto) => Promise.resolve(dto));

    const result = await service.create({
      name: 'Computer Science',
      description: 'Department of CS',
      isActive: true,
    });

    expect(result).toEqual({
      name: 'Computer Science',
      code: 'COMP',
      description: 'Department of CS',
      isActive: true,
    });
  });

  it('should create a department with custom code and description', async () => {
    departmentModel.create.mockImplementation((dto) => Promise.resolve(dto));

    const result = await service.create({
      name: 'Mechanical Engineering',
      code: 'MECH-ENG',
      description: 'Department of ME',
      isActive: true,
    });

    expect(result).toEqual({
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
        exec: jest.fn().mockResolvedValue({
          ...existingDept,
          name: 'New Civil',
          code: 'NEWCIV',
          description: 'New Description',
        }),
      });

      const result = await service.update('dep1', {
        name: 'New Civil',
        code: 'NEWCIV',
        description: 'New Description',
      });

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
