import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Alert,
  Fade,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ShieldOutlined,
  SchoolOutlined,
} from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuth } from '../../../contexts/AuthContext';

const quotes = [
  {
    text: "Empowering educators, students, and parents with a unified platform for modern learning.",
    author: "PSEI Administration",
  },
  {
    text: "Streamlined academic administration, automated financial billing, and real-time alerts.",
    author: "Academic Registrar",
  },
  {
    text: "Secure, role-based portals designed to keep the entire school community connected.",
    author: "PSEI Technology Team",
  },
];

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [animateQuote, setAnimateQuote] = useState(true);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const errorParam = searchParams.get('error');

  const handleOAuthLogin = (provider: string) => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://api.psei.school.com:3000';
    window.location.href = `${apiBaseUrl}/auth/${provider}`;
  };

  // Quote rotation carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimateQuote(false);
      setTimeout(() => {
        setQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
        setAnimateQuote(true);
      }, 300);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data);
      navigate('/');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ email, password });
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Left Panel: Visual/Branding (Desktop Only) */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 50%, #0d9488 100%)',
          p: 6,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-20%',
            right: '-20%',
            width: '60%',
            height: '60%',
            borderRadius: '50%',
            background: 'rgba(20, 184, 166, 0.15)',
            filter: 'blur(80px)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-10%',
            left: '-10%',
            width: '50%',
            height: '50%',
            borderRadius: '50%',
            background: 'rgba(79, 70, 229, 0.2)',
            filter: 'blur(80px)',
          },
        }}
      >
        {/* Top Monogram */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, zIndex: 2 }}>
          <Box
            sx={{
              height: 36,
              px: 1.5,
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1rem',
              letterSpacing: '0.5px',
            }}
          >
            PSEI
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 600,
              fontSize: '1.1rem',
              letterSpacing: '0.2px',
            }}
          >
            PS Educational Institute
          </Typography>
        </Box>

        {/* Center SVG Illustration & Quote Carousel */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexGrow: 1,
            zIndex: 2,
            my: 4,
          }}
        >
          {/* Animated SVG Mockup of School Elements */}
          <Box
            sx={{
              mb: 4,
              p: 2,
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              maxWidth: 360,
            }}
          >
            <svg
              width="260"
              height="160"
              viewBox="0 0 260 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Grid Lines */}
              <line x1="10" y1="140" x2="250" y2="140" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="2" />
              <line x1="40" y1="20" x2="40" y2="140" stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="3 3" />
              <line x1="130" y1="20" x2="130" y2="140" stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="3 3" />
              <line x1="220" y1="20" x2="220" y2="140" stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="3 3" />

              {/* Chart Graphics */}
              <path
                d="M 40 110 Q 85 50, 130 80 T 220 30"
                stroke="url(#chartGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="130" cy="80" r="5" fill="#14b8a6" stroke="white" strokeWidth="2" />
              <circle cx="220" cy="30" r="5" fill="#14b8a6" stroke="white" strokeWidth="2" />

              {/* Bar charts at the back */}
              <rect x="55" y="90" width="16" height="50" rx="3" fill="rgba(255,255,255,0.15)" />
              <rect x="100" y="70" width="16" height="70" rx="3" fill="rgba(255,255,255,0.25)" />
              <rect x="145" y="85" width="16" height="55" rx="3" fill="rgba(255,255,255,0.15)" />
              <rect x="190" y="50" width="16" height="90" rx="3" fill="rgba(255,255,255,0.3)" />

              {/* Little Floating Widgets */}
              <rect x="140" y="10" width="80" height="28" rx="6" fill="rgba(15, 23, 42, 0.6)" stroke="rgba(255,255,255,0.2)" />
              <circle cx="154" cy="24" r="6" fill="#10b981" />
              <rect x="166" y="21" width="44" height="6" rx="2" fill="white" />

              <defs>
                <linearGradient id="chartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#2dd4bf" />
                </linearGradient>
              </defs>
            </svg>
          </Box>

          {/* Testimonial / Slogan text */}
          <Box sx={{ width: '100%', maxWidth: 420, textAlign: 'center', px: 2, height: 110 }}>
            <Fade in={animateQuote} timeout={300}>
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '1.05rem',
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                    opacity: 0.9,
                    mb: 1.5,
                  }}
                >
                  "{quotes[quoteIndex].text}"
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  — {quotes[quoteIndex].author}
                </Typography>
              </Box>
            </Fade>
          </Box>
        </Box>

        {/* Bottom Footer Operational Info */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            pt: 3,
            zIndex: 2,
          }}
        >
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            © {new Date().getFullYear()} PSEI. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
              All systems operational
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Right Panel: Credentials Form */}
      <Box
        sx={{
          flex: { xs: 1, md: 0.9, lg: 0.8 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.default',
          p: { xs: 3, sm: 6 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 420,
            p: { xs: 3, sm: 5 },
            border: (theme) => `1px solid ${theme.palette.divider}`,
            borderRadius: '16px',
            backgroundColor: 'background.paper',
            boxShadow: (theme) =>
              theme.palette.mode === 'light'
                ? '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)'
                : 'none',
          }}
        >
          {/* Logo & Greeting */}
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
              Sign In
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center', fontFamily: "'Inter', sans-serif" }}
            >
              Enter credentials to access the PS Educational Institute portal.
            </Typography>
          </Box>

          {/* Form Content */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {(mutation.isError || errorParam) && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
                {errorParam ? decodeURIComponent(errorParam) : 'Incorrect email or password. Please try again.'}
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

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
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

            {/* Remember Me & Forgot Password links */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mt: 1.5,
                mb: 2,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    Remember me
                  </Typography>
                }
              />
              <Button
                variant="text"
                size="small"
                onClick={() => navigate('/forgot-password')}
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  p: 0,
                  minWidth: 0,
                  textTransform: 'none',
                  color: 'primary.main',
                  '&:hover': { background: 'none', textDecoration: 'underline' },
                }}
              >
                Forgot Password?
              </Button>
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={mutation.isPending || !email || !password}
              sx={{
                mt: 1,
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
                'Sign In'
              )}
            </Button>

            {/* Divider / Or Sign In With */}
            <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
              <Typography variant="caption" color="text.secondary" sx={{ mx: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                or sign in with
              </Typography>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
            </Box>

            {/* OAuth Provider Buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
              {/* Google Button */}
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleOAuthLogin('google')}
                startIcon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                }
                sx={{
                  py: 1.1,
                  borderRadius: '8px',
                  borderColor: 'divider',
                  color: 'text.primary',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  fontFamily: "'Inter', sans-serif",
                  '&:hover': {
                    borderColor: 'primary.main',
                    background: 'rgba(79, 70, 229, 0.04)',
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s',
                  },
                }}
              >
                Continue with Google
              </Button>

              {/* Facebook Button */}
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleOAuthLogin('facebook')}
                startIcon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.44 23.08 10.25 24v-8.44H7.18v-3.49h3.07V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.96h-1.52c-1.49 0-1.96.93-1.96 1.88v2.26h3.33l-.53 3.49h-2.8V24C19.56 23.08 24 18.1 24 12.07z" fill="#1877F2" />
                  </svg>
                }
                sx={{
                  py: 1.1,
                  borderRadius: '8px',
                  borderColor: 'divider',
                  color: 'text.primary',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  fontFamily: "'Inter', sans-serif",
                  '&:hover': {
                    borderColor: 'primary.main',
                    background: 'rgba(79, 70, 229, 0.04)',
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s',
                  },
                }}
              >
                Continue with Facebook
              </Button>

              {/* GitHub Button */}
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleOAuthLogin('github')}
                startIcon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" fill="currentColor" />
                  </svg>
                }
                sx={{
                  py: 1.1,
                  borderRadius: '8px',
                  borderColor: 'divider',
                  color: 'text.primary',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  fontFamily: "'Inter', sans-serif",
                  '&:hover': {
                    borderColor: 'primary.main',
                    background: 'rgba(79, 70, 229, 0.04)',
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s',
                  },
                }}
              >
                Continue with GitHub
              </Button>
            </Box>

            {/* Secure Session Notice */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                pt: 3,
              }}
            >
              <ShieldOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                Your session is encrypted using industry standard protocols.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};
