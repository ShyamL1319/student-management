/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { generateSecret, generateURI, verify as verifyTotp } from 'otplib';
import * as QRCode from 'qrcode';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if MFA is enabled
    if (user.mfaEnabled) {
      const mfaPayload = {
        sub: user._id.toString(),
        isMfaPending: true,
      };
      const mfaToken = this.jwtService.sign(mfaPayload, {
        secret: this.configService.get<string>('JWT_SECRET') || 'supersecret',
        expiresIn: '5m',
      });
      return {
        mfaRequired: true,
        mfaToken,
      };
    }

    return this.generateUserTokens(user);
  }

  private async generateUserTokens(user: any) {
    const payload = {
      email: user.email,
      sub: user._id,
      role: user.role,
      schoolId: user.schoolId?.toString(),
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET') || 'supersecret',
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'supersecretrefresh',
      expiresIn: '7d',
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(user._id.toString(), {
      refreshTokenHash: hashedRefreshToken,
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async logout(userId: string) {
    return this.usersService.update(userId, { refreshTokenHash: '' });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Access Denied');
    }

    // Verify token using JWT Service first to ensure it is a valid token signed by us
    try {
      this.jwtService.verify(refreshToken, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'supersecretrefresh',
      });
    } catch (err) {
      throw new UnauthorizedException('Access Denied');
    }

    if (!user.refreshTokenHash) {
      throw new UnauthorizedException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!refreshTokenMatches) {
      // BREACH DETECTED: Valid signature but mismatched hash -> REUSE DETECTED!
      // Immediately invalidate all active refresh tokens for the user (force logout)
      await this.usersService.update(user._id.toString(), {
        refreshTokenHash: null as any,
      });
      throw new UnauthorizedException(
        'Access Denied: Token reuse detected. Please log in again.',
      );
    }

    const payload = {
      email: user.email,
      sub: user._id,
      role: user.role,
      schoolId: user.schoolId?.toString(),
    };
    const newAccessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET') || 'supersecret',
      expiresIn: '15m',
    });
    const newRefreshToken = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'supersecretrefresh',
      expiresIn: '7d',
    });

    const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);
    await this.usersService.update(user._id.toString(), {
      refreshTokenHash: hashedRefreshToken,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async forgotPassword(email: string) {
    // Logic to generate reset token and send email
    return { message: 'Reset password email sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    // Logic to verify token and update password
    return { message: 'Password reset successful' };
  }

  // --- MFA (Time-based One-Time Password) methods ---

  async generateMfaSecret(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.mfaEnabled) {
      throw new BadRequestException('MFA is already enabled for this user');
    }

    const secret = generateSecret();
    const appName = 'School Management System';
    const otpauthUrl = generateURI({
      issuer: appName,
      label: user.email,
      secret,
    });
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Save temporary secret to database
    await this.usersService.update(userId, { mfaSecret: secret });

    return {
      secret,
      otpauthUrl,
      qrCodeDataUrl,
    };
  }

  async verifyAndEnableMfa(userId: string, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.mfaEnabled) {
      throw new BadRequestException('MFA is already enabled');
    }
    if (!user.mfaSecret) {
      throw new BadRequestException('MFA setup was not initiated');
    }

    const result = await verifyTotp({
      token: code,
      secret: user.mfaSecret,
    });

    if (!result.valid) {
      throw new UnauthorizedException('Invalid verification code');
    }

    // Generate 10 backup recovery codes
    const backupCodes: string[] = [];
    const hashedBackupCodes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const plainCode = crypto.randomBytes(5).toString('hex'); // 10 characters
      backupCodes.push(plainCode);
      const hashedCode = await bcrypt.hash(plainCode, 10);
      hashedBackupCodes.push(hashedCode);
    }

    await this.usersService.update(userId, {
      mfaEnabled: true,
      mfaBackupCodes: hashedBackupCodes,
    });

    return {
      success: true,
      backupCodes,
    };
  }

  async verifyMfaLogin(mfaToken: string, code: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(mfaToken, {
        secret: this.configService.get<string>('JWT_SECRET') || 'supersecret',
      });
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired MFA token');
    }

    if (!payload.isMfaPending) {
      throw new UnauthorizedException('Invalid MFA request');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    let isValid = false;

    // 1. Try TOTP code
    if (user.mfaSecret) {
      const result = await verifyTotp({
        token: code,
        secret: user.mfaSecret,
      });
      isValid = result.valid;
    }

    // 2. Try Backup recovery code if TOTP is invalid
    if (!isValid && user.mfaBackupCodes && user.mfaBackupCodes.length > 0) {
      let matchingHashIndex = -1;
      for (let i = 0; i < user.mfaBackupCodes.length; i++) {
        const matches = await bcrypt.compare(code, user.mfaBackupCodes[i]);
        if (matches) {
          matchingHashIndex = i;
          isValid = true;
          break;
        }
      }

      // If backup code used, remove it to prevent reuse
      if (isValid && matchingHashIndex > -1) {
        const updatedBackupCodes = [...user.mfaBackupCodes];
        updatedBackupCodes.splice(matchingHashIndex, 1);
        await this.usersService.update(user._id.toString(), {
          mfaBackupCodes: updatedBackupCodes,
        });
      }
    }

    if (!isValid) {
      throw new UnauthorizedException('Invalid MFA verification code');
    }

    return this.generateUserTokens(user);
  }

  async disableMfa(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersService.update(userId, {
      mfaEnabled: false,
      mfaSecret: null as any,
      mfaBackupCodes: [],
    });
    return { success: true };
  }
}
