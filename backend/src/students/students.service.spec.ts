import { Test, TestingModule } from '@nestjs/testing';
import { StudentsService } from './students.service';
import { getModelToken } from '@nestjs/mongoose';
import { Student } from './schemas/student.schema';

describe('StudentsService', () => {
  let service: StudentsService;
  const studentModel = {
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
        StudentsService,
        { provide: getModelToken(Student.name), useValue: studentModel },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create a student', async () => {
    const dto = { admissionNumber: 'A001', firstName: 'Test' };
    studentModel.create.mockResolvedValue(dto);

    const res = await service.create(dto as any);
    expect(res).toEqual(dto);
  });
});
