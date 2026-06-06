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
    db: {
      model: jest.fn().mockReturnValue({
        findOne: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue({ _id: 'mockRoleId' }),
          }),
        }),
      }),
    },
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
    const dto = { firstName: 'Staff', lastName: 'One' };
    const created = { firstName: 'Staff', lastName: 'One', role: 'mockRoleId', roleType: 'STAFF' };
    staffModel.create.mockResolvedValue(created);

    const res = await service.create(dto as any);
    expect(res).toEqual(created);
    expect(staffModel.create).toHaveBeenCalledWith(expect.objectContaining({
      firstName: 'Staff',
      lastName: 'One',
      role: 'mockRoleId',
      roleType: 'STAFF',
      passwordHash: expect.any(String),
    }));
  });
});
