import React, { useEffect } from 'react';
import { Box, Button, Container, Grid, Typography, useTheme, Card, CardContent, IconButton, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PublicIcon from '@mui/icons-material/Public';
import BadgeIcon from '@mui/icons-material/Badge';
import GradingIcon from '@mui/icons-material/Grading';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ForumIcon from '@mui/icons-material/Forum';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useAuth } from '../../../contexts/AuthContext';
import { BRAND, FONT_FAMILY } from '../../../theme/brand';

// Helper component for Neon Icons
const NeonIcon = ({ icon: Icon, color }: { icon: any, color: string }) => (
  <Box
    sx={{
      display: 'inline-flex',
      p: 1.5,
      borderRadius: 2,
      bgcolor: `${color}1A`, // 10% opacity
      color: color,
      mb: 2,
      filter: `drop-shadow(0 0 12px ${color}99)`, // stronger glow
    }}
  >
    <Icon sx={{ fontSize: 36 }} />
  </Box>
);

const GradientText = ({ children, sx = {} }: { children: React.ReactNode, sx?: any }) => (
  <Box
    component="span"
    sx={{
      background: BRAND.gradient,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      display: 'inline-block',
      ...sx
    }}
  >
    {children}
  </Box>
);

const LandingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useAuth();

  // Force dark mode context if needed by making the background #0F1115
  useEffect(() => {
    if (isAuthenticated) {
      const roleName = typeof user?.role === 'string' ? user.role : (user?.role as any)?.name || user?.roleType;
      if (roleName === 'PARENT') {
        navigate('/parents');
      } else {
        navigate('/dashboard');
      }
      return;
    }

    document.body.style.backgroundColor = '#0F1115';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [isAuthenticated, navigate, user]);

  const features = [
    { title: 'Student Info System', description: 'Centralize records, enrollment, and profiles effortlessly.', icon: BadgeIcon, color: '#3b82f6' },
    { title: 'Gradebook & Reporting', description: 'Centralize records, enrollment, and profiles effortlessly.', icon: GradingIcon, color: '#ec4899' },
    { title: 'Schedule & Attendance', description: 'Centralize records, enrollment, and profiles effortlessly.', icon: CalendarMonthIcon, color: '#3b82f6' },
    { title: 'Communication Hub', description: 'Centralize records, enrollment, and profiles effortlessly.', icon: ForumIcon, color: '#ec4899' },
    { title: 'Online Admissions', description: 'Centralize records, enrollment, and profiles effortlessly.', icon: AssignmentIcon, color: '#3b82f6' },
    { title: 'Fee Management', description: 'Centralize records, enrollment, and profiles effortlessly.', icon: AccountBalanceWalletIcon, color: '#ec4899' },
  ];

  return (
    <Box sx={{ bgcolor: BRAND.background, color: BRAND.textPrimary, minHeight: '100vh', fontFamily: FONT_FAMILY, background: 'linear-gradient(135deg, #0F1115, #1A1C23)' }}>
      {/* HEADER */}
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 4 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ position: 'relative', width: 32, height: 32 }}>
              <PublicIcon sx={{
                fontSize: 32,
                position: 'absolute',
                fill: 'url(#logo-gradient)'
              }} />
              <svg width="0" height="0">
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop stopColor={BRAND.primary} offset="0%" />
                  <stop stopColor={BRAND.secondary} offset="100%" />
                </linearGradient>
              </svg>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
              EduSphere
            </Typography>
          </Box>

          {/* Nav Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4 }}>
            {['Features', 'Solutions', 'Resources', 'Pricing'].map((item) => (
              <Typography key={item} sx={{ cursor: 'pointer', fontWeight: 500, fontSize: '0.95rem', color: BRAND.textSecondary, '&:hover': { color: 'white' } }}>
                {item} {item === 'Solutions' || item === 'Resources' ? '▾' : ''}
              </Typography>
            ))}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" sx={{
              bgcolor: BRAND.primary,
              color: 'white',
              borderRadius: 6,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: `0 0 15px rgba(59,130,246,0.5)`,
              '&:hover': { bgcolor: '#2563eb' }
            }}>
              Get Demo
            </Button>
            <Button variant="outlined" onClick={() => navigate('/login')} sx={{
              color: BRAND.secondary,
              borderColor: `${BRAND.secondary}33`,
              borderRadius: 6,
              px: 4,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { borderColor: `${BRAND.secondary}66`, color: 'white' }
            }}>
              Login
            </Button>
          </Box>
        </Box>
      </Container>

      {/* HERO SECTION */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '30vh', background: 'linear-gradient(135deg, #0F1115, #1A1C23)', zIndex: -1 }} />
      <Container maxWidth="lg" sx={{ mt: 10, mb: 15 }}>
        <Grid container spacing={6} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h2" sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif", mb: 3, lineHeight: 1.2, letterSpacing: '-0.5px', color: BRAND.textPrimary }}>
              Transform Education with <GradientText>EduSphere</GradientText> – Smart School Management.
            </Typography>
            <Typography variant="body1" sx={{ color: BRAND.textSecondary, fontSize: '1.1rem', mb: 5, maxWidth: 500, lineHeight: 1.7 }}>
              Streamline administration, engage students, and empower educators with our comprehensive digital platform.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Button variant="contained" size="large" sx={{
                bgcolor: BRAND.primary,
                color: 'white',
                borderRadius: 6,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: `0 0 20px rgba(59,130,246,0.4)`,
                '&:hover': { bgcolor: '#2563eb' }
              }}>
                Start Free Trial
              </Button>
              <Button variant="outlined" size="large" sx={{
                color: BRAND.secondary,
                borderColor: BRAND.secondary,
                borderRadius: 6,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                '&:hover': { borderColor: '#db2777', bgcolor: 'rgba(236, 72, 153, 0.05)' }
              }}>
                Watch Demo
              </Button>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            {/* Mockup Dashboard Placeholder */}
            <Box sx={{
              width: '100%',
              height: 400,
              bgcolor: BRAND.surface,
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{ position: 'absolute', top: 12, left: 16, right: 16, height: 40, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ef4444' }} />
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#10b981' }} />
                <Typography variant="h6" sx={{ color: BRAND.textPrimary, fontWeight: 700, ml: 2, filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.6))' }}>
                  STUDENT PORTAL
                </Typography>
              </Box>
              <Box sx={{ mt: 8, px: 4, display: 'flex', gap: 3, height: '100%' }}>
                <Box sx={{ width: '25%', bgcolor: '#232530', borderRadius: 2, height: '75%', p: 2 }}>
                  <Box sx={{ width: '100%', height: 10, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 4, mb: 2 }} />
                  <Box sx={{ width: '80%', height: 10, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 4, mb: 2 }} />
                  <Box sx={{ width: '90%', height: 10, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 4, mb: 2 }} />
                </Box>
                <Box sx={{ width: '75%', bgcolor: '#232530', borderRadius: 2, height: '75%', p: 3, position: 'relative' }}>
                  {/* Abstract chart bars matching the neon theme */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: '60%', mb: 3 }}>
                    <Box sx={{ flex: 1, bgcolor: '#3b82f6', height: '40%', borderRadius: '4px 4px 0 0', filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.5))' }} />
                    <Box sx={{ flex: 1, bgcolor: '#ec4899', height: '70%', borderRadius: '4px 4px 0 0', filter: 'drop-shadow(0 0 8px rgba(236,72,153,0.5))' }} />
                    <Box sx={{ flex: 1, bgcolor: '#3b82f6', height: '50%', borderRadius: '4px 4px 0 0', filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.5))' }} />
                    <Box sx={{ flex: 1, bgcolor: '#ec4899', height: '90%', borderRadius: '4px 4px 0 0', filter: 'drop-shadow(0 0 8px rgba(236,72,153,0.5))' }} />
                    <Box sx={{ flex: 1, bgcolor: '#3b82f6', height: '60%', borderRadius: '4px 4px 0 0', filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.5))' }} />
                  </Box>
                  <Box sx={{ width: '100%', height: 2, bgcolor: 'rgba(255,255,255,0.05)' }} />
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
      <Box sx={{ width: '100%', overflow: 'hidden', lineHeight: 0 }}>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '80px' }}>
          <path fill={BRAND.background} d="M0,224L48,213.3C96,203,192,181,288,165.3C384,149,480,139,576,117.3C672,96,768,64,864,64C960,64,1056,96,1152,122.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        </svg>
      </Box>

      {/* FEATURES GRID */}
      <Container maxWidth="lg" sx={{ mb: 15 }}>
        <Grid container spacing={3}>
          {features.map((feat, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
              <Card sx={{
                bgcolor: BRAND.surface,
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.05)',
                height: '100%',
                transition: 'transform 0.2s, border-color 0.2s',
                '&:hover': { transform: 'translateY(-4px)', borderColor: 'rgba(255,255,255,0.3)', boxShadow: '0 0 12px rgba(255,255,255,0.4)' }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <NeonIcon icon={feat.icon} color={feat.color} />
                  <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", mb: 1, color: BRAND.textPrimary }}>
                    {feat.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: BRAND.textSecondary, mb: 4, lineHeight: 1.6 }}>
                    {feat.description}
                  </Typography>
                  <Typography sx={{ color: feat.color, fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}>
                    Learn More <ArrowForwardIosIcon sx={{ fontSize: 10, ml: 0.5 }} />
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* FOOTER */}
      <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', pt: 8, pb: 4, bgcolor: BRAND.background }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} sx={{ mb: 6 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ position: 'relative', width: 28, height: 28 }}>
                  <PublicIcon sx={{ fontSize: 28, position: 'absolute', fill: 'url(#logo-gradient)' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", color: BRAND.textPrimary }}>
                  EduSphere
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: BRAND.textSecondary, maxWidth: 300, lineHeight: 1.6 }}>
                Streamline administration, engage students, and empower educators with our comprehensive digital platform.
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography sx={{ fontWeight: 600, mb: 3, color: 'white' }}>Quick Links</Typography>
              {['Platform', 'Company', 'Resources', 'Contact'].map((link) => (
                <Typography key={link} variant="body2" sx={{ color: '#94a3b8', mb: 2, cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {link}
                </Typography>
              ))}
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography sx={{ fontWeight: 600, mb: 3, color: 'white' }}>Social Media</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <IconButton size="small" sx={{ color: '#3b82f6', p: 0, '&:hover': { opacity: 0.9 } }}>
                  <FacebookIcon />
                </IconButton>
                <IconButton size="small" sx={{ color: '#3b82f6', p: 0, '&:hover': { opacity: 0.9 } }}>
                  <TwitterIcon />
                </IconButton>
                <IconButton size="small" sx={{ p: 0, '&:hover': { opacity: 0.9 } }}>
                  <Box sx={{
                    display: 'flex',
                    borderRadius: '50%',
                    color: 'transparent',
                    '& svg': { fill: 'url(#ig-gradient)' }
                  }}>
                    <InstagramIcon />
                    <svg width="0" height="0">
                      <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop stopColor="#f59e0b" offset="0%" />
                        <stop stopColor="#ec4899" offset="50%" />
                        <stop stopColor="#8b5cf6" offset="100%" />
                      </linearGradient>
                    </svg>
                  </Box>
                </IconButton>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography sx={{ fontWeight: 600, mb: 3, color: 'white' }}>Newsletter Signup to</Typography>
              <Box sx={{ display: 'flex', bgcolor: '#1A1C23', borderRadius: 6, p: 0.5, border: '1px solid rgba(255,255,255,0.05)' }}>
                <TextField
                  placeholder="Email address"
                  variant="standard"
                  InputProps={{ disableUnderline: true }}
                  sx={{ flex: 1, px: 2, '& input': { color: 'white', py: 1.5, fontSize: '0.9rem' } }}
                />
                <Button variant="contained" sx={{
                  bgcolor: '#3b82f6',
                  color: 'white',
                  borderRadius: 6,
                  px: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
                }}>
                  Subscribe
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', pt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: BRAND.textSecondary }}>
              © 2024 EduSphere Inc.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: BRAND.primary }} />
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: BRAND.secondary }} />
            </Box>
          </Box>
        </Container>
        <Box sx={{ width: '100%', overflow: 'hidden', lineHeight: 0 }}>
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '80px' }}>
            <path fill={BRAND.background} d="M0,224L48,213.3C96,203,192,181,288,165.3C384,149,480,139,576,117.3C672,96,768,64,864,64C960,64,1056,96,1152,122.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </Box>
      </Box>
    </Box>
  );
};

export default LandingPage;
