export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorEnvelope {
  success: false;
  message: string;
  errors: string[];
}

const viteEnv = (import.meta as ImportMeta & { env?: { VITE_API_BASE_URL?: string } }).env;
const API_BASE_URL = viteEnv?.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

function getAccessToken(): string | null {
  return typeof globalThis.localStorage?.getItem === 'function'
    ? globalThis.localStorage.getItem('accessToken')
    : null;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const payload = (await response.json()) as ApiEnvelope<T> | ApiErrorEnvelope;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload.data;
}
