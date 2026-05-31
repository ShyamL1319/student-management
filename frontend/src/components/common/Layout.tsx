import type { FC, ReactNode } from 'react';
import { Box, Toolbar } from '@mui/material';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

export const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header drawerWidth={drawerWidth} />
      
      {isAuthenticated && <Sidebar />}
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${isAuthenticated ? drawerWidth : 0}px)` },
        }}
      >
        <Toolbar /> {/* This is necessary to push content below the fixed AppBar */}
        {children}
      </Box>
    </Box>
  );
};

