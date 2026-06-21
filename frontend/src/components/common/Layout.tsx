import type { FC, ReactNode } from 'react';
import { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

export const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const publicPaths = ['/', '/login', '/forgot-password', '/reset-password'];
  const isPublicPath = publicPaths.includes(location.pathname);

  if (!isAuthenticated || isPublicPath) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: (theme) => theme.palette.background.default,
          color: (theme) => theme.palette.text.primary,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: (theme) => theme.palette.background.default,
        color: (theme) => theme.palette.text.primary,
      }}
    >
      <Header drawerWidth={drawerWidth} onDrawerToggle={handleDrawerToggle} />
      
      <Sidebar
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        onDrawerToggle={handleDrawerToggle}
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          maxWidth: '100%',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

