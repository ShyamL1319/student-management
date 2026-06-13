import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as otplib from 'otplib';

jest.mock('bcrypt');

jest.mock('otplib', () => ({
  generateSecret: jest.fn().mockReturnValue('mockedMfaSecret'),
  generateURI: jest.fn().mockReturnValue('otpauth://totp/mockedURI'),
  verify: jest.fn(),
}));

jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mockedQrCode'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    _id: 'userId123',
    email: 'user@school.com',
    passwordHash: 'hashedPassword',
    role: { _id: 'roleId', name: 'TEACHER' },
    schoolId: 'schoolId123',
    mfaEnabled: false,
    mfaSecret: '',
    mfaBackupCodes: [] as string[],
    refreshTokenHash: 'hashedOldRefreshToken',
    toObject: jest.fn().mockReturnThis(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    getUserModel: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
    decode: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') return 'secretKey';
      if (key === 'JWT_REFRESH_SECRET') return 'refreshSecretKey';
      return null;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockUser.mfaEnabled = false;
    mockUser.mfaSecret = '';
    mockUser.mfaBackupCodes = [];
    mockUser.refreshTokenHash = 'hashedOldRefreshToken';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  describe('login', () => {
    it('should throw UnauthorizedException if credentials are invalid', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: 'wrong@school.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should login directly if MFA is disabled', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign
        .mockReturnValueOnce('mockedAccessToken')
        .mockReturnValueOnce('mockedRefreshToken');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewRefreshToken');
      usersService.update.mockResolvedValue({} as any);

      const result = await service.login({
        email: 'user@school.com',
        password: 'password',
      });

      expect(result).toEqual({
        accessToken: 'mockedAccessToken',
        refreshToken: 'mockedRefreshToken',
        user: expect.any(Object),
      });
      expect(usersService.update).toHaveBeenCalledWith('userId123', {
        refreshTokenHash: 'hashedNewRefreshToken',
      });
    });

    it('should return mfaRequired and mfaToken if MFA is enabled', async () => {
      mockUser.mfaEnabled = true;
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValueOnce('tempMfaToken');

      const result = await service.login({
        email: 'user@school.com',
        password: 'password',
      });

      expect(result).toEqual({
        mfaRequired: true,
        mfaToken: 'tempMfaToken',
      });
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: 'userId123', isMfaPending: true },
        expect.any(Object),
      );
    });
  });

  describe('refreshTokens', () => {
    it('should rotate tokens and update hash on success', async () => {
      usersService.findById.mockResolvedValue(mockUser);
      jwtService.verify.mockReturnValue({ sub: 'userId123' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign
        .mockReturnValueOnce('newAccessToken')
        .mockReturnValueOnce('newRefreshToken');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewRefreshToken');
      usersService.update.mockResolvedValue({} as any);

      const result = await service.refreshTokens(
        'userId123',
        'oldRefreshToken',
      );

      expect(result).toEqual({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      });
      expect(usersService.update).toHaveBeenCalledWith('userId123', {
        refreshTokenHash: 'hashedNewRefreshToken',
      });
    });

    it('should revoke all tokens and throw on token reuse (breach detection)', async () => {
      usersService.findById.mockResolvedValue(mockUser);
      jwtService.verify.mockReturnValue({ sub: 'userId123' });
      // Simulate mismatch
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.refreshTokens('userId123', 'stolenOldRefreshToken'),
      ).rejects.toThrow(UnauthorizedException);

      // Verify that token hash was cleared (revoking all active sessions)
      expect(usersService.update).toHaveBeenCalledWith('userId123', {
        refreshTokenHash: null,
      });
    });
  });

  describe('MFA Setup & Verify', () => {
    it('should generate MFA secret and QR code data URL', async () => {
      usersService.findById.mockResolvedValue(mockUser);
      usersService.update.mockResolvedValue({} as any);

      const result = await service.generateMfaSecret('userId123');

      expect(result).toEqual({
        secret: 'mockedMfaSecret',
        otpauthUrl: 'otpauth://totp/mockedURI',
        qrCodeDataUrl: 'data:image/png;base64,mockedQrCode',
      });
      expect(usersService.update).toHaveBeenCalledWith('userId123', {
        mfaSecret: 'mockedMfaSecret',
      });
    });

    it('should throw BadRequestException if MFA setup is verified with invalid code', async () => {
      mockUser.mfaSecret = 'mockedMfaSecret';
      usersService.findById.mockResolvedValue(mockUser);
      (otplib.verify as jest.Mock).mockResolvedValue({ valid: false });

      await expect(
        service.verifyAndEnableMfa('userId123', '000000'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should enable MFA and generate backup codes on valid code', async () => {
      mockUser.mfaSecret = 'mockedMfaSecret';
      usersService.findById.mockResolvedValue(mockUser);
      (otplib.verify as jest.Mock).mockResolvedValue({ valid: true });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedBackupCode');
      usersService.update.mockResolvedValue({} as any);

      const result = await service.verifyAndEnableMfa('userId123', '123456');

      expect(result.success).toBe(true);
      expect(result.backupCodes.length).toBe(10);
      expect(usersService.update).toHaveBeenCalledWith('userId123', {
        mfaEnabled: true,
        mfaBackupCodes: expect.arrayContaining(['hashedBackupCode']),
      });
    });
  });

  describe('verifyMfaLogin', () => {
    it('should login successfully with valid TOTP code', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'userId123',
        isMfaPending: true,
      });
      mockUser.mfaSecret = 'mockedMfaSecret';
      usersService.findById.mockResolvedValue(mockUser);
      (otplib.verify as jest.Mock).mockResolvedValue({ valid: true });
      jwtService.sign
        .mockReturnValueOnce('accessToken')
        .mockReturnValueOnce('refreshToken');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewRefreshToken');
      usersService.update.mockResolvedValue({} as any);

      const result = await service.verifyMfaLogin('mfaToken123', '123456');

      expect(result).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
        user: expect.any(Object),
      });
    });

    it('should login successfully with valid backup recovery code', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'userId123',
        isMfaPending: true,
      });
      mockUser.mfaSecret = 'mockedMfaSecret';
      mockUser.mfaBackupCodes = ['hashedBackupCode1', 'hashedBackupCode2'];
      usersService.findById.mockResolvedValue(mockUser);

      // TOTP fails
      (otplib.verify as jest.Mock).mockResolvedValue({ valid: false });
      // Backup code matches hashedBackupCode1
      (bcrypt.compare as jest.Mock).mockImplementation(
        async (plain, hashed) => hashed === 'hashedBackupCode1',
      );

      jwtService.sign
        .mockReturnValueOnce('accessToken')
        .mockReturnValueOnce('refreshToken');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewRefreshToken');
      usersService.update.mockResolvedValue({} as any);

      const result = await service.verifyMfaLogin(
        'mfaToken123',
        'backupCodePlain',
      );

      expect(result).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
        user: expect.any(Object),
      });
      // The used backup code should have been removed
      expect(usersService.update).toHaveBeenCalledWith('userId123', {
        mfaBackupCodes: ['hashedBackupCode2'],
      });
    });

    it('should throw UnauthorizedException if code is invalid', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'userId123',
        isMfaPending: true,
      });
      mockUser.mfaSecret = 'mockedMfaSecret';
      usersService.findById.mockResolvedValue(mockUser);
      (otplib.verify as jest.Mock).mockResolvedValue({ valid: false });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.verifyMfaLogin('mfaToken123', 'invalid'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateOAuthUser', () => {
    it('should link provider to existing user email and preserve role', async () => {
      const existingUser = {
        _id: 'existingId',
        email: 'user@school.com',
        role: { _id: 'roleId', name: 'TEACHER' },
        oauthProviders: [] as string[],
        googleId: '',
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnThis(),
      };
      usersService.findByEmail.mockResolvedValue(existingUser as any);
      jwtService.sign
        .mockReturnValueOnce('accessToken')
        .mockReturnValueOnce('refreshToken');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewRefreshToken');
      usersService.update.mockResolvedValue({} as any);

      const result = await service.validateOAuthUser({
        provider: 'google',
        providerId: 'google-id-123',
        email: 'user@school.com',
        firstName: 'John',
        lastName: 'Doe',
        avatar: 'avatar.url',
        metadata: { some: 'data' },
      });

      expect(existingUser.oauthProviders).toContain('google');
      expect(existingUser.googleId).toBe('google-id-123');
      expect(existingUser.save).toHaveBeenCalled();
      expect(result.accessToken).toBe('accessToken');
    });

    it('should create new user with USER role if email does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const mockRole = { _id: 'userRoleId', name: 'USER' };
      const mockSchool = { _id: 'schoolId' };

      const mockRoleModel = {
        findOne: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockRole),
        }),
        create: jest.fn().mockResolvedValue(mockRole),
      };
      const mockSchoolModel = {
        findOne: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockSchool),
        }),
      };

      const mockDb = {
        model: jest.fn().mockImplementation((modelName) => {
          if (modelName === 'Role') return mockRoleModel;
          if (modelName === 'School') return mockSchoolModel;
          return null;
        }),
      };

      const mockUserModelInstance = {
        db: mockDb,
      };

      usersService.getUserModel.mockReturnValue(mockUserModelInstance);

      const createdUser = {
        _id: 'newUserId',
        email: 'new@school.com',
        role: mockRole,
        roleType: 'USER',
        oauthProviders: ['google'],
        googleId: 'google-id-123',
        schoolId: 'schoolId',
        toObject: jest.fn().mockReturnThis(),
      };

      usersService.create.mockResolvedValue(createdUser as any);
      jwtService.sign
        .mockReturnValueOnce('accessToken')
        .mockReturnValueOnce('refreshToken');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewRefreshToken');
      usersService.update.mockResolvedValue({} as any);

      const result = await service.validateOAuthUser({
        provider: 'google',
        providerId: 'google-id-123',
        email: 'new@school.com',
        firstName: 'New',
        lastName: 'User',
        avatar: 'avatar.url',
        metadata: { some: 'data' },
      });

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'new@school.com',
          roleType: 'USER',
          googleId: 'google-id-123',
        }),
      );
      expect(result.accessToken).toBe('accessToken');
    });
  });
});
