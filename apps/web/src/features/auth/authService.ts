import { apiRequest } from '../../services/api';
import { AuthUser, LoginResult } from './types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export function login(credentials: LoginCredentials): Promise<LoginResult> {
  return apiRequest<LoginResult>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function getCurrentUser(): Promise<AuthUser> {
  return apiRequest<AuthUser>('/auth/me');
}
