/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { AuthController } from './auth.controller';
import { UserRole } from '../users/schemas/user.schema';

describe('AuthController', () => {
  const authService = {
    login: jest.fn<any>(),
    me: jest.fn<any>(),
  };
  const controller = new AuthController(authService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates login to the auth service', async () => {
    authService.login.mockResolvedValue({ accessToken: 'token' });

    await expect(
      controller.login({ email: 'admin@example.com', password: 'ChangeMe123!' }),
    ).resolves.toEqual({ accessToken: 'token' });
  });

  it('delegates me to the auth service', async () => {
    const user = { sub: '1', email: 'admin@example.com', role: UserRole.Admin };
    authService.me.mockResolvedValue(user);

    await expect(controller.me(user)).resolves.toEqual(user);
  });
});
