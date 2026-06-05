import { Test, TestingModule } from '@nestjs/testing';
import { StudentsService } from './students.service';
import { getModelToken } from '@nestjs/mongoose';
import { Student } from './schemas/student.schema';
import { CounterService } from '../common/services/counter.service';

describe('StudentsService', () => {
  let service: StudentsService;
  const studentModel = {
    find: jest.fn().mockReturnThis(),
    countDocuments: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    findByIdAndDelete: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    create: jest.fn(),
    db: {
      model: jest.fn().mockImplementation((name: string) => {
        if (name === 'Role') {
          return {
            findOne: jest.fn().mockResolvedValue({ _id: 'mockRoleId' }),
          };
        }
        if (name === 'AcademicYear') {
          return {
            findOne: jest.fn().mockResolvedValue({ _id: 'mockAcademicYearId' }),
          };
        }
        return {};
      }),
    },
  };

  const mockCounterService = {
    generateAdmissionNumber: jest.fn().mockResolvedValue('ADM-2026-000001'),
    generateRollNumber: jest.fn().mockResolvedValue('ROLL-class-000001'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: getModelToken(Student.name), useValue: studentModel },
        { provide: CounterService, useValue: mockCounterService },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create a student', async () => {
    const dto = { firstName: 'Test', class: 'mockClassId' };
    const expectedCreated = {
      ...dto,
      admissionNumber: 'ADM-2026-000001',
      rollNumber: 'ROLL-class-000001',
      role: 'mockRoleId',
      passwordHash: expect.any(String),
    };
    studentModel.create.mockResolvedValue(expectedCreated);

    const res = await service.create(dto as any);
    expect(res).toEqual(expectedCreated);
    expect(mockCounterService.generateAdmissionNumber).toHaveBeenCalled();
    expect(mockCounterService.generateRollNumber).toHaveBeenCalledWith('mockClassId', 'mockAcademicYearId');
    expect(studentModel.create).toHaveBeenCalledWith(expect.objectContaining({
      firstName: 'Test',
      admissionNumber: 'ADM-2026-000001',
      rollNumber: 'ROLL-class-000001',
    }));
  });
});
