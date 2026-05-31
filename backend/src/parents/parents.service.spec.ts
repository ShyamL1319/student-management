import { Test, TestingModule } from '@nestjs/testing';
import { ParentsService } from './parents.service';
import { getModelToken } from '@nestjs/mongoose';
import { Parent } from './schemas/parent.schema';

describe('ParentsService', () => {
  let service: ParentsService;
  const parentModel = {
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
        ParentsService,
        { provide: getModelToken(Parent.name), useValue: parentModel },
      ],
    }).compile();

    service = module.get<ParentsService>(ParentsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create a parent', async () => {
    const dto = { name: 'Parent One' };
    parentModel.create.mockResolvedValue(dto);

    const res = await service.create(dto as any);
    expect(res).toEqual(dto);
  });
});
