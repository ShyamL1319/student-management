import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Settings, SettingsDocument } from '../schemas/settings.schema';
import { CryptoService } from './crypto.service';
import { TenantContext } from '../../tenant/tenant.context';
import { UpdateSettingsDto } from '../dto/settings.dto';

@Injectable()
export class SettingsService {
  private readonly emailSecrets = ['password', 'apiKey'];
  private readonly smsSecrets = ['authToken', 'whatsappApiKey'];
  private readonly backupSecrets = ['s3SecretAccessKey'];
  private readonly integrationsSecrets = [
    'stripeSecretKey',
    'stripeWebhookSecret',
    'razorpayKeySecret',
    'twilioToken',
    'whatsappToken',
    'zoomClientSecret',
    'googleClientSecret',
    'microsoftClientSecret',
  ];

  constructor(
    @InjectModel(Settings.name)
    private readonly settingsModel: Model<SettingsDocument>,
    private readonly cryptoService: CryptoService,
  ) {}

  /**
   * Retrieves or initializes settings for the active school context.
   */
  async getSettings(): Promise<SettingsDocument> {
    const schoolIdStr = TenantContext.getSchoolId();
    if (!schoolIdStr) {
      throw new NotFoundException('No active school context found');
    }
    const schoolId = new Types.ObjectId(schoolIdStr);

    let settings = await this.settingsModel.findOne({ schoolId }).exec();
    if (!settings) {
      // Auto-initialize default settings for the school (Self-healing pattern)
      settings = await this.settingsModel.create({
        schoolId,
        school: {},
        branding: {},
        email: {},
        sms: {},
        mfa: {},
        notification: {},
        backup: {},
        integrations: {},
      });
    }

    return settings;
  }

  /**
   * Updates settings for the active school context while handling secrets encryption.
   */
  async updateSettings(dto: UpdateSettingsDto): Promise<Settings> {
    const settings = await this.getSettings();

    // 1. Update School Settings
    if (dto.school) {
      settings.school = { ...settings.school, ...dto.school };
    }

    // 2. Update Branding Settings
    if (dto.branding) {
      settings.branding = { ...settings.branding, ...dto.branding };
    }

    // 3. Update Email Settings
    if (dto.email) {
      const emailObj = {
        ...settings.email,
        ...dto.email,
      } as Record<string, unknown>;

      for (const key of this.emailSecrets) {
        const val = dto.email[key as keyof typeof dto.email];
        if (val === '******') {
          // Keep existing encrypted value
          emailObj[key] = settings.email[key as keyof typeof settings.email];
        } else if (typeof val === 'string' && val) {
          // Encrypt new value
          emailObj[key] = this.cryptoService.encrypt(val);
        }
      }
      settings.email = emailObj;
    }

    // 4. Update SMS Settings
    if (dto.sms) {
      const smsObj = {
        ...settings.sms,
        ...dto.sms,
      } as Record<string, unknown>;

      for (const key of this.smsSecrets) {
        const val = dto.sms[key as keyof typeof dto.sms];
        if (val === '******') {
          smsObj[key] = settings.sms[key as keyof typeof settings.sms];
        } else if (typeof val === 'string' && val) {
          smsObj[key] = this.cryptoService.encrypt(val);
        }
      }
      settings.sms = smsObj;
    }

    // 5. Update MFA Settings
    if (dto.mfa) {
      settings.mfa = { ...settings.mfa, ...dto.mfa };
    }

    // 6. Update Notification Settings
    if (dto.notification) {
      settings.notification = { ...settings.notification, ...dto.notification };
    }

    // 7. Update Backup Settings
    if (dto.backup) {
      const backupObj = {
        ...settings.backup,
        ...dto.backup,
      } as Record<string, unknown>;

      for (const key of this.backupSecrets) {
        const val = dto.backup[key as keyof typeof dto.backup];
        if (val === '******') {
          backupObj[key] = settings.backup[key as keyof typeof settings.backup];
        } else if (typeof val === 'string' && val) {
          backupObj[key] = this.cryptoService.encrypt(val);
        }
      }
      settings.backup = backupObj;
    }

    // 8. Update Integration Settings
    if (dto.integrations) {
      const integrationsObj = {
        ...settings.integrations,
        ...dto.integrations,
      } as Record<string, unknown>;

      for (const key of this.integrationsSecrets) {
        const val = dto.integrations[key as keyof typeof dto.integrations];
        if (val === '******') {
          integrationsObj[key] =
            settings.integrations[key as keyof typeof settings.integrations];
        } else if (typeof val === 'string' && val) {
          integrationsObj[key] = this.cryptoService.encrypt(val);
        }
      }
      settings.integrations = integrationsObj;
    }

    return settings.save();
  }

  /**
   * Returns copy of settings with all secrets replaced with a mask.
   */
  maskSettings(settings: Settings): Record<string, unknown> {
    const raw = JSON.parse(JSON.stringify(settings)) as Record<
      string,
      Record<string, unknown>
    >;

    // Mask Email secrets
    if (raw['email']) {
      for (const key of this.emailSecrets) {
        if (raw['email'][key]) {
          raw['email'][key] = '******';
        }
      }
    }

    // Mask SMS secrets
    if (raw['sms']) {
      for (const key of this.smsSecrets) {
        if (raw['sms'][key]) {
          raw['sms'][key] = '******';
        }
      }
    }

    // Mask Backup secrets
    if (raw['backup']) {
      for (const key of this.backupSecrets) {
        if (raw['backup'][key]) {
          raw['backup'][key] = '******';
        }
      }
    }

    // Mask Integrations secrets
    if (raw['integrations']) {
      for (const key of this.integrationsSecrets) {
        if (raw['integrations'][key]) {
          raw['integrations'][key] = '******';
        }
      }
    }

    return raw;
  }

  /**
   * Internal helper: Decrypts all secret fields in a Settings document.
   */
  decryptSettings(settings: Settings): Settings {
    const decrypted = JSON.parse(JSON.stringify(settings)) as Settings;

    if (decrypted.email) {
      const emailObj = decrypted.email as unknown as Record<string, unknown>;
      for (const key of this.emailSecrets) {
        const val = emailObj[key] as string;
        if (val) {
          emailObj[key] = this.cryptoService.decrypt(val);
        }
      }
    }

    if (decrypted.sms) {
      const smsObj = decrypted.sms as unknown as Record<string, unknown>;
      for (const key of this.smsSecrets) {
        const val = smsObj[key] as string;
        if (val) {
          smsObj[key] = this.cryptoService.decrypt(val);
        }
      }
    }

    if (decrypted.backup) {
      const backupObj = decrypted.backup as unknown as Record<string, unknown>;
      for (const key of this.backupSecrets) {
        const val = backupObj[key] as string;
        if (val) {
          backupObj[key] = this.cryptoService.decrypt(val);
        }
      }
    }

    if (decrypted.integrations) {
      const integrationsObj = decrypted.integrations as unknown as Record<
        string,
        unknown
      >;
      for (const key of this.integrationsSecrets) {
        const val = integrationsObj[key] as string;
        if (val) {
          integrationsObj[key] = this.cryptoService.decrypt(val);
        }
      }
    }

    return decrypted;
  }

  /**
   * Internal helper: Get decrypted settings for active school.
   */
  async getDecryptedSettings(): Promise<Settings> {
    const settings = await this.getSettings();
    return this.decryptSettings(settings);
  }
}
