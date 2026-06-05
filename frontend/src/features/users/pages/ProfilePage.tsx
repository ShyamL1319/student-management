import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Tabs,
  Tab,
  TextField,
  Avatar,
  Grid,
  Divider,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import { Edit as EditIcon, PhotoCamera as PhotoCameraIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usersApi, type User, type UpdateProfileDto } from '../usersApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const ProfilePage: React.FC = () => {
  const { user: authUser, logout, login } = useAuth();
  const navigate = useNavigate();
  const [value, setValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<User | null>(null);
  const [formData, setFormData] = useState<UpdateProfileDto>({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await usersApi.getProfile();
      setProfile(data);
      setFormData({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || '',
        address: data.address || '',
      });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to fetch profile', severity: 'error' });
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const updatedUser = await usersApi.updateProfile(formData);
      setProfile(updatedUser);
      setIsEditing(false);
      setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
      // Update local auth context user if needed
      // login(updatedUser); 
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!profile) return <Typography sx={{ m: 4 }}>Loading profile...</Typography>;

  const userRole = typeof profile.role === 'string' ? profile.role : profile.role?.name;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Left Column - Avatar & Basic Info */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                src={profile.avatar}
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2, fontSize: '3rem' }}
              >
                {profile.firstName[0]}{profile.lastName[0]}
              </Avatar>
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 0,
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                <input hidden accept="image/*" type="file" />
                <PhotoCameraIcon />
              </IconButton>
            </Box>
            <Typography variant="h5" gutterBottom>
              {profile.firstName} {profile.lastName}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {userRole}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Member since {new Date(profile.createdAt).toLocaleDateString()}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={handleLogout}
              sx={{ mt: 2 }}
            >
              Logout
            </Button>
          </Paper>
        </Grid>

        {/* Right Column - Tabs & Details */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ height: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={value} onChange={handleTabChange} aria-label="profile tabs">
                <Tab label="Personal Info" id="profile-tab-0" />
                <Tab label="Security" id="profile-tab-1" />
                <Tab label="Settings" id="profile-tab-2" />
              </Tabs>
            </Box>

            <TabPanel value={value} index={0}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Personal Information</Typography>
                {!isEditing ? (
                  <Button startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                ) : (
                  <Box>
                    <Button
                      startIcon={<SaveIcon />}
                      variant="contained"
                      onClick={handleSave}
                      sx={{ mr: 1 }}
                    >
                      Save
                    </Button>
                    <Button startIcon={<CancelIcon />} onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={value} index={1}>
              <Typography variant="h6" gutterBottom>Security Settings</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Keep your account secure by using a strong password.
                </Typography>
                <Button variant="outlined" sx={{ mb: 4 }}>Change Password</Button>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" gutterBottom>Two-Factor Authentication</Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Add an extra layer of security to your account. (Coming Soon)
                </Typography>
                <Button variant="outlined" disabled>Enable 2FA</Button>
              </Box>
            </TabPanel>

            <TabPanel value={value} index={2}>
              <Typography variant="h6" gutterBottom>Account Settings</Typography>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Language"
                    value="en"
                    SelectProps={{ native: true }}
                    variant="outlined"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Theme"
                    value="light"
                    SelectProps={{ native: true }}
                    variant="outlined"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System Default</option>
                  </TextField>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};
