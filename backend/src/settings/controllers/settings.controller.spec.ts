/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { SettingsController } from './settings.controller';
import { SettingsService } from '../services/settings.service';
import { School } from '../../schools/schemas/school.schema';
import { TenantContext } from '../../tenant/tenant.context';

describe('SettingsController', () => {
  let controller: SettingsController;
  let service: SettingsService;

  const mockSchoolId = new Types.ObjectId();

  const mockSettings = {
    schoolId: mockSchoolId,
    branding: { logoUrl: 'http://logo.com', primaryColor: '#000' },
    mfa: { enabled: true },
  };

  const mockSchool = {
    _id: mockSchoolId,
    name: 'My Test School',
  };

  const mockSettingsService = {
    getSettings: jest.fn().mockResolvedValue(mockSettings),
    updateSettings: jest.fn().mockResolvedValue(mockSettings),
    maskSettings: jest.fn().mockImplementation((val: unknown) => ({
      ...(val as Record<string, unknown>),
      masked: true,
    })),
  };

  const mockSchoolModel = {
    findById: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockSchool),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [
        {
          provide: SettingsService,
          useValue: mockSettingsService,
        },
        {
          provide: getModelToken(School.name),
          useValue: mockSchoolModel,
        },
      ],
    }).compile();

    controller = module.get<SettingsController>(SettingsController);
    service = module.get<SettingsService>(SettingsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSettings', () => {
    it('should retrieve settings and return masked values', async () => {
      const result = await controller.getSettings();
      expect(result).toBeDefined();
      expect(result.masked).toBe(true);
      expect(service.getSettings).toHaveBeenCalled();
      expect(service.maskSettings).toHaveBeenCalledWith(mockSettings);
    });
  });

  describe('updateSettings', () => {
    it('should update settings and return masked values', async () => {
      const dto = { branding: { primaryColor: '#FF0000' } };
      const result = await controller.updateSettings(dto);
      expect(result).toBeDefined();
      expect(result.masked).toBe(true);
      expect(service.updateSettings).toHaveBeenCalledWith(dto);
      expect(service.maskSettings).toHaveBeenCalledWith(mockSettings);
    });
  });

  describe('getPublicSettings', () => {
    it('should return system fallback values when no active school context is resolved', async () => {
      // Execute outside of TenantContext block to simulate no resolved tenant/school
      const result = await controller.getPublicSettings();
      expect(result).toBeDefined();
      expect(result.schoolName).toBe('School Management System');
      expect(result.branding.primaryColor).toBe('#4F46E5');
    });

    it('should return brand and school name when school context is active', async () => {
      await TenantContext.run(
        { schoolId: mockSchoolId.toString(), tenantId: '', subdomain: '' },
        async () => {
          const result = await controller.getPublicSettings();
          expect(result).toBeDefined();
          expect(result.schoolName).toBe('My Test School');
          expect(result.branding.logoUrl).toBe('http://logo.com');
          expect(result.mfaEnabled).toBe(true);
        },
      );
    });
  });
});
