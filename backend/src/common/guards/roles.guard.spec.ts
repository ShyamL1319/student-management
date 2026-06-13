import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RoleEnum } from '../enums/role.enum';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, { provide: Reflector, useValue: mockReflector }],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockContext = (requestData: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => requestData,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  };

  it('should return true if no roles are required', () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createMockContext({});

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should return false if user is not present in the request', () => {
    mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.ADMIN]);
    const context = createMockContext({});

    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });

  it('should return true if user has SUPER_ADMIN role (in array)', () => {
    mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.ADMIN]);
    const context = createMockContext({
      user: {
        roles: [RoleEnum.SUPER_ADMIN],
      },
    });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should return true if user has SUPER_ADMIN role as an object', () => {
    mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.ADMIN]);
    const context = createMockContext({
      user: {
        roles: [{ name: RoleEnum.SUPER_ADMIN }],
      },
    });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should return true if user has one of the required roles in roles array (string)', () => {
    mockReflector.getAllAndOverride.mockReturnValue([
      RoleEnum.TEACHER,
      RoleEnum.ADMIN,
    ]);
    const context = createMockContext({
      user: {
        roles: [RoleEnum.TEACHER],
      },
    });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should return true if user has one of the required roles in roles array (object)', () => {
    mockReflector.getAllAndOverride.mockReturnValue([
      RoleEnum.TEACHER,
      RoleEnum.ADMIN,
    ]);
    const context = createMockContext({
      user: {
        roles: [{ name: RoleEnum.ADMIN }],
      },
    });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should return true if user has required role in legacy role string field', () => {
    mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.STAFF]);
    const context = createMockContext({
      user: {
        role: RoleEnum.STAFF,
      },
    });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should return true if user has required role in legacy role object field', () => {
    mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.STAFF]);
    const context = createMockContext({
      user: {
        role: { name: RoleEnum.STAFF },
      },
    });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should return true if user has required role in roleType field', () => {
    mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.TEACHER]);
    const context = createMockContext({
      user: {
        roleType: RoleEnum.TEACHER,
      },
    });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should return false if user roles do not match required roles', () => {
    mockReflector.getAllAndOverride.mockReturnValue([
      RoleEnum.ADMIN,
      RoleEnum.SUPER_ADMIN,
    ]);
    const context = createMockContext({
      user: {
        roles: [RoleEnum.STUDENT, RoleEnum.PARENT],
        role: RoleEnum.PARENT,
        roleType: RoleEnum.PARENT,
      },
    });

    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });
});
