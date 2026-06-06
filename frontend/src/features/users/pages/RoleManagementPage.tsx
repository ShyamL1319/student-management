import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  Snackbar,
  Chip,
  Grid,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Tooltip,
  Avatar,
  CircularProgress,
  RadioGroup,
  Radio,
  InputAdornment,
} from '@mui/material';
import {
  Edit as EditIcon,
  Security as SecurityIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Shield as ShieldIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  SupervisorAccount as SupervisorAccountIcon,
  School as SchoolIcon,
  Group as GroupIcon,
  AdminPanelSettings as AdminIcon,
  ManageAccounts as ManageAccountsIcon,
} from '@mui/icons-material';
import { usersApi, type User } from '../usersApi';
import { roleApi, type Role } from '../roleApi';

// Role icon map
const getRoleIcon = (roleName: string) => {
  switch (roleName) {
    case 'SUPER_ADMIN': return <AdminIcon />;
    case 'ADMIN': return <ManageAccountsIcon />;
    case 'TEACHER': return <SchoolIcon />;
    case 'STAFF': return <SupervisorAccountIcon />;
    case 'STUDENT': return <PersonIcon />;
    default: return <GroupIcon />;
  }
};

const roleColorHex: Record<string, { bg: string; border: string; text: string }> = {
  SUPER_ADMIN: { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626' },
  ADMIN:       { bg: '#fffbeb', border: '#fcd34d', text: '#d97706' },
  TEACHER:     { bg: '#eff6ff', border: '#93c5fd', text: '#2563eb' },
  STAFF:       { bg: '#f0f9ff', border: '#7dd3fc', text: '#0284c7' },
  STUDENT:     { bg: '#f0fdf4', border: '#86efac', text: '#16a34a' },
};

const getColorHex = (name: string) =>
  roleColorHex[name] || { bg: '#f8fafc', border: '#cbd5e1', text: '#475569' };

export const RoleManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState(false);

  // Assign Role Dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [roleSearchQuery, setRoleSearchQuery] = useState('');

  // User search
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Create Role Dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [submittingRole, setSubmittingRole] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        usersApi.getUsers(),
        roleApi.getRoles(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch {
      setSnackbar({ open: true, message: 'Failed to fetch data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  // Count how many users are in each role
  const usersPerRole = (roleId: string) =>
    users.filter((u) => {
      if (!u.role) return false;
      if (typeof u.role === 'string') return u.role === roleId;
      return u.role._id === roleId;
    }).length;

  const handleAssignClick = (user: User) => {
    setSelectedUser(user);
    let currentRoleId = '';
    if (user.role) {
      currentRoleId = typeof user.role === 'string' ? user.role : user.role._id;
    }
    setSelectedRoleId(currentRoleId);
    setRoleSearchQuery('');
    setAssignDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser || !selectedRoleId) return;
    try {
      setSavingRole(true);
      await usersApi.updateUserRole(selectedUser._id, selectedRoleId);
      setSnackbar({ open: true, message: 'User role updated successfully', severity: 'success' });
      setAssignDialogOpen(false);
      fetchData();
    } catch {
      setSnackbar({ open: true, message: 'Failed to update role', severity: 'error' });
    } finally {
      setSavingRole(false);
    }
  };

  const handleCreateRole = async () => {
    const formattedName = newRoleName.trim().toUpperCase().replace(/\s+/g, '_');
    if (!formattedName) {
      setSnackbar({ open: true, message: 'Role name cannot be empty', severity: 'error' });
      return;
    }
    try {
      setSubmittingRole(true);
      await roleApi.createRole({ name: formattedName, description: newRoleDesc.trim() });
      setSnackbar({ open: true, message: 'Role created successfully', severity: 'success' });
      setCreateDialogOpen(false);
      setNewRoleName('');
      setNewRoleDesc('');
      fetchData();
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setSnackbar({ open: true, message: axiosError.response?.data?.message || 'Failed to create role', severity: 'error' });
    } finally {
      setSubmittingRole(false);
    }
  };

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    const systemRoles = ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STAFF', 'STUDENT'];
    if (systemRoles.includes(roleName)) {
      setSnackbar({ open: true, message: 'System protected roles cannot be deleted', severity: 'error' });
      return;
    }
    if (!window.confirm(`Are you sure you want to delete the role "${roleName}"?`)) return;
    try {
      await roleApi.deleteRole(roleId);
      setSnackbar({ open: true, message: 'Role deleted successfully', severity: 'success' });
      fetchData();
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setSnackbar({ open: true, message: axiosError.response?.data?.message || 'Failed to delete role', severity: 'error' });
    }
  };

  const getRoleName = (role: string | { name: string } | null | undefined) => {
    if (!role) return 'No Role';
    return typeof role === 'string' ? role : role.name || 'No Role';
  };

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();

  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(roleSearchQuery.toLowerCase())
  );

  const filteredUsers = users.filter((u) => {
    const q = userSearchQuery.toLowerCase().trim();
    if (!q) return true;
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    return fullName.includes(q) || u.email.toLowerCase().includes(q);
  });

  const selectedRoleObj = roles.find((r) => r._id === selectedRoleId);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* ── Page Header ── */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
          borderRadius: 3,
          p: 3,
          boxShadow: '0 4px 20px rgba(21,101,192,0.35)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48, height: 48, borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ShieldIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography variant="h5" component="h1" fontWeight="bold" letterSpacing={-0.5}>
              Role &amp; Access Management
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.25 }}>
              Assign roles to users and manage organisation-wide access permissions.
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{
            bgcolor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)',
            fontWeight: 'bold',
            color: 'white',
            px: 2.5,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)', transform: 'translateY(-1px)', boxShadow: 4 },
            transition: 'all 0.2s',
          }}
        >
          New Role
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* ── Left: Users Table ── */}
        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" fontWeight="bold">User Role Assignments</Typography>
                  <Chip
                    label={
                      userSearchQuery
                        ? `${filteredUsers.length} of ${users.length}`
                        : `${users.length} users`
                    }
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              }
              subheader="Search a user, then click Assign Role to change their access"
            />
            <Divider />

            {/* ── User Search Bar ── */}
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by name or email…"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: userSearchQuery ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setUserSearchQuery('')} edge="end">
                        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary', lineHeight: 1 }}>✕</Typography>
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'grey.50',
                  },
                }}
              />
            </Box>

            <CardContent sx={{ p: 0 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <TableContainer>
                  <Table aria-label="user roles table">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>User</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Assigned Role</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }} align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredUsers.map((user) => {
                        const roleName = getRoleName(user.role);
                        const colors = getColorHex(roleName);
                        return (
                          <TableRow key={user._id} hover sx={{ transition: 'background-color 0.15s' }}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar
                                  sx={{
                                    width: 36, height: 36,
                                    bgcolor: colors.border,
                                    color: colors.text,
                                    fontWeight: 700, fontSize: '0.8rem',
                                  }}
                                >
                                  {getInitials(user.firstName, user.lastName)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>
                                    {user.firstName} {user.lastName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={getRoleIcon(roleName)}
                                label={roleName}
                                size="small"
                                sx={{
                                  bgcolor: colors.bg,
                                  color: colors.text,
                                  border: `1px solid ${colors.border}`,
                                  fontWeight: 600,
                                  '& .MuiChip-icon': { color: colors.text },
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                size="small"
                                variant="contained"
                                disableElevation
                                startIcon={<EditIcon fontSize="small" />}
                                onClick={() => handleAssignClick(user)}
                                sx={{
                                  fontWeight: 600,
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  bgcolor: 'primary.main',
                                  '&:hover': { bgcolor: 'primary.dark' },
                                }}
                              >
                                Assign Role
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {filteredUsers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                            {userSearchQuery ? (
                              <Box>
                                <Typography color="text.secondary" fontWeight={600}>
                                  No users match &ldquo;{userSearchQuery}&rdquo;
                                </Typography>
                                <Typography variant="caption" color="text.disabled">
                                  Try a different name or email address
                                </Typography>
                              </Box>
                            ) : (
                              <Typography color="text.secondary">No users found.</Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Right: Roles Panel ── */}
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" fontWeight="bold">Roles &amp; Members</Typography>
                  <Chip label={`${roles.length} roles`} size="small" color="default" variant="outlined" />
                </Box>
              }
              subheader="Expand any role to see which users are assigned to it"
              action={
                <Tooltip title="Create new role">
                  <IconButton onClick={() => setCreateDialogOpen(true)} color="primary" size="small" sx={{ mt: 0.5 }}>
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <Divider />
            <CardContent sx={{ px: 0, py: 0 }}>
              <List disablePadding>
                {roles.map((role, idx) => {
                  const systemRoles = ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STAFF', 'STUDENT'];
                  const isSystem = systemRoles.includes(role.name);
                  const colors = getColorHex(role.name);
                  // Users that belong to this role
                  const roleMembers = users.filter((u) => {
                    if (!u.role) return false;
                    if (typeof u.role === 'string') return u.role === role._id;
                    return (u.role as { _id: string })._id === role._id;
                  });
                  const count = roleMembers.length;
                  return (
                    <React.Fragment key={role._id}>
                      <ListItem
                        sx={{
                          py: 2, px: 3,
                          '&:hover': { bgcolor: 'grey.50' },
                          transition: 'background-color 0.15s',
                        }}
                      >
                        <Box
                          sx={{
                            width: 40, height: 40, borderRadius: 2,
                            bgcolor: colors.bg, border: `1px solid ${colors.border}`,
                            color: colors.text,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            mr: 2, flexShrink: 0,
                          }}
                        >
                          {getRoleIcon(role.name)}
                        </Box>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography fontWeight={700} variant="body2" sx={{ color: colors.text }}>
                                {role.name}
                              </Typography>
                              {isSystem && (
                                <Chip label="System" size="small" sx={{ height: 16, fontSize: '0.65rem', px: 0.5 }} />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75 }}>
                                {role.description || 'No description provided.'}
                              </Typography>

                              {/* Member avatars */}
                              {count === 0 ? (
                                <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                                  No users assigned
                                </Typography>
                              ) : (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {roleMembers.slice(0, 5).map((member) => (
                                    <Tooltip
                                      key={member._id}
                                      title={`${member.firstName} ${member.lastName} · ${member.email}`}
                                      arrow
                                    >
                                      <Box
                                        sx={{
                                          display: 'flex', alignItems: 'center', gap: 0.5,
                                          bgcolor: colors.bg,
                                          border: `1px solid ${colors.border}`,
                                          borderRadius: 4,
                                          pr: 1, pl: 0.5, py: 0.25,
                                          cursor: 'default',
                                        }}
                                      >
                                        <Avatar
                                          sx={{
                                            width: 18, height: 18,
                                            bgcolor: colors.border,
                                            color: colors.text,
                                            fontSize: '0.55rem',
                                            fontWeight: 700,
                                          }}
                                        >
                                          {getInitials(member.firstName, member.lastName)}
                                        </Avatar>
                                        <Typography variant="caption" sx={{ color: colors.text, fontWeight: 600, fontSize: '0.65rem' }}>
                                          {member.firstName} {member.lastName}
                                        </Typography>
                                      </Box>
                                    </Tooltip>
                                  ))}
                                  {count > 5 && (
                                    <Box
                                      sx={{
                                        display: 'flex', alignItems: 'center',
                                        bgcolor: 'grey.100', border: '1px solid', borderColor: 'divider',
                                        borderRadius: 4, px: 1, py: 0.25,
                                      }}
                                    >
                                      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.65rem' }}>
                                        +{count - 5} more
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              )}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          {!isSystem ? (
                            <Tooltip title="Delete role">
                              <IconButton edge="end" color="error" size="small" onClick={() => handleDeleteRole(role._id, role.name)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Protected system role">
                              <span>
                                <IconButton edge="end" size="small" disabled>
                                  <SecurityIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                      {idx < roles.length - 1 && <Divider sx={{ mx: 2 }} />}
                    </React.Fragment>
                  );
                })}
                {roles.length === 0 && !loading && (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography color="text.secondary">No roles defined yet.</Typography>
                  </Box>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Full-width Role Members Summary ── */}
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">Role Members Overview</Typography>
          <Chip label="All Roles" size="small" color="default" variant="outlined" />
        </Box>
        <Grid container spacing={2}>
          {roles.map((role) => {
            const colors = getColorHex(role.name);
            const roleMembers = users.filter((u) => {
              if (!u.role) return false;
              if (typeof u.role === 'string') return u.role === role._id;
              return (u.role as { _id: string })._id === role._id;
            });
            return (
              <Grid item xs={12} sm={6} md={4} key={role._id}>
                <Card
                  elevation={0}
                  sx={{
                    border: '2px solid',
                    borderColor: roleMembers.length > 0 ? colors.border : 'divider',
                    borderRadius: 3,
                    height: '100%',
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: 3 },
                  }}
                >
                  {/* Role Card Header */}
                  <Box
                    sx={{
                      px: 2.5, py: 1.75,
                      bgcolor: colors.bg,
                      borderBottom: '1px solid',
                      borderColor: colors.border,
                      display: 'flex', alignItems: 'center', gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 34, height: 34, borderRadius: 1.5,
                        bgcolor: 'white',
                        border: `1px solid ${colors.border}`,
                        color: colors.text,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {getRoleIcon(role.name)}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={700} sx={{ color: colors.text }}>
                        {role.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {roleMembers.length} {roleMembers.length === 1 ? 'member' : 'members'}
                      </Typography>
                    </Box>
                    <Chip
                      label={roleMembers.length}
                      size="small"
                      sx={{ bgcolor: colors.border, color: colors.text, fontWeight: 700, minWidth: 28 }}
                    />
                  </Box>

                  {/* Member list */}
                  <CardContent sx={{ p: 0 }}>
                    {roleMembers.length === 0 ? (
                      <Box sx={{ py: 3, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.disabled" fontStyle="italic">
                          No users assigned
                        </Typography>
                      </Box>
                    ) : (
                      <List disablePadding dense>
                        {roleMembers.map((member, mi) => (
                          <React.Fragment key={member._id}>
                            <ListItem sx={{ px: 2.5, py: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                                <Avatar
                                  sx={{
                                    width: 30, height: 30,
                                    bgcolor: colors.bg,
                                    border: `1px solid ${colors.border}`,
                                    color: colors.text,
                                    fontSize: '0.65rem', fontWeight: 700,
                                  }}
                                >
                                  {getInitials(member.firstName, member.lastName)}
                                </Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="body2" fontWeight={600} noWrap>
                                    {member.firstName} {member.lastName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                                    {member.email}
                                  </Typography>
                                </Box>
                                <Tooltip title="Change role">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleAssignClick(member)}
                                    sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                                  >
                                    <EditIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </ListItem>
                            {mi < roleMembers.length - 1 && <Divider sx={{ mx: 2.5 }} />}
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* ════════════════════════════════════════
          ASSIGN ROLE DIALOG  — Premium Role Picker
      ════════════════════════════════════════ */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => !savingRole && setAssignDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        {/* Dialog Header */}
        <Box
          sx={{
            px: 3, py: 2.5,
            background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
            color: 'white',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 44, height: 44,
                bgcolor: 'rgba(255,255,255,0.2)',
                fontWeight: 700, fontSize: '1rem',
              }}
            >
              {getInitials(selectedUser?.firstName ?? '', selectedUser?.lastName ?? '')}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Assign Role
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {selectedUser?.firstName} {selectedUser?.lastName} &middot; {selectedUser?.email}
              </Typography>
            </Box>
          </Box>

          {/* Current role indicator */}
          {selectedRoleObj && (
            <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>Current role:</Typography>
              <Chip
                label={getRoleName(selectedUser?.role)}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, height: 20, fontSize: '0.7rem' }}
              />
              {selectedRoleId !== (
                typeof selectedUser?.role === 'string' ? selectedUser.role : (selectedUser?.role as { _id: string })?._id
              ) && (
                <>
                  <Typography variant="caption" sx={{ opacity: 0.6 }}>→ will change to:</Typography>
                  <Chip
                    label={selectedRoleObj.name}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.35)', color: 'white', fontWeight: 700, height: 20, fontSize: '0.7rem' }}
                  />
                </>
              )}
            </Box>
          )}
        </Box>

        <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
          {/* Search */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search roles…"
            value={roleSearchQuery}
            onChange={(e) => setRoleSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* Role cards as radio group */}
          <RadioGroup
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {filteredRoles.map((role) => {
                const isSelected = selectedRoleId === role._id;
                const colors = getColorHex(role.name);
                const count = usersPerRole(role._id);
                const currentRoleId = typeof selectedUser?.role === 'string'
                  ? selectedUser.role
                  : (selectedUser?.role as { _id: string })?._id;
                const isCurrent = role._id === currentRoleId;

                return (
                  <Box
                    key={role._id}
                    onClick={() => setSelectedRoleId(role._id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: isSelected ? colors.border : 'divider',
                      bgcolor: isSelected ? colors.bg : 'background.paper',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        borderColor: colors.border,
                        bgcolor: colors.bg,
                        transform: 'translateX(2px)',
                      },
                    }}
                  >
                    {/* Role icon */}
                    <Box
                      sx={{
                        width: 42, height: 42, borderRadius: 2,
                        bgcolor: isSelected ? colors.border : 'grey.100',
                        color: isSelected ? colors.text : 'text.secondary',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, transition: 'all 0.15s',
                      }}
                    >
                      {getRoleIcon(role.name)}
                    </Box>

                    {/* Role info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                        <Typography variant="body2" fontWeight={700} sx={{ color: isSelected ? colors.text : 'text.primary' }}>
                          {role.name}
                        </Typography>
                        {isCurrent && (
                          <Chip label="Current" size="small" color="default" sx={{ height: 16, fontSize: '0.65rem' }} />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block" noWrap>
                        {role.description || 'No description provided.'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {count} {count === 1 ? 'user' : 'users'} assigned
                      </Typography>
                    </Box>

                    {/* Radio / check */}
                    <Box sx={{ flexShrink: 0, color: isSelected ? colors.text : 'text.disabled' }}>
                      {isSelected
                        ? <CheckCircleIcon fontSize="small" />
                        : <Radio value={role._id} size="small" sx={{ p: 0 }} />
                      }
                    </Box>
                  </Box>
                );
              })}

              {filteredRoles.length === 0 && (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No roles match your search.
                  </Typography>
                </Box>
              )}
            </Box>
          </RadioGroup>
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => setAssignDialogOpen(false)}
            disabled={savingRole}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveRole}
            variant="contained"
            disabled={
              savingRole ||
              !selectedRoleId ||
              selectedRoleId === (typeof selectedUser?.role === 'string'
                ? selectedUser.role
                : (selectedUser?.role as { _id: string })?._id)
            }
            startIcon={savingRole ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3 }}
          >
            {savingRole ? 'Saving…' : 'Confirm Assignment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Create Role Dialog ── */}
      <Dialog
        open={createDialogOpen}
        onClose={() => !submittingRole && setCreateDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>Create New Role</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Define a new access role. The name will be auto-formatted to uppercase (e.g. <code>LIBRARIAN</code>).
            </Typography>
            <TextField
              fullWidth
              label="Role Name"
              placeholder="e.g. LIBRARIAN"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value.toUpperCase())}
              variant="outlined"
              helperText="Use clear, descriptive names. Spaces become underscores."
            />
            <TextField
              fullWidth
              label="Description (optional)"
              placeholder="e.g. Manages school library catalogs"
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              variant="outlined"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 2 }}>
          <Button onClick={() => setCreateDialogOpen(false)} disabled={submittingRole} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateRole}
            variant="contained"
            disabled={submittingRole || !newRoleName.trim()}
            startIcon={submittingRole ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            {submittingRole ? 'Creating…' : 'Create Role'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};
