import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import {
  SchoolOutlined,
  Visibility,
  VisibilityOff,
  ShieldOutlined,
  ArrowBackOutlined,
} from '@mui/icons-material';

export const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      setSuccessMsg('Your password has been successfully reset. Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    },
    onError: () => {
      setErrorMsg('Failed to reset password. The link may have expired.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    mutation.mutate({ token, newPassword });
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
            Reset Password
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', fontFamily: "'Inter', sans-serif" }}
          >
            Enter your new secure password below to complete the account reset.
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {successMsg && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>
              {successMsg}
            </Alert>
          )}

          {(errorMsg || mutation.isError) && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
              {errorMsg || 'Failed to reset password. The link may be invalid or expired.'}
            </Alert>
          )}

          {!token && (
            <Alert severity="warning" sx={{ mb: 3, borderRadius: '8px' }}>
              Invalid or missing password reset token.
            </Alert>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            name="newPassword"
            label="New Password"
            type={showPassword1 ? 'text' : 'password'}
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={mutation.isPending || !token}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle new password visibility"
                      onClick={() => setShowPassword1(!showPassword1)}
                      edge="end"
                    >
                      {showPassword1 ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
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

          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm New Password"
            type={showPassword2 ? 'text' : 'password'}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={mutation.isPending || !token}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShowPassword2(!showPassword2)}
                      edge="end"
                    >
                      {showPassword2 ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
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
            disabled={mutation.isPending || !token || !newPassword || !confirmPassword}
            sx={{
              mt: 3,
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
              'Reset Password'
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
            PS Educational Institute security systems
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
