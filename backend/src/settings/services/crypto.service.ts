import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const rawKey =
      this.configService.get<string>('ENCRYPTION_KEY') ||
      this.configService.get<string>('JWT_SECRET') ||
      'fallback-encryption-key-for-local-development-must-be-changed';

    // Hash to ensure a consistent 32-byte key for AES-256
    this.key = crypto.createHash('sha256').update(rawKey).digest();
  }

  /**
   * Encrypts plain text into AES-256-GCM format
   */
  encrypt(text: string): string {
    if (!text) return '';
    try {
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag().toString('hex');

      // Format: iv:authTag:encryptedText
      return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Encryption failed: ${msg}`);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypts AES-256-GCM cipher text back to plain text
   */
  decrypt(cipherText: string): string {
    if (!cipherText) return '';

    // Check if the format is correct (iv:authTag:encrypted)
    const parts = cipherText.split(':');
    if (parts.length !== 3) {
      // Return as-is if it doesn't match the format (could be plain-text fallback or legacy)
      return cipherText;
    }

    try {
      const [ivHex, authTagHex, encryptedHex] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);

      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Decryption failed: ${msg}`);
      throw new Error('Decryption failed');
    }
  }
}
