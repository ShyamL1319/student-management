import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { SchoolOutlined, ArrowBackOutlined, ShieldOutlined } from '@mui/icons-material';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      setSuccessMsg('A password reset link has been dispatched to your email address.');
      setEmail('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    mutation.mutate(email);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) =>
          theme.palette.mode === 'light'
            ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            : '#020617',
        p: { xs: 2, sm: 4 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: { xs: 4, sm: 5 },
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: '16px',
          backgroundColor: 'background.paper',
          boxShadow: (theme) =>
            theme.palette.mode === 'light'
              ? '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)'
              : 'none',
        }}
      >
        {/* Logo and Headings */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #0d9488 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              mb: 2,
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
            }}
          >
            <SchoolOutlined fontSize="medium" />
          </Box>
          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              textAlign: 'center',
              letterSpacing: '-0.5px',
              mb: 1,
            }}
          >
            Forgot Password
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', fontFamily: "'Inter', sans-serif" }}
          >
            Enter your email below and we'll send you a link to reset your account credentials.
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {successMsg && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>
              {successMsg}
            </Alert>
          )}

          {mutation.isError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
              Failed to send reset link. Please verify your email.
            </Alert>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={mutation.isPending}
            slotProps={{
              input: {
                sx: {
                  borderRadius: '8px',
                  fontFamily: "'Inter', sans-serif",
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.15)',
                  },
                },
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={mutation.isPending || !email}
            sx={{
              mt: 2,
              mb: 3,
              py: 1.25,
              fontSize: '0.95rem',
              fontWeight: 600,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
              boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4338ca 0%, #312e81 100%)',
              },
              '&:disabled': {
                background: 'action.disabledBackground',
                boxShadow: 'none',
              },
            }}
          >
            {mutation.isPending ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Send Reset Link'
            )}
          </Button>

          {/* Back to Login */}
          <Button
            fullWidth
            variant="text"
            startIcon={<ArrowBackOutlined fontSize="small" />}
            onClick={() => navigate('/login')}
            sx={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'none',
              py: 1,
              borderRadius: '8px',
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            Back to Login
          </Button>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            pt: 3,
            mt: 4,
          }}
        >
          <ShieldOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
            PS Educational Institute Admin Services
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
