import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SearchService } from './search.service';
import { User } from '../users/schemas/user.schema';

describe('SearchService', () => {
  let service: SearchService;

  const mockUsers = [
    {
      _id: 'user1',
      firstName: 'John',
      lastName: 'Smith',
      roleType: 'STUDENT',
      email: 'john.smith@example.com',
      rollNumber: '101',
    },
    {
      _id: 'user2',
      firstName: 'Jonathan',
      lastName: 'Doe',
      roleType: 'TEACHER',
      email: 'j.doe@example.com',
    },
  ];

  const mockQueryChain = {
    select: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(mockUsers),
  };

  const mockUserModel = {
    find: jest.fn().mockReturnValue(mockQueryChain),
  };

  beforeEach(async () => {
    mockUserModel.find.mockClear();
    mockQueryChain.select.mockClear();
    mockQueryChain.limit.mockClear();
    mockQueryChain.lean.mockClear();
    mockQueryChain.exec.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSuggestions', () => {
    it('should return empty results if query is empty', async () => {
      const result = await service.getSuggestions('   ');
      expect(result).toEqual({ results: [] });
      expect(mockUserModel.find).not.toHaveBeenCalled();
    });

    it('should query with single term filter when query has one word', async () => {
      mockQueryChain.exec.mockResolvedValueOnce([
        {
          _id: 'user1',
          firstName: 'John',
          lastName: 'Smith',
          roleType: 'STUDENT',
          rollNumber: '101',
        },
      ]);

      const result = await service.getSuggestions('John');

      expect(mockUserModel.find).toHaveBeenCalledWith({
        $or: [
          { firstName: { $regex: '^John', $options: 'i' } },
          { lastName: { $regex: '^John', $options: 'i' } },
          { email: { $regex: '^John', $options: 'i' } },
        ],
      });
      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toEqual({
        id: 'user1',
        label: 'John Smith (Roll No: 101)',
        type: 'student',
      });
    });

    it('should query with multi-term filters when query has two words', async () => {
      mockQueryChain.exec.mockResolvedValueOnce([
        {
          _id: 'user2',
          firstName: 'Jonathan',
          lastName: 'Doe',
          roleType: 'TEACHER',
          email: 'j.doe@example.com',
        },
      ]);

      const result = await service.getSuggestions('Jon Doe');

      expect(mockUserModel.find).toHaveBeenCalledWith({
        firstName: { $regex: '^Jon', $options: 'i' },
        lastName: { $regex: '^Doe', $options: 'i' },
      });
      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toEqual({
        id: 'user2',
        label: 'Jonathan Doe (j.doe@example.com)',
        type: 'teacher',
      });
    });

    it('should escape special regex characters in the query', async () => {
      await service.getSuggestions('Jo.n*');
      expect(mockUserModel.find).toHaveBeenCalledWith({
        $or: [
          { firstName: { $regex: '^Jo\\.n\\*', $options: 'i' } },
          { lastName: { $regex: '^Jo\\.n\\*', $options: 'i' } },
          { email: { $regex: '^Jo\\.n\\*', $options: 'i' } },
        ],
      });
    });
  });
});
