import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PhonepeService } from './phonepe.service';
import { BadRequestException } from '@nestjs/common';

describe('PhonepeService', () => {
  let service: PhonepeService;
  let mockConfigService: any;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'PHONEPE_MERCHANT_ID') return 'merchant123';
        if (key === 'PHONEPE_SALT_KEY') return 'saltKey123';
        if (key === 'PHONEPE_SALT_INDEX') return '1';
        if (key === 'PHONEPE_HOST_URL') return 'https://api-preprod.phonepe.com/apis/pg-sandbox';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhonepeService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<PhonepeService>(PhonepeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifySignature', () => {
    it('should successfully match calculation to signature header', () => {
      const payload = 'base64EncodedResponseString';
      const expectedHash = (service as any).calculateChecksum(payload, '', 'saltKey123', '1');

      const result = service.verifySignature(payload, expectedHash);
      expect(result).toBe(true);
    });

    it('should fail if signature check does not match expected SHA256 checksum', () => {
      const result = service.verifySignature('wrong_payload', 'wrong_header');
      expect(result).toBe(false);
    });
  });

  describe('createPaymentRequest', () => {
    it('should throw BadRequestException if merchantId settings are missing', async () => {
      // Mock missing credentials
      mockConfigService.get = jest.fn().mockReturnValue(null);

      const customService = new PhonepeService(mockConfigService);

      await expect(
        customService.createPaymentRequest(
          1000,
          'txn_001',
          'student_001',
          'http://redirect.com',
          'http://callback.com',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
