import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserInstance = {
    _id: 'targetUserId',
    role: { _id: 'currentRoleId', name: 'STUDENT' },
    roleType: 'STUDENT',
    save: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
  };

  const mockUserModel = {
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    countDocuments: jest.fn().mockReturnThis(),
    exec: jest.fn().mockImplementation(() => mockUserInstance),
    db: {
      model: jest.fn().mockImplementation((name: string) => {
        if (name === 'Role') {
          return {
            findById: jest.fn().mockImplementation((roleId: string) => {
              let name = 'STUDENT';
              if (roleId === 'superAdminRoleId') name = 'SUPER_ADMIN';
              if (roleId === 'adminRoleId') name = 'ADMIN';
              return {
                exec: jest.fn().mockResolvedValue({ _id: roleId, name }),
              };
            }),
          };
        }
        return {};
      }),
    },
  };

  beforeEach(async () => {
    mockUserInstance.role = { _id: 'currentRoleId', name: 'STUDENT' };
    mockUserInstance.roleType = 'STUDENT';
    mockUserInstance.save.mockClear();
    mockUserInstance.populate.mockClear();
    mockUserModel.findByIdAndUpdate.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateUserRole', () => {
    it('should successfully update role if target role is not SUPER_ADMIN and current is not SUPER_ADMIN', async () => {
      const requester = { roleType: 'ADMIN' };
      await service.updateUserRole('targetUserId', 'adminRoleId', requester);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'targetUserId',
        { roleType: 'ADMIN', roles: ['adminRoleId'] },
        { new: true },
      );
    });

    it('should throw ForbiddenException if requester is not SUPER_ADMIN and target role is SUPER_ADMIN', async () => {
      const requester = { roleType: 'ADMIN' };
      await expect(
        service.updateUserRole('targetUserId', 'superAdminRoleId', requester),
      ).rejects.toThrow(ForbiddenException);
      expect(mockUserModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if requester is not SUPER_ADMIN and current role is SUPER_ADMIN', async () => {
      mockUserInstance.role = { _id: 'superAdminRoleId', name: 'SUPER_ADMIN' };
      mockUserInstance.roleType = 'SUPER_ADMIN';

      const requester = { roleType: 'ADMIN' };
      await expect(
        service.updateUserRole('targetUserId', 'adminRoleId', requester),
      ).rejects.toThrow(ForbiddenException);
      expect(mockUserModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should successfully update role to SUPER_ADMIN if requester is SUPER_ADMIN', async () => {
      const requester = { roleType: 'SUPER_ADMIN' };
      await service.updateUserRole(
        'targetUserId',
        'superAdminRoleId',
        requester,
      );
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'targetUserId',
        {
          roleType: 'SUPER_ADMIN',
          roles: ['superAdminRoleId'],
        },
        { new: true },
      );
    });
  });

  describe('findAll', () => {
    it('should return all users as array if no query parameters provided', async () => {
      mockUserModel.exec.mockResolvedValueOnce([mockUserInstance]);

      const result = await service.findAll();

      expect(mockUserModel.find).toHaveBeenCalledWith();
      expect(result).toEqual([mockUserInstance]);
    });

    it('should query with pagination and search parameters if provided', async () => {
      mockUserModel.exec.mockResolvedValueOnce([mockUserInstance]);
      mockUserModel.exec.mockResolvedValueOnce(5);

      const query = { page: '2', limit: '5', search: 'John' };
      const result = await service.findAll(query);

      expect(mockUserModel.find).toHaveBeenCalledWith({
        $or: [
          { firstName: { $regex: '^John', $options: 'i' } },
          { lastName: { $regex: '^John', $options: 'i' } },
          { email: { $regex: '^John', $options: 'i' } },
          { roleType: { $regex: '^John', $options: 'i' } },
        ],
      });
      expect(mockUserModel.skip).toHaveBeenCalledWith(5);
      expect(mockUserModel.limit).toHaveBeenCalledWith(5);
      expect(result).toEqual({
        data: [mockUserInstance],
        total: 5,
        page: 2,
        totalPages: 1,
      });
    });

    it('should query with roleId filter if provided', async () => {
      mockUserModel.exec.mockResolvedValueOnce([mockUserInstance]);
      mockUserModel.exec.mockResolvedValueOnce(1);

      const query = { roleId: 'role123' };
      await service.findAll(query);

      expect(mockUserModel.find).toHaveBeenCalledWith({
        roles: 'role123',
      });
    });
  });
});
