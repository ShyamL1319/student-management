import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginThunk } from './authSlice';

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { token, status, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('');

  if (token) {
    return <Navigate to="/students" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await dispatch(loginThunk({ email, password }));

    if (loginThunk.fulfilled.match(result)) {
      navigate('/students');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        background: 'linear-gradient(135deg, #f7f8fa 0%, #e8f1ed 100%)',
      }}
    >
      <Paper elevation={1} sx={{ width: '100%', maxWidth: 420, p: 4 }}>
        <Stack component="form" spacing={3} onSubmit={handleSubmit}>
          <Stack spacing={1}>
            <Typography variant="h4" component="h1">
              Student Management
            </Typography>
            <Typography color="text.secondary">Sign in to manage student records.</Typography>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<LoginIcon />}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Signing in...' : 'Sign in'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
