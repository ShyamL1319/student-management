/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConflictException } from '@nestjs/common';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { UserRole } from './schemas/user.schema';

jest.mock('bcrypt');

describe('UsersService', () => {
  const userModel = {
    exists: jest.fn<any>(),
    create: jest.fn<any>(),
  };
  const service = new UsersService(userModel as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a user with a hashed password', async () => {
    userModel.exists.mockResolvedValue(null);
    userModel.create.mockResolvedValue({ email: 'admin@example.com' });
    jest.mocked(bcrypt.hash).mockResolvedValue('hash' as never);

    await expect(
      service.create({
        name: 'Admin',
        email: 'ADMIN@example.com',
        passwordHash: 'hash',
        role: UserRole.Admin,
      }),
    ).resolves.toMatchObject({ email: 'admin@example.com' });
  });

  it('rejects duplicate emails', async () => {
    userModel.exists.mockResolvedValue({ _id: 'existing' });

    await expect(
      service.create({
        name: 'Admin',
        email: 'admin@example.com',
        passwordHash: 'hash',
        role: UserRole.Admin,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
