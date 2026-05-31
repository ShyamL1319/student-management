import { Test, TestingModule } from '@nestjs/testing';
import { StaffService } from './staff.service';
import { getModelToken } from '@nestjs/mongoose';
import { Staff } from './schemas/staff.schema';

describe('StaffService', () => {
  let service: StaffService;
  const staffModel = {
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
        StaffService,
        { provide: getModelToken(Staff.name), useValue: staffModel },
      ],
    }).compile();

    service = module.get<StaffService>(StaffService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create a staff', async () => {
    const dto = { name: 'Staff One' };
    staffModel.create.mockResolvedValue(dto);

    const res = await service.create(dto as any);
    expect(res).toEqual(dto);
  });
});
