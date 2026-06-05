import type { FC } from 'react';
import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Box,
  Button,
  Avatar,
  Divider,
  Tooltip,
  InputBase,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Search as SearchIcon,
  Add as AddIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  drawerWidth: number;
  onDrawerToggle: () => void;
}

export const Header: FC<HeaderProps> = ({ onDrawerToggle }) => {
  const { logout, isAuthenticated, user } = useAuth();
  const { mode, toggleThemeMode } = useThemeMode();
  const navigate = useNavigate();

  // Popover Anchor States
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const [actionsAnchor, setActionsAnchor] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);

  const handleProfileOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchor(event.currentTarget);
  };
  const handleProfileClose = () => {
    setProfileAnchor(null);
  };

  const handleActionsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setActionsAnchor(event.currentTarget);
  };
  const handleActionsClose = () => {
    setActionsAnchor(null);
  };

  const handleNotifOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchor(event.currentTarget);
  };
  const handleNotifClose = () => {
    setNotifAnchor(null);
  };

  const handleLogout = () => {
    handleProfileClose();
    logout();
    navigate('/login');
  };

  const handleProfileRedirect = () => {
    handleProfileClose();
    navigate('/profile');
  };

  const handleSettingsRedirect = () => {
    handleProfileClose();
    navigate('/settings');
  };

  // Extract User Info
  const userTyped = user as any;
  const firstName = userTyped?.firstName || '';
  const lastName = userTyped?.lastName || '';
  const email = userTyped?.email || '';
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'U';

  const roleName = userTyped?.role
    ? typeof userTyped.role === 'string'
      ? userTyped.role
      : userTyped.role.name
    : '';

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: (theme) => theme.palette.background.paper,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        color: (theme) => theme.palette.text.primary,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1.5, sm: 3 } }}>
        {/* Left Side: Drawer Toggle & Brand Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isAuthenticated && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onDrawerToggle}
              sx={{ mr: 1.5, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Box
              sx={{
                height: 32,
                px: 1.25,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #0d9488 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                fontFamily: "'Outfit', sans-serif",
                mr: 1.5,
                letterSpacing: '0.5px',
              }}
            >
              PSEI
            </Box>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                letterSpacing: '-0.5px',
                display: { xs: 'none', sm: 'block' },
                background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: mode === 'light' ? 'transparent' : 'inherit',
              }}
            >
              PS Educational Institute
            </Typography>
          </Box>
        </Box>

        {/* Middle Side: Command Search */}
        {isAuthenticated && (
          <Box
            sx={{
              position: 'relative',
              borderRadius: '8px',
              backgroundColor: (theme) => alpha(theme.palette.text.primary, 0.05),
              '&:hover': {
                backgroundColor: (theme) => alpha(theme.palette.text.primary, 0.08),
              },
              marginRight: 2,
              marginLeft: 3,
              width: '100%',
              maxWidth: 400,
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ p: '8px 12px', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: 'text.secondary' }}>
              <SearchIcon fontSize="small" />
            </Box>
            <InputBase
              placeholder="Search directory... (⌘K)"
              sx={{
                color: 'inherit',
                width: '100%',
                '& .MuiInputBase-input': {
                  p: '6px 8px 6px 0',
                  fontSize: '0.875rem',
                  width: '100%',
                },
              }}
            />
          </Box>
        )}

        {/* Right Side: Quick Action, Toggle, Notif, Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 } }}>
          {isAuthenticated && (
            <>
              {/* Quick Actions (Desktop only) */}
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  endIcon={<ArrowDropDownIcon />}
                  onClick={handleActionsOpen}
                  sx={{
                    borderColor: 'divider',
                    color: 'text.primary',
                    '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' },
                  }}
                >
                  Quick Action
                </Button>
                <Menu
                  anchorEl={actionsAnchor}
                  open={Boolean(actionsAnchor)}
                  onClose={handleActionsClose}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  slotProps={{
                    paper: {
                      sx: { width: 180, mt: 1, borderRadius: '12px' },
                    },
                  }}
                >
                  <MenuItem onClick={() => { handleActionsClose(); navigate('/students'); }}>Add Student</MenuItem>
                  <MenuItem onClick={() => { handleActionsClose(); navigate('/teachers'); }}>Add Teacher</MenuItem>
                  <MenuItem onClick={() => { handleActionsClose(); navigate('/fee-collections'); }}>Collect Fees</MenuItem>
                  <MenuItem onClick={() => { handleActionsClose(); navigate('/notifications'); }}>Send Notice</MenuItem>
                </Menu>
              </Box>

              {/* Theme Toggle */}
              <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
                <IconButton onClick={toggleThemeMode} color="inherit" size="medium">
                  {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
                </IconButton>
              </Tooltip>

              {/* Notifications */}
              <IconButton
                size="medium"
                aria-label="show new notifications"
                color="inherit"
                onClick={handleNotifOpen}
              >
                <Badge color="error" variant="dot">
                  <NotificationsIcon fontSize="small" />
                </Badge>
              </IconButton>
              <Menu
                anchorEl={notifAnchor}
                open={Boolean(notifAnchor)}
                onClose={handleNotifClose}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                slotProps={{
                  paper: {
                    sx: { width: 280, mt: 1, borderRadius: '12px', p: 1 },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Notifications</Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleNotifClose} sx={{ py: 1.5, borderRadius: '8px', my: 0.5 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Welcome to Apex Portal!</Typography>
                    <Typography variant="caption" color="text.secondary">System setup is fully completed.</Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={handleNotifClose} sx={{ py: 1.5, borderRadius: '8px', my: 0.5 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Fees invoice generated</Typography>
                    <Typography variant="caption" color="text.secondary">Term invoice for Fall 2026 ready.</Typography>
                  </Box>
                </MenuItem>
                <Divider />
                <Box sx={{ p: 0.5, display: 'flex', justifyContent: 'center' }}>
                  <Button size="small" onClick={() => { handleNotifClose(); navigate('/notifications'); }} fullWidth>
                    View All Notices
                  </Button>
                </Box>
              </Menu>

              {/* Profile Avatar Popover */}
              <Box>
                <IconButton
                  size="small"
                  aria-label="account of current user"
                  aria-haspopup="true"
                  onClick={handleProfileOpen}
                  sx={{ p: 0.5 }}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: '#10b981',
                        color: '#10b981',
                        boxShadow: `0 0 0 2px white`,
                        '&::after': {
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          animation: 'ripple 1.2s infinite ease-in-out',
                          border: '1px solid currentColor',
                          content: '""',
                        },
                      },
                      '@keyframes ripple': {
                        '0%': {
                          transform: 'scale(.8)',
                          opacity: 1,
                        },
                        '100%': {
                          transform: 'scale(2.4)',
                          opacity: 0,
                        },
                      },
                    }}
                  >
                    <Avatar
                      src={userTyped?.avatar}
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        bgcolor: 'primary.main',
                      }}
                    >
                      {initials}
                    </Avatar>
                  </Badge>
                </IconButton>
                
                <Menu
                  id="menu-appbar"
                  anchorEl={profileAnchor}
                  open={Boolean(profileAnchor)}
                  onClose={handleProfileClose}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  slotProps={{
                    paper: {
                      sx: {
                        width: 240,
                        mt: 1.5,
                        borderRadius: '12px',
                        p: 1.5,
                      },
                    },
                  }}
                >
                  {/* Popover Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, px: 0.5 }}>
                    <Avatar
                      src={userTyped?.avatar}
                      sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontSize: '1rem', fontWeight: 600 }}
                    >
                      {initials}
                    </Avatar>
                    <Box sx={{ overflow: 'hidden' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                        {firstName} {lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                        {email}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Role Tag */}
                  <Box sx={{ mb: 1.5, px: 0.5 }}>
                    <Box
                      sx={{
                        display: 'inline-block',
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText',
                        fontSize: '0.675rem',
                        fontWeight: 700,
                        borderRadius: '24px',
                        px: 1.5,
                        py: 0.25,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {roleName || 'Member'}
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />

                  {/* Options */}
                  <MenuItem onClick={handleProfileRedirect} sx={{ borderRadius: '8px', gap: 1.5, py: 1 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2">My Profile</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleSettingsRedirect} sx={{ borderRadius: '8px', gap: 1.5, py: 1 }}>
                    <SettingsIcon fontSize="small" color="action" />
                    <Typography variant="body2">Settings</Typography>
                  </MenuItem>
                  
                  <Divider sx={{ my: 1 }} />

                  <MenuItem
                    onClick={handleLogout}
                    sx={{
                      borderRadius: '8px',
                      gap: 1.5,
                      py: 1,
                      color: 'error.main',
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                      },
                    }}
                  >
                    <LogoutIcon fontSize="small" />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Sign Out</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
