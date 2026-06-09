import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TenantMiddleware } from './tenant.middleware';
import { Tenant } from './schemas/tenant.schema';
import { School } from '../schools/schemas/school.schema';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { TenantContext } from './tenant.context';

describe('TenantMiddleware', () => {
  let middleware: TenantMiddleware;

  const mockTenantModel = {
    findById: jest.fn(),
    findOne: jest.fn(),
  };

  const mockSchoolModel = {
    findById: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    decode: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantMiddleware,
        { provide: getModelToken(Tenant.name), useValue: mockTenantModel },
        { provide: getModelToken(School.name), useValue: mockSchoolModel },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    middleware = module.get<TenantMiddleware>(TenantMiddleware);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should pass through if no tenant identifier is present in request', async () => {
    const req = { headers: {} } as any;
    const res = {} as any;
    const next = jest.fn();

    await middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(mockTenantModel.findById).not.toHaveBeenCalled();
    expect(mockTenantModel.findOne).not.toHaveBeenCalled();
  });

  it('should resolve tenant via X-Tenant-ID header (ObjectId)', async () => {
    const tenantId = new Types.ObjectId().toString();
    const schoolId = new Types.ObjectId().toString();

    const req = {
      headers: {
        'x-tenant-id': tenantId,
      },
    } as any;
    const res = {} as any;
    const next = jest.fn();

    const mockTenant = {
      _id: tenantId,
      name: 'Test School',
      subdomain: 'test',
      isActive: true,
    };
    const mockSchool = { _id: schoolId, tenantId };

    mockTenantModel.findById.mockResolvedValue(mockTenant);
    mockSchoolModel.findOne.mockResolvedValue(mockSchool);

    // Capture context run
    const contextRunSpy = jest.spyOn(TenantContext, 'run');

    await middleware.use(req, res, next);

    expect(mockTenantModel.findById).toHaveBeenCalledWith(tenantId);
    expect(mockSchoolModel.findOne).toHaveBeenCalledWith({
      tenantId: tenantId,
    });
    expect(contextRunSpy).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should resolve tenant via Subdomain', async () => {
    const tenantId = new Types.ObjectId().toString();
    const schoolId = new Types.ObjectId().toString();

    const req = {
      headers: {
        host: 'hogwarts.school.com',
      },
    } as any;
    const res = {} as any;
    const next = jest.fn();

    const mockTenant = {
      _id: tenantId,
      name: 'Hogwarts',
      subdomain: 'hogwarts',
      isActive: true,
    };
    const mockSchool = { _id: schoolId, tenantId };

    mockTenantModel.findOne.mockResolvedValue(mockTenant);
    mockSchoolModel.findOne.mockResolvedValue(mockSchool);

    await middleware.use(req, res, next);

    expect(mockTenantModel.findOne).toHaveBeenCalled();
    expect(mockSchoolModel.findOne).toHaveBeenCalledWith({
      tenantId: tenantId,
    });
    expect(next).toHaveBeenCalled();
  });

  it('should throw NotFoundException if tenant is not found', async () => {
    const tenantId = new Types.ObjectId().toString();
    const req = {
      headers: {
        'x-tenant-id': tenantId,
      },
    } as any;
    const res = {} as any;
    const next = jest.fn();

    mockTenantModel.findById.mockResolvedValue(null);
    mockSchoolModel.findById.mockResolvedValue(null);

    await middleware.use(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundException));
  });

  it('should throw BadRequestException if tenant is inactive', async () => {
    const tenantId = new Types.ObjectId().toString();
    const req = {
      headers: {
        'x-tenant-id': tenantId,
      },
    } as any;
    const res = {} as any;
    const next = jest.fn();

    const mockTenant = {
      _id: tenantId,
      name: 'Inactive',
      subdomain: 'inactive',
      isActive: false,
    };
    mockTenantModel.findById.mockResolvedValue(mockTenant);

    await middleware.use(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestException));
  });
});
