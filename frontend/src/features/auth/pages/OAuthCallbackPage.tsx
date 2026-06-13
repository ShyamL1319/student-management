import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import { SchoolOutlined } from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { authApi } from '../api/auth.api';

export const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const processingRef = useRef(false);

  useEffect(() => {
    // Avoid double processing in React 18 strict mode
    if (processingRef.current) return;
    processingRef.current = true;

    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (!accessToken) {
      navigate('/login?error=No+access+token+received');
      return;
    }

    // Save tokens locally
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    // Fetch profile and login
    authApi
      .getProfile()
      .then((user) => {
        login({ accessToken, user });
        navigate('/');
      })
      .catch((error) => {
        console.error('OAuth profile retrieval failed:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login?error=Failed+to+retrieve+profile');
      });
  }, [searchParams, login, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100vw',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 50%, #0d9488 100%)',
        p: 3,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 5,
          borderRadius: '16px',
          textAlign: 'center',
          backgroundColor: 'background.paper',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #0d9488 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            margin: '0 auto 24px',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
          }}
        >
          <SchoolOutlined fontSize="large" />
        </Box>

        <Typography
          variant="h5"
          sx={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            mb: 1.5,
          }}
        >
          Authenticating
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 4, fontFamily: "'Inter', sans-serif" }}
        >
          Please wait while we secure your session and load your profile...
        </Typography>

        <CircularProgress
          size={44}
          thickness={4}
          sx={{
            color: 'primary.main',
          }}
        />
      </Paper>
    </Box>
  );
};
