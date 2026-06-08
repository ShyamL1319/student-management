import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, Paper, TextField, Button, Grid, FormControlLabel, Switch, CircularProgress, Alert, Snackbar } from '@mui/material';
import { settingsApi } from '../api/settings.api';

export const SettingsPage: FC = () => {
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    emailNotificationsEnabled: true,
    smsAlertsEnabled: false,
    autoBackupEnabled: true,
  });

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getSettings,
  });

  const mutation = useMutation({
    mutationFn: settingsApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setToastMessage('Settings updated successfully!');
      setToastOpen(true);
    },
  });

  useEffect(() => {
    if (data) {
      setFormValues({
        name: data.name || '',
        email: data.email || '',
        address: data.address || '',
        phone: data.phone || '',
        emailNotificationsEnabled: !!data.emailNotificationsEnabled,
        smsAlertsEnabled: !!data.smsAlertsEnabled,
        autoBackupEnabled: !!data.autoBackupEnabled,
      });
    }
  }, [data]);

  const handleChange = (field: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formValues);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Failed to load system settings. Please try again later.</Alert>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSave}>
      <Typography variant="h4" gutterBottom sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, mb: 3 }}>
        System Settings
      </Typography>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }} elevation={0}>
        <Typography variant="h6" gutterBottom sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, mb: 2.5 }}>
          General Information
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="School Name"
              value={formValues.name}
              onChange={(e) => handleChange('name', e.target.value)}
              variant="outlined"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Contact Email"
              type="email"
              value={formValues.email}
              onChange={(e) => handleChange('email', e.target.value)}
              variant="outlined"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Contact Phone"
              value={formValues.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              variant="outlined"
              required
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Address"
              value={formValues.address}
              onChange={(e) => handleChange('address', e.target.value)}
              variant="outlined"
              required
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }} elevation={0}>
        <Typography variant="h6" gutterBottom sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, mb: 2.5 }}>
          Preferences
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={formValues.emailNotificationsEnabled}
                onChange={(e) => handleChange('emailNotificationsEnabled', e.target.checked)}
              />
            }
            label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Enable Email Notifications</Typography>}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formValues.smsAlertsEnabled}
                onChange={(e) => handleChange('smsAlertsEnabled', e.target.checked)}
              />
            }
            label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Enable SMS Alerts</Typography>}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formValues.autoBackupEnabled}
                onChange={(e) => handleChange('autoBackupEnabled', e.target.checked)}
              />
            }
            label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Auto-backup Database Weekly</Typography>}
          />
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={mutation.isPending}
          sx={{ textTransform: 'none', fontWeight: 700, px: 3, py: 1.25, borderRadius: 2 }}
        >
          {mutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" sx={{ borderRadius: 2 }}>{toastMessage}</Alert>
      </Snackbar>
    </Box>
  );
};
