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
      const res = await service.updateUserRole('targetUserId', 'adminRoleId', requester);
      expect(mockUserInstance.role).toBe('adminRoleId');
      expect(mockUserInstance.roleType).toBe('ADMIN');
      expect(mockUserInstance.save).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if requester is not SUPER_ADMIN and target role is SUPER_ADMIN', async () => {
      const requester = { roleType: 'ADMIN' };
      await expect(
        service.updateUserRole('targetUserId', 'superAdminRoleId', requester),
      ).rejects.toThrow(ForbiddenException);
      expect(mockUserInstance.save).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if requester is not SUPER_ADMIN and current role is SUPER_ADMIN', async () => {
      mockUserInstance.role = { _id: 'superAdminRoleId', name: 'SUPER_ADMIN' };
      mockUserInstance.roleType = 'SUPER_ADMIN';

      const requester = { roleType: 'ADMIN' };
      await expect(
        service.updateUserRole('targetUserId', 'adminRoleId', requester),
      ).rejects.toThrow(ForbiddenException);
      expect(mockUserInstance.save).not.toHaveBeenCalled();
    });

    it('should successfully update role to SUPER_ADMIN if requester is SUPER_ADMIN', async () => {
      const requester = { roleType: 'SUPER_ADMIN' };
      await service.updateUserRole('targetUserId', 'superAdminRoleId', requester);
      expect(mockUserInstance.role).toBe('superAdminRoleId');
      expect(mockUserInstance.roleType).toBe('SUPER_ADMIN');
      expect(mockUserInstance.save).toHaveBeenCalled();
    });
  });
});
