import { Test, TestingModule } from '@nestjs/testing';
import { TenantGuard } from './tenant.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { TenantContext } from './tenant.context';
import { RoleEnum } from '../common/enums/role.enum';

describe('TenantGuard', () => {
  let guard: TenantGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantGuard,
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<TenantGuard>(TenantGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
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

  it('should return true if route is marked public', () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);
    const context = createMockContext({});

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockReflector.getAllAndOverride).toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if tenant school context is missing', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    jest.spyOn(TenantContext, 'getSchoolId').mockReturnValue(undefined);

    const context = createMockContext({});

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should return true for SUPER_ADMIN regardless of school mapping', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    jest.spyOn(TenantContext, 'getSchoolId').mockReturnValue('target-school-id');

    const req = {
      user: {
        email: 'super@school.com',
        role: { name: RoleEnum.SUPER_ADMIN },
        school: 'other-school-id',
      },
    };
    const context = createMockContext(req);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if user school does not match tenant school context', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    jest.spyOn(TenantContext, 'getSchoolId').mockReturnValue('school-a');

    const req = {
      user: {
        email: 'attacker@school.com',
        role: { name: RoleEnum.ADMIN },
        school: 'school-b',
      },
    };
    const context = createMockContext(req);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should return true if user school matches tenant school context', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    jest.spyOn(TenantContext, 'getSchoolId').mockReturnValue('school-a');

    const req = {
      user: {
        email: 'user@school.com',
        role: { name: RoleEnum.ADMIN },
        school: 'school-a',
      },
    };
    const context = createMockContext(req);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });
});
