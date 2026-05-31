import React from 'react';
import { Box, Typography, Container, Paper, Button } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return <Typography>Loading profile...</Typography>;

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Typography component="h1" variant="h5" gutterBottom>
          Profile
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1"><strong>Email:</strong> {user.email}</Typography>
          <Typography variant="body1"><strong>Name:</strong> {user.firstName} {user.lastName}</Typography>
          <Typography variant="body1"><strong>Role:</strong> {user.role?.name}</Typography>
          <Button variant="outlined" color="secondary" onClick={handleLogout} sx={{ mt: 4 }}>
            Logout
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};
