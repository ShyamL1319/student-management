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
import { TenantContext } from '../tenant/tenant.context';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (
      user &&
      user.passwordHash &&
      (await bcrypt.compare(pass, user.passwordHash))
    ) {
      const { passwordHash, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async validateOAuthUser(profile: {
    provider: string;
    providerId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
    metadata: any;
  }): Promise<any> {
    let user = await this.usersService.findByEmail(profile.email);

    if (user) {
      // User exists: link provider if not already linked
      let updated = false;
      const providers = user.oauthProviders || [];
      if (!providers.includes(profile.provider)) {
        providers.push(profile.provider);
        user.oauthProviders = providers;
        updated = true;
      }

      // Link provider-specific ID
      if (profile.provider === 'google' && !user.googleId) {
        user.googleId = profile.providerId;
        updated = true;
      } else if (profile.provider === 'facebook' && !user.facebookId) {
        user.facebookId = profile.providerId;
        updated = true;
      } else if (profile.provider === 'github' && !user.githubId) {
        user.githubId = profile.providerId;
        updated = true;
      }

      // Sync avatar if user does not have one
      if (profile.avatar && !user.avatar) {
        user.avatar = profile.avatar;
        updated = true;
      }

      // Sync provider metadata
      if (profile.metadata) {
        user.providerMetadata = {
          ...(user.providerMetadata || {}),
          [profile.provider]: profile.metadata,
        };
        updated = true;
      }

      if (updated) {
        await user.save();
      }
    } else {
      // User does not exist: create user record with USER role
      const RoleModel = this.usersService.getUserModel().db.model('Role');
      let userRole = await RoleModel.findOne({ name: 'USER' }).exec();
      if (!userRole) {
        // If USER role is missing, dynamically create it!
        userRole = await RoleModel.create({
          name: 'USER',
          description: 'Standard registered user with basic access',
          permissions: [],
        });
      }

      // Determine default schoolId
      let schoolId = undefined;
      const tenantSchoolId = TenantContext.getSchoolId();
      if (tenantSchoolId) {
        schoolId = tenantSchoolId;
      } else {
        const SchoolModel = this.usersService.getUserModel().db.model('School');
        const defaultSchool = await SchoolModel.findOne().exec();
        if (defaultSchool) {
          schoolId = defaultSchool._id;
        }
      }

      const newUserData: any = {
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatar: profile.avatar,
        roles: [userRole._id],
        roleType: 'USER',
        isActive: true,
        oauthProviders: [profile.provider],
        providerMetadata: {
          [profile.provider]: profile.metadata,
        },
      };

      if (profile.provider === 'google') {
        newUserData.googleId = profile.providerId;
      } else if (profile.provider === 'facebook') {
        newUserData.facebookId = profile.providerId;
      } else if (profile.provider === 'github') {
        newUserData.githubId = profile.providerId;
      }

      if (schoolId) {
        newUserData.schoolId = schoolId;
      }

      user = await this.usersService.create(newUserData);
    }

    return this.generateUserTokens(user);
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
    let roleNames: string[] = [];
    if (user.roles && user.roles.length > 0) {
      roleNames = user.roles
        .map((r: any) => {
          if (typeof r === 'string') return r;
          if (r && typeof r === 'object' && r.name) return r.name;
          return '';
        })
        .filter(Boolean);
    }
    if (roleNames.length === 0) {
      if (user.roleType) {
        roleNames.push(user.roleType);
      } else if (user.role) {
        const name = typeof user.role === 'string' ? user.role : user.role.name;
        if (name) roleNames.push(name);
      }
    }

    const payload = {
      email: user.email,
      sub: user._id,
      roles: roleNames,
      role: roleNames[0],
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

    let roleNames: string[] = [];
    if (user.roles && user.roles.length > 0) {
      roleNames = user.roles
        .map((r: any) => {
          if (typeof r === 'string') return r;
          if (r && typeof r === 'object' && r.name) return r.name;
          return '';
        })
        .filter(Boolean);
    }
    if (roleNames.length === 0) {
      if (user.roleType) {
        roleNames.push(user.roleType);
      } else if (user.roles) {
        const name = typeof user.roles === 'string' ? user.roles : user.roles[0].name;
        if (name) roleNames.push(name);
      }
    }

    const payload = {
      email: user.email,
      sub: user._id,
      roles: roleNames,
      role: user.roles,
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
