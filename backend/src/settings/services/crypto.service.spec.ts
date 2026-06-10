import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'ENCRYPTION_KEY')
        return 'my-super-secret-encryption-key-1234';
      if (key === 'JWT_SECRET') return 'my-jwt-secret';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt a string to a formatted cipher text (iv:authTag:encrypted)', () => {
      const plaintext = 'super-secret-password';
      const cipherText = service.encrypt(plaintext);

      expect(cipherText).toBeDefined();
      expect(typeof cipherText).toBe('string');

      const parts = cipherText.split(':');
      expect(parts.length).toBe(3);
      expect(parts[0]).toHaveLength(24); // 12 bytes IV in hex = 24 chars
      expect(parts[1]).toHaveLength(32); // 16 bytes auth tag in hex = 32 chars
    });

    it('should decrypt a valid cipher text back to plaintext', () => {
      const plaintext = 'another-secret-key-123';
      const cipherText = service.encrypt(plaintext);
      const decrypted = service.decrypt(cipherText);

      expect(decrypted).toBe(plaintext);
    });

    it('should return empty string for empty inputs', () => {
      expect(service.encrypt('')).toBe('');
      expect(service.decrypt('')).toBe('');
    });

    it('should return the original string if it is not in the encrypted format', () => {
      const plaintext = 'not-encrypted-string';
      expect(service.decrypt(plaintext)).toBe(plaintext);
    });

    it('should throw an error if decryption fails with corrupted auth tag', () => {
      const plaintext = 'test-fail';
      const cipherText = service.encrypt(plaintext);
      const parts = cipherText.split(':');
      // Corrupt the encrypted text
      parts[2] = '0000000000000000';
      const corruptedCipherText = parts.join(':');

      expect(() => service.decrypt(corruptedCipherText)).toThrow(
        'Decryption failed',
      );
    });
  });
});
