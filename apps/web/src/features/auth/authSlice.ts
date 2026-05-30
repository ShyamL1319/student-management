import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getCurrentUser, login, LoginCredentials } from './authService';
import { AuthUser } from './types';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const tokenStorage = {
  get(): string | null {
    return typeof globalThis.localStorage?.getItem === 'function'
      ? globalThis.localStorage.getItem('accessToken')
      : null;
  },
  set(token: string): void {
    if (typeof globalThis.localStorage?.setItem === 'function') {
      globalThis.localStorage.setItem('accessToken', token);
    }
  },
  remove(): void {
    if (typeof globalThis.localStorage?.removeItem === 'function') {
      globalThis.localStorage.removeItem('accessToken');
    }
  },
};

const initialState: AuthState = {
  token: tokenStorage.get(),
  user: null,
  status: 'idle',
  error: null,
};

export const loginThunk = createAsyncThunk('auth/login', async (credentials: LoginCredentials) => {
  const result = await login(credentials);
  tokenStorage.set(result.accessToken);
  return result;
});

export const loadCurrentUserThunk = createAsyncThunk('auth/me', async () => getCurrentUser());

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      tokenStorage.remove();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.accessToken;
        state.user = action.payload.user;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Login failed';
      })
      .addCase(loadCurrentUserThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(loadCurrentUserThunk.rejected, (state) => {
        state.token = null;
        state.user = null;
        tokenStorage.remove();
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
