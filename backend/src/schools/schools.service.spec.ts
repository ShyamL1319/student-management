import { Test, TestingModule } from '@nestjs/testing';
import { SchoolsService } from './schools.service';
import { getModelToken } from '@nestjs/mongoose';
import { School } from './schemas/school.schema';

describe('SchoolsService', () => {
  let service: SchoolsService;
  const schoolModel = {
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
        SchoolsService,
        { provide: getModelToken(School.name), useValue: schoolModel },
      ],
    }).compile();

    service = module.get<SchoolsService>(SchoolsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a school', async () => {
    const dto = {
      name: 'Test School',
      address: '123 Main',
      phone: '555-1234',
      email: 'test@example.com',
      isActive: true,
    };
    schoolModel.create.mockResolvedValue(dto);

    const result = await service.create(dto);

    expect(result).toEqual(dto);
    expect(schoolModel.create).toHaveBeenCalledWith(dto);
  });

  it('should paginate schools', async () => {
    const response = [{ name: 'Test' }];
    const query = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(response),
    };
    schoolModel.find.mockReturnValue(query);
    schoolModel.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(1),
    });

    const result = await service.findAll({
      page: 1,
      limit: 10,
      search: 'Test',
    });

    expect(result.data).toEqual(response);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it('should return a school by id', async () => {
    const item = { id: '1', name: 'Test School' };
    schoolModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(item),
    });

    const result = await service.findOne('1');
    expect(result).toEqual(item);
  });
});
