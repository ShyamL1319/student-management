/* eslint-disable @typescript-eslint/no-explicit-any */
import { UnauthorizedException } from '@nestjs/common';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserRole } from '../users/schemas/user.schema';

jest.mock('bcrypt');

describe('AuthService', () => {
  const usersService: any = {
    findByEmailWithPassword: jest.fn(),
    findActiveById: jest.fn(),
  };
  const jwtService: any = { signAsync: jest.fn() };
  const configService = { getOrThrow: jest.fn().mockReturnValue('1d') };
  const service = new AuthService(
    usersService as never,
    jwtService as unknown as JwtService,
    configService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a token for valid credentials', async () => {
    usersService.findByEmailWithPassword.mockResolvedValue({
      id: 'user-id',
      name: 'Admin',
      email: 'admin@example.com',
      role: UserRole.Admin,
      passwordHash: 'hash',
    });
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
    jwtService.signAsync.mockResolvedValue('token');

    await expect(
      service.login({ email: 'admin@example.com', password: 'ChangeMe123!' }),
    ).resolves.toMatchObject({ accessToken: 'token' });
  });

  it('rejects invalid credentials', async () => {
    usersService.findByEmailWithPassword.mockResolvedValue(null);

    await expect(
      service.login({ email: 'admin@example.com', password: 'wrong-pass' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
