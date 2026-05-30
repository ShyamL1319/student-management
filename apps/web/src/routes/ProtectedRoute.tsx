import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Stack } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadCurrentUserThunk } from '../features/auth/authSlice';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      void dispatch(loadCurrentUserThunk());
    }
  }, [dispatch, token, user]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return (
      <Stack minHeight="100vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  return children;
}
