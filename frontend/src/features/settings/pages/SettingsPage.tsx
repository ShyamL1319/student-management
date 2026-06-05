import type { FC } from 'react';
import { Box, Typography, Paper, TextField, Button, Grid, FormControlLabel, Switch } from '@mui/material';

export const SettingsPage: FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        System Settings
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>General Information</Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="School Name" defaultValue="Springfield High School" variant="outlined" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Contact Email" defaultValue="admin@springfield.edu" variant="outlined" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Address" defaultValue="123 Education Lane, Springfield" variant="outlined" />
          </Grid>
        </Grid>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" color="primary">Save Changes</Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Preferences</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel control={<Switch defaultChecked />} label="Enable Email Notifications" />
          <FormControlLabel control={<Switch />} label="Enable SMS Alerts" />
          <FormControlLabel control={<Switch defaultChecked />} label="Auto-backup Database Weekly" />
        </Box>
      </Paper>
    </Box>
  );
};

