import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SmsService } from './services/sms.service';

describe('SmsService', () => {
  let service: SmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock'),
          },
        },
      ],
    }).compile();

    service = module.get<SmsService>(SmsService);
  });

  describe('sendSMS', () => {
    it('should send SMS successfully with mock provider', async () => {
      const result = await service.sendSMS('+1234567890', 'Test message');

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });
  });

  describe('sendBulkSMS', () => {
    it('should send bulk SMS', async () => {
      const phoneNumbers = ['+1234567890', '+9876543210'];

      const result = await service.sendBulkSMS(phoneNumbers, 'Test message');

      expect(result.success).toBeGreaterThan(0);
    });
  });
});
