import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './services/email.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-message-id' }),
  }),
}));

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'email.from') {
                return 'noreply@example.com';
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const result = await service.sendEmail(
        'test@example.com',
        'Test Subject',
        'Test Message',
      );

      expect(result.success).toBe(true);
    });
  });

  describe('sendBulkEmail', () => {
    it('should send bulk emails', async () => {
      const recipients = ['test1@example.com', 'test2@example.com'];

      const result = await service.sendBulkEmail(
        recipients,
        'Test Subject',
        'Test Message',
      );

      expect(result.success).toBeGreaterThan(0);
    });
  });
});
