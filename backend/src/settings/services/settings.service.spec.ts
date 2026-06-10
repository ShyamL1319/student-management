import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { SettingsService } from './settings.service';
import { CryptoService } from './crypto.service';
import { Settings } from '../schemas/settings.schema';
import { TenantContext } from '../../tenant/tenant.context';

describe('SettingsService', () => {
  let service: SettingsService;

  const mockSchoolId = new Types.ObjectId();

  const mockSettings = {
    schoolId: mockSchoolId,
    school: { currency: 'USD', timezone: 'UTC' },
    branding: { primaryColor: '#4F46E5' },
    email: { provider: 'smtp', password: 'mock-encrypted-smtp-password' },
    sms: { provider: 'twilio', authToken: 'mock-encrypted-twilio-token' },
    mfa: { enabled: false },
    notification: { emailEnabled: true },
    backup: { enabled: false },
    integrations: {
      stripeEnabled: true,
      stripeSecretKey: 'mock-encrypted-stripe-secret',
    },
    save: jest.fn().mockImplementation(function (this: any) {
      return Promise.resolve(this);
    }),
  };

  const mockSettingsModel = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockCryptoService = {
    encrypt: jest.fn((text: string) => `encrypted:${text}`),
    decrypt: jest.fn((text: string) => text.replace('encrypted:', '')),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: getModelToken(Settings.name),
          useValue: mockSettingsModel,
        },
        {
          provide: CryptoService,
          useValue: mockCryptoService,
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSettings', () => {
    it('should throw an error if no school context is active', async () => {
      await expect(service.getSettings()).rejects.toThrow(
        'No active school context found',
      );
    });

    it('should return existing settings for active school context', async () => {
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSettings),
      });

      await TenantContext.run(
        { schoolId: mockSchoolId.toString(), tenantId: '', subdomain: '' },
        async () => {
          const result = await service.getSettings();
          expect(result).toBeDefined();
          expect(result.schoolId).toEqual(mockSchoolId);
          expect(mockSettingsModel.findOne).toHaveBeenCalledWith({
            schoolId: mockSchoolId,
          });
        },
      );
    });

    it('should initialize and return default settings if none exist (self-healing)', async () => {
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      mockSettingsModel.create.mockImplementation((data) =>
        Promise.resolve({
          ...data,
          save: jest.fn().mockResolvedValue(data),
        }),
      );

      await TenantContext.run(
        { schoolId: mockSchoolId.toString(), tenantId: '', subdomain: '' },
        async () => {
          const result = await service.getSettings();
          expect(result).toBeDefined();
          expect(mockSettingsModel.create).toHaveBeenCalledWith(
            expect.objectContaining({ schoolId: mockSchoolId }),
          );
        },
      );
    });
  });

  describe('updateSettings', () => {
    it('should update normal fields and encrypt new secrets', async () => {
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockSettings,
          save: jest.fn().mockImplementation(function (this: any) {
            return Promise.resolve(this);
          }),
        }),
      });

      await TenantContext.run(
        { schoolId: mockSchoolId.toString(), tenantId: '', subdomain: '' },
        async () => {
          const updateDto = {
            branding: { primaryColor: '#FF0000' },
            email: { password: 'new-plain-password' },
          };

          const result = await service.updateSettings(updateDto);
          expect(result.branding?.primaryColor).toBe('#FF0000');
          expect(result.email?.password).toBe('encrypted:new-plain-password');
          expect(mockCryptoService.encrypt).toHaveBeenCalledWith(
            'new-plain-password',
          );
        },
      );
    });

    it('should not re-encrypt or change credentials if the update contains mask value ******', async () => {
      const existingEncryptedPassword = 'mock-encrypted-smtp-password';
      const doc = {
        ...mockSettings,
        email: { provider: 'smtp', password: existingEncryptedPassword },
        save: jest.fn().mockImplementation(function (this: any) {
          return Promise.resolve(this);
        }),
      };
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(doc),
      });

      await TenantContext.run(
        { schoolId: mockSchoolId.toString(), tenantId: '', subdomain: '' },
        async () => {
          const updateDto = {
            email: { password: '******', senderEmail: 'test@example.com' },
          };

          const result = await service.updateSettings(updateDto);
          expect(result.email?.password).toBe(existingEncryptedPassword);
          expect(result.email?.senderEmail).toBe('test@example.com');
          expect(mockCryptoService.encrypt).not.toHaveBeenCalled();
        },
      );
    });
  });

  describe('maskSettings', () => {
    it('should redact sensitive information in returned configuration objects', () => {
      const result = service.maskSettings(mockSettings);

      expect(result.email.password).toBe('******');
      expect(result.sms.authToken).toBe('******');
      expect(result.integrations.stripeSecretKey).toBe('******');

      // Non-sensitive fields should remain untouched
      expect(result.school.currency).toBe('USD');
      expect(result.branding.primaryColor).toBe('#4F46E5');
    });
  });

  describe('getDecryptedSettings', () => {
    it('should return fully decrypted secret credentials for internal consumers', async () => {
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSettings),
      });

      await TenantContext.run(
        { schoolId: mockSchoolId.toString(), tenantId: '', subdomain: '' },
        async () => {
          const result = await service.getDecryptedSettings();
          expect(result.email?.password).toBe('mock-encrypted-smtp-password'); // Unchanged from mock db state in tests because decrypt returns value with 'encrypted:' stripped
          expect(mockCryptoService.decrypt).toHaveBeenCalledWith(
            'mock-encrypted-smtp-password',
          );
          expect(mockCryptoService.decrypt).toHaveBeenCalledWith(
            'mock-encrypted-stripe-secret',
          );
        },
      );
    });
  });
});
