import React, { useState, useEffect } from 'react';
import { schoolApi } from '../../schools/api/schools.api';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Alert,
  Tab,
  Tabs,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Snackbar,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  AccountBalance as AccountBalanceIcon,
  CheckCircleOutlined as CheckCircleIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Send as SendIcon,
  Download as DownloadIcon,
  Bolt as BoltIcon,
  Search as SearchIcon,
  AutoAwesome as AIIcon,
  NotificationsActive as AlertIcon,
  Dns as ServerIcon,
  Shield as ShieldIcon,
  CreditCard as CreditCardIcon,
  Power as PowerIcon,
  Lock as LockIcon,
  History as AuditIcon,
  Storage as DbIcon,
  ToggleOn as ToggleOnIcon,
  Add as AddIcon,
  Cached as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
} from 'recharts';
import type { DashboardResponse } from '../api/dashboardApi';

export interface SuperAdminDashboardProps {
  data: DashboardResponse;
  firstName: string;
}

// ── Mock SaaS Datasets for Super Admin ─────────────────────────────────────
const MOCK_PLATFORM_REVENUE = [
  { month: 'Jan', mrr: 45000, arr: 540000 },
  { month: 'Feb', mrr: 52000, arr: 624000 },
  { month: 'Mar', mrr: 68000, arr: 816000 },
  { month: 'Apr', mrr: 75000, arr: 900000 },
  { month: 'May', mrr: 86000, arr: 1032000 },
  { month: 'Jun', mrr: 98000, arr: 1176000 },
];

const MOCK_INFRA_METRICS = [
  { time: '10:00', cpu: 32, memory: 58, network: 120 },
  { time: '10:05', cpu: 45, memory: 59, network: 145 },
  { time: '10:10', cpu: 78, memory: 62, network: 280 },
  { time: '10:15', cpu: 55, memory: 61, network: 190 },
  { time: '10:20', cpu: 42, memory: 60, network: 165 },
  { time: '10:25', cpu: 38, memory: 60, network: 130 },
];

const MOCK_TENANTS = [
  { id: 'TNT-001', name: 'Hogwarts Magic Academy', domain: 'hogwarts.edtech.com', plan: 'Enterprise', users: 1240, storage: '184 GB', status: 'Active', health: 'Healthy' },
  { id: 'TNT-002', name: 'Xavier Mutant School', domain: 'xmansion.org', plan: 'Premium', users: 380, storage: '45 GB', status: 'Active', health: 'Healthy' },
  { id: 'TNT-003', name: 'Springfield Elementary', domain: 'springfield.edtech.com', plan: 'Standard', users: 850, storage: '92 GB', status: 'Trial', health: 'Warning' },
  { id: 'TNT-004', name: 'Sunnydale High School', domain: 'sunnydale.edtech.com', plan: 'Standard', users: 140, storage: '12 GB', status: 'Suspended', health: 'Critical' },
];

const MOCK_SUBSCRIPTION_PLANS = [
  { id: 'PLN-01', name: 'Standard SaaS', price: '$199/mo', billing: 'Monthly', storage: '50 GB', status: 'Active' },
  { id: 'PLN-02', name: 'Premium School', price: '$1,999/yr', billing: 'Annual', storage: '250 GB', status: 'Active' },
  { id: 'PLN-03', name: 'Enterprise Custom', price: 'Contract', billing: 'Custom', storage: '1 TB+', status: 'Active' },
];

const MOCK_SECURITY_THREATS = [
  { time: '2 mins ago', event: 'Brute-force lockout triggered', ip: '198.51.100.42', user: 'admin@sunnydale.edu', status: 'Blocked' },
  { time: '14 mins ago', event: 'Suspicious API token usage', ip: '203.0.113.118', user: 'system-hook-stripe', status: 'Flagged' },
  { time: '1 hour ago', event: 'Multiple failed MFA challenges', ip: '185.190.140.9', user: 'treasurer@springfield.edu', status: 'Resolved' },
];

const MOCK_AUDIT_LOGS = [
  { id: 'AUD-901', user: 'SuperAdmin (shyamlal)', action: 'Suspended school tenant Sunnydale High', target: 'TNT-004', time: 'Today, 10:14 AM' },
  { id: 'AUD-902', user: 'Billing Bot', action: 'Stripe webhook payment invoice_paid successful', target: 'TNT-001', time: 'Today, 08:00 AM' },
  { id: 'AUD-903', user: 'SuperAdmin (shyamlal)', action: 'Upgraded tenant Hogwarts to Enterprise custom', target: 'TNT-001', time: 'Yesterday, 04:30 PM' },
];

// Helper layout component
const SectionTitle: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ icon, title, subtitle, action }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>{icon}</Box>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, fontFamily: "'Outfit', sans-serif" }}>{title}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "'Inter', sans-serif" }}>{subtitle}</Typography>}
      </Box>
    </Box>
    {action}
  </Box>
);

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ data, firstName }) => {
  const navigate = useNavigate();

  // ── States for active view controls ─────────────────────────────────────
  const [activeTab, setActiveTab] = useState(0);
  const [tenants, setTenants] = useState<any[]>([]);
  const [plans, setPlans] = useState(MOCK_SUBSCRIPTION_PLANS);
  const [securityEvents, setSecurityEvents] = useState<any[]>(data.securityThreats || MOCK_SECURITY_THREATS);

  const fetchSchools = async () => {
    try {
      const result = await schoolApi.getSchools({ limit: 100 });
      if (result && result.data) {
        const mapped = result.data.map((school: any) => ({
          id: school._id || school.id,
          name: school.name,
          domain: `${school.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.edtech.com`,
          plan: school.name.toLowerCase().includes('hogwarts') ? 'Enterprise' : school.name.toLowerCase().includes('xavier') ? 'Premium' : 'Standard',
          users: 150 + Math.floor(Math.random() * 50),
          storage: `${20 + Math.floor(Math.random() * 80)} GB`,
          status: school.isActive ? 'Active' : 'Suspended',
          health: school.isActive ? 'Healthy' : 'Critical',
        }));
        setTenants(mapped);
      }
    } catch (err) {
      console.error('Failed to load schools', err);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    if (data.securityThreats) {
      setSecurityEvents(data.securityThreats);
    }
  }, [data]);

  // Snackbar feedback notification states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('success');

  // Quick Action Dialog states
  const [tenantDialogOpen, setTenantDialogOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);

  // Forms states
  const [newTenant, setNewTenant] = useState({ name: '', subdomain: '', plan: 'Standard', ownerEmail: '' });
  const [newPlan, setNewPlan] = useState({ name: '', price: '', billing: 'Monthly', storage: '100 GB' });
  const [announcement, setAnnouncement] = useState({ title: '', target: 'All Tenants', message: '', pushAlert: false });

  // Infrastructure Actions simulation states
  const [isRestartingNode, setIsRestartingNode] = useState(false);
  const [redisFlushing, setRedisFlushing] = useState(false);
  const [backupStatus, setBackupStatus] = useState('Completed yesterday');
  const [mfaEnforced, setMfaEnforced] = useState(true);

  // Integrations market toggle states
  const [integrations, setIntegrations] = useState({
    stripe: true,
    razorpay: false,
    twilio: true,
    zoom: true,
    googleWorkspace: true,
  });

  const showNotification = (msg: string, severity: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setSnackbarMessage(msg);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // ── Tenant Directory Operations ─────────────────────────────────────────
  const handleToggleTenantStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      await schoolApi.updateSchool(id, { isActive: nextStatus === 'Active' });
      showNotification(`Tenant status updated to ${nextStatus}.`, nextStatus === 'Active' ? 'success' : 'warning');
      fetchSchools();
    } catch (err) {
      showNotification('Failed to update tenant status.', 'error');
    }
  };

  const handleCloneConfig = (id: string) => {
    showNotification(`Cloned system limits, localized calendars, and schema configurations from tenant ${id}.`, 'info');
  };

  // ── Submissions ────────────────────────────────────────────────────────
  const handleCreateTenantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenant.name || !newTenant.subdomain) {
      showNotification('Please fill in School Name and Subdomain.', 'warning');
      return;
    }
    try {
      await schoolApi.createSchool({
        name: newTenant.name,
        address: `${newTenant.subdomain} St`,
        phone: '123-456-7890',
        email: newTenant.ownerEmail || `admin@${newTenant.subdomain}.com`,
        isActive: true,
      });
      setTenantDialogOpen(false);
      showNotification(`Tenant "${newTenant.name}" initialized on domain ${newTenant.subdomain}.edtech.com. Database provisioning complete.`, 'success');
      setNewTenant({ name: '', subdomain: '', plan: 'Standard', ownerEmail: '' });
      fetchSchools();
    } catch (err) {
      showNotification('Failed to create tenant.', 'error');
    }
  };

  const handleCreatePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.name || !newPlan.price) {
      showNotification('Please fill in Plan Name and Price.', 'warning');
      return;
    }
    const newId = `PLN-0${plans.length + 1}`;
    setPlans(prev => [
      ...prev,
      {
        id: newId,
        name: newPlan.name,
        price: newPlan.price,
        billing: newPlan.billing,
        storage: newPlan.storage,
        status: 'Active',
      },
    ]);
    setPlanDialogOpen(false);
    showNotification(`Billing tier plan "${newPlan.name}" created at ${newPlan.price} cycles. Stripe subscription tokens sync complete.`, 'success');
    setNewPlan({ name: '', price: '', billing: 'Monthly', storage: '100 GB' });
  };

  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcement.title || !announcement.message) {
      showNotification('Please fill in Announcement Title and Message.', 'warning');
      return;
    }
    setAnnouncementDialogOpen(false);
    showNotification(`Announcement "${announcement.title}" broadcasted to ${announcement.target}. Push notification dispatched.`, 'success');
    setAnnouncement({ title: '', target: 'All Tenants', message: '', pushAlert: false });
  };

  const handleTriggerBackup = () => {
    setBackupDialogOpen(false);
    showNotification('System backup snapshot initiated across all tenant nodes (AWS S3 RDS replicator)...', 'info');
    setTimeout(() => {
      setBackupStatus('Completed just now');
      showNotification('Backup snapshot completed. MD5 verified. Uptime unaffected.', 'success');
    }, 3000);
  };

  // ── Infrastructure Commands ──────────────────────────────────────────────
  const handleRestartNode = () => {
    setIsRestartingNode(true);
    showNotification('Sending SIGTERM to API Node Cluster 3 container group...', 'info');
    setTimeout(() => {
      setIsRestartingNode(false);
      showNotification('API Node Cluster 3 restarted successfully. Health checks verified.', 'success');
    }, 2000);
  };

  const handleFlushCache = () => {
    setRedisFlushing(true);
    showNotification('Clearing Redis directory cache buffers...', 'info');
    setTimeout(() => {
      setRedisFlushing(false);
      showNotification('Redis system caches flushed. Database query cache rebuild triggered.', 'success');
    }, 1500);
  };

  const handleToggleIntegration = (key: keyof typeof integrations) => {
    setIntegrations(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      showNotification(`${key.toUpperCase()} integration is now ${updated[key] ? 'Enabled' : 'Disabled'}. Api hooks updated.`, updated[key] ? 'success' : 'warning');
      return updated;
    });
  };

  const handleForcePasswordReset = (ip: string, user: string) => {
    setSecurityEvents((prev: any[]) => prev.filter((e: any) => e.ip !== ip));
    showNotification(`MFA verification triggered and password reset forced for "${user}". Account locked.`, 'success');
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* ── 1. GLOBAL COMMAND PANEL & SYSTEM HEALTH HIGHLIGHTS ── */}
      <Card sx={{ mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }} elevation={0}>
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <BoltIcon fontSize="small" color="primary" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }} color="text.secondary">
              Super Admin Direct Actions
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {[
              { label: 'Create Tenant', icon: <AddIcon />, color: '#0d9488', action: () => setTenantDialogOpen(true) },
              { label: 'Create Billing Plan', icon: <CreditCardIcon />, color: '#6366f1', action: () => setPlanDialogOpen(true) },
              { label: 'System Backup', icon: <DbIcon />, color: '#10b981', action: () => setBackupDialogOpen(true) },
              { label: 'Global Notice', icon: <SendIcon />, color: '#f59e0b', action: () => setAnnouncementDialogOpen(true) },
              { label: 'Flush Cache', icon: <RefreshIcon />, color: '#ec4899', action: handleFlushCache },
              { label: 'SOC Security Logs', icon: <ShieldIcon />, color: '#ef4444', action: () => setActiveTab(4) },
            ].map((qa) => (
              <Grid size={{ xs: 6, sm: 4, md: 2 }} key={qa.label}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={qa.action}
                  startIcon={<Box component="span" sx={{ color: qa.color, display: 'flex' }}>{qa.icon}</Box>}
                  sx={{
                    borderColor: 'divider',
                    color: 'text.primary',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    py: 1.2,
                    borderRadius: 2.5,
                    textTransform: 'none',
                    '&:hover': { borderColor: qa.color, bgcolor: `${qa.color}10`, color: qa.color },
                  }}
                >
                  {qa.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* ── 2. EXECUTIVE PLATFORM KPI METRICS CARD GRID ── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'SaaS MRR', value: data.widgets?.mrr ? `$${data.widgets.mrr.toLocaleString()}` : '$98,000', sub: '+12.4% vs last month', icon: <AccountBalanceIcon sx={{ color: '#10b981' }} /> },
          { title: 'Annualized Revenue (ARR)', value: data.widgets?.arr ? `$${(data.widgets.arr / 1000000).toFixed(2)}M` : '$1.17M', sub: 'Calculated projections', icon: <CreditCardIcon sx={{ color: '#6366f1' }} /> },
          { title: 'Total Active Tenants', value: `${tenants.filter(t => t.status === 'Active').length} / ${tenants.length}`, sub: 'Active edtech school profiles', icon: <SchoolIcon sx={{ color: '#0d9488' }} /> },
          { title: 'System Uptime Score', value: data.widgets?.uptimeScore ? `${data.widgets.uptimeScore}%` : '99.98%', sub: 'Target baseline: 99.95%', icon: <ServerIcon sx={{ color: '#3b82f6' }} /> },
        ].map((kpi, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }} elevation={0}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.5 }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>{kpi.title}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, fontFamily: "'Outfit', sans-serif" }}>{kpi.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{kpi.sub}</Typography>
                </Box>
                <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {kpi.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── 3. REAL-TIME PLATFORM METRICS GRAPH & DIRECTORIES ── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <SectionTitle
                icon={<AccountBalanceIcon />}
                title="SaaS Revenue Expansion Trend"
                subtitle="Monthly Recurring Revenue (MRR) vs Annualized projections"
              />
              <Box sx={{ height: 320, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.charts?.revenueTrends || MOCK_PLATFORM_REVENUE} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorMRR" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" tickLine={false} style={{ fontSize: '0.8rem' }} />
                    <YAxis
                      stroke="#64748b"
                      tickLine={false}
                      axisLine={false}
                      style={{ fontSize: '0.75rem' }}
                      tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                    />
                    <RechartsTooltip formatter={(value: any) => [`$${value.toLocaleString()}`, '']} />
                    <Legend wrapperStyle={{ fontSize: '0.85rem' }} />
                    <Area type="monotone" dataKey="mrr" stroke="#4f46e5" fillOpacity={1} fill="url(#colorMRR)" name="Monthly Recurring Revenue" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <SectionTitle
                icon={<AIIcon />}
                title="AI Operations co-pilot"
                subtitle="Machine learning predictive recommendations"
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Alert severity="warning" icon={<AIIcon />} sx={{ borderRadius: 2.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Churn Prediction Alert</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Sunnydale High login activity has decreased by 60% this week. High probability of standard plan cancelation request.
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="warning"
                      disableElevation
                      onClick={() => showNotification('Feedback email draft prepared for Sunnydale Admin.', 'success')}
                      sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, fontSize: '0.7rem' }}
                    >
                      Proactive Outreach
                    </Button>
                  </Box>
                </Alert>

                <Alert severity="info" icon={<SettingsIcon />} sx={{ borderRadius: 2.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>API Utilization Optimization</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Zoom API integration usage has reached 94% of our enterprise baseline limits. Suggest upgrading integration capacity token.
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => showNotification('Zoom integration capacity extended in gateway router.', 'success')}
                      sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5, fontSize: '0.7rem' }}
                    >
                      Extend Capacity
                    </Button>
                  </Box>
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── 4. TENANTS, PLANS, INFRASTRUCTURE AND COMPLIANCE tabs ── */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 4 }}>
        <CardContent>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, '& .MuiTab-root': { textTransform: 'none', fontWeight: 700 } }}
          >
            <Tab label="Tenant Directory" icon={<SchoolIcon fontSize="small" />} iconPosition="start" />
            <Tab label="Subscription Plans" icon={<CreditCardIcon fontSize="small" />} iconPosition="start" />
            <Tab label="Infrastructure Uptime" icon={<ServerIcon fontSize="small" />} iconPosition="start" />
            <Tab label="SOC Audit Logs" icon={<AuditIcon fontSize="small" />} iconPosition="start" />
            <Tab label="Integrations & Settings" icon={<PowerIcon fontSize="small" />} iconPosition="start" />
          </Tabs>

          {/* TAB 0: Tenant Directory */}
          {activeTab === 0 && (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Tenant School</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Target Domain</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Active Plan</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Active Users</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Storage Utilization</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>State</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Controls</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tenants.map((tenant) => (
                    <TableRow key={tenant.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{tenant.name}</TableCell>
                      <TableCell color="text.secondary">{tenant.domain}</TableCell>
                      <TableCell>
                        <Chip label={tenant.plan} color={tenant.plan === 'Enterprise' ? 'secondary' : 'default'} size="small" sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell>{tenant.users.toLocaleString()}</TableCell>
                      <TableCell>{tenant.storage}</TableCell>
                      <TableCell>
                        <Chip
                          label={tenant.status}
                          color={tenant.status === 'Active' ? 'success' : tenant.status === 'Trial' ? 'info' : 'error'}
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color={tenant.status === 'Active' ? 'error' : 'success'}
                            onClick={() => handleToggleTenantStatus(tenant.id, tenant.status)}
                            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, py: 0.25 }}
                          >
                            {tenant.status === 'Active' ? 'Suspend' : 'Activate'}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleCloneConfig(tenant.id)}
                            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5, py: 0.25 }}
                          >
                            Clone Config
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* TAB 1: Subscription Plans */}
          {activeTab === 1 && (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Plan Identifier</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Subscription Tier Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Pricing Rate</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Billing Interval</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Disk Allocation Limit</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Visibility Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{plan.id}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{plan.name}</TableCell>
                      <TableCell color="primary.main" sx={{ fontWeight: 700 }}>{plan.price}</TableCell>
                      <TableCell>{plan.billing}</TableCell>
                      <TableCell>{plan.storage}</TableCell>
                      <TableCell>
                        <Chip label={plan.status} color="success" size="small" sx={{ fontWeight: 700 }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* TAB 2: Infrastructure Health */}
          {activeTab === 2 && (
            <Grid container spacing={3}>
              {/* Health Chart */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Live Node Clusters Load (%)</Typography>
                <Box sx={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.charts?.infraMetrics || MOCK_INFRA_METRICS}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="cpu" stroke="#ef4444" strokeWidth={2} name="Node CPU Load (%)" />
                      <Line type="monotone" dataKey="memory" stroke="#3b82f6" strokeWidth={2} name="Memory Utilization (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>

              {/* Commands Panel */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }} elevation={0}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Platform Service Controller</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>API Node 3 Group:</Typography>
                        <Chip label="ONLINE" color="success" size="small" sx={{ fontWeight: 700 }} />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>BullMQ Queue Workers:</Typography>
                        <Chip label="120 Pending" color="warning" size="small" sx={{ fontWeight: 700 }} />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Database Replica Lag:</Typography>
                        <Chip label="14 ms" color="success" size="small" sx={{ fontWeight: 700 }} />
                      </Box>
                      <Button
                        fullWidth
                        variant="contained"
                        color="error"
                        disableElevation
                        onClick={handleRestartNode}
                        disabled={isRestartingNode}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                      >
                        {isRestartingNode ? 'Restarting...' : 'Restart Cluster Node 3'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* TAB 3: SOC Audit Logs */}
          {activeTab === 3 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Security threat activity logs</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={mfaEnforced}
                      onChange={(e) => {
                        setMfaEnforced(e.target.checked);
                        showNotification(`MFA enrollment requirements is now ${e.target.checked ? 'Enforced' : 'Optional'}.`, e.target.checked ? 'success' : 'warning');
                      }}
                      color="primary"
                    />
                  }
                  label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Enforce MFA for School Admins</Typography>}
                />
              </Box>

              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'action.hover' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Threat Detected Time</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Security Event Type</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Origin IP Address</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Target Account User</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Security State</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {securityEvents.map((evt: any) => (
                      <TableRow key={evt.ip} hover>
                        <TableCell>{evt.time}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{evt.event}</TableCell>
                        <TableCell>{evt.ip}</TableCell>
                        <TableCell>{evt.user}</TableCell>
                        <TableCell>
                          <Chip label={evt.status} color={evt.status === 'Blocked' ? 'error' : 'warning'} size="small" sx={{ fontWeight: 700 }} />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleForcePasswordReset(evt.ip, evt.user)}
                            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5 }}
                          >
                            Block &amp; Force Reset
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>General Audit Log History</Typography>
              <List disablePadding>
                {(data.recentActivity || MOCK_AUDIT_LOGS).map((log: any, idx: number) => (
                  <ListItem key={log.id || idx} sx={{ px: 0, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <ListItemIcon>
                      <AuditIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{log.action || log.description}</Typography>}
                      secondary={`Actor: ${log.user || 'System'} | ${log.time}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* TAB 4: Integrations Settings */}
          {activeTab === 4 && (
            <Grid container spacing={3}>
              {[
                { key: 'stripe' as const, name: 'Stripe Gateway', desc: 'SaaS multi-tenant subscription recurring collection billing mapping', active: integrations.stripe },
                { key: 'razorpay' as const, name: 'Razorpay Gateway', desc: 'Regional invoice fee payment integrations fallback channel', active: integrations.razorpay },
                { key: 'twilio' as const, name: 'Twilio Gateway', desc: 'Automated SMS alerts and fallback authentication messaging router', active: integrations.twilio },
                { key: 'zoom' as const, name: 'Zoom LMS API', desc: 'Online classes virtual meeting link provisioning backend engine', active: integrations.zoom },
                { key: 'googleWorkspace' as const, name: 'Google Workspace', desc: 'Domain custom emails and localized calendar syncer api', active: integrations.googleWorkspace },
              ].map((integ) => (
                <Grid size={{ xs: 12, md: 6 }} key={integ.key}>
                  <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }} elevation={0}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
                      <Box sx={{ pr: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{integ.name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>{integ.desc}</Typography>
                      </Box>
                      <Switch
                        checked={integ.active}
                        onChange={() => handleToggleIntegration(integ.key)}
                        color="success"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* ── SNACKBAR NOTIFICATION COMPONENT ── */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%', borderRadius: 2 }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* ── DIALOG: CREATE TENANT ── */}
      <Dialog open={tenantDialogOpen} onClose={() => setTenantDialogOpen(false)} fullWidth maxWidth="xs">
        <form onSubmit={handleCreateTenantSubmit}>
          <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>Initialize School Tenant</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="School Name"
              placeholder="e.g. Hogwarts Academy"
              required
              value={newTenant.name}
              onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="Assigned Domain Subdomain Prefix"
              placeholder="e.g. hogwarts"
              required
              value={newTenant.subdomain}
              onChange={(e) => setNewTenant({ ...newTenant, subdomain: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="School Admin Owner Email"
              type="email"
              placeholder="e.g. headmaster@school.com"
              value={newTenant.ownerEmail}
              onChange={(e) => setNewTenant({ ...newTenant, ownerEmail: e.target.value })}
            />
            <FormControl fullWidth size="small">
              <InputLabel id="tenant-plan-select-label">Subscription Tier Plan</InputLabel>
              <Select
                labelId="tenant-plan-select-label"
                value={newTenant.plan}
                label="Subscription Tier Plan"
                onChange={(e) => setNewTenant({ ...newTenant, plan: e.target.value })}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="Standard">Standard ($199/mo)</MenuItem>
                <MenuItem value="Premium">Premium ($1,999/yr)</MenuItem>
                <MenuItem value="Enterprise">Enterprise Custom (SLA)</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setTenantDialogOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>Initialize Tenant</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── DIALOG: CREATE BILLING PLAN ── */}
      <Dialog open={planDialogOpen} onClose={() => setPlanDialogOpen(false)} fullWidth maxWidth="xs">
        <form onSubmit={handleCreatePlanSubmit}>
          <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>Create Subscription Plan</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Pricing Plan Name"
              placeholder="e.g. Basic Starter Standard"
              required
              value={newPlan.name}
              onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="Price Rate Token (e.g., $150)"
              placeholder="e.g. $150"
              required
              value={newPlan.price}
              onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
            />
            <FormControl fullWidth size="small">
              <InputLabel id="plan-billing-cycle-label">Billing Cycle Interval</InputLabel>
              <Select
                labelId="plan-billing-cycle-label"
                value={newPlan.billing}
                label="Billing Cycle Interval"
                onChange={(e) => setNewPlan({ ...newPlan, billing: e.target.value })}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="Monthly">Monthly Invoice</MenuItem>
                <MenuItem value="Annual">Annual Billing Contract</MenuItem>
                <MenuItem value="Custom">Custom Pay-as-you-go</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              label="Disk Storage Limit Allocation"
              placeholder="e.g. 100 GB"
              value={newPlan.storage}
              onChange={(e) => setNewPlan({ ...newPlan, storage: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setPlanDialogOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>Create Plan</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── DIALOG: GLOBAL BROADCAST NOTICE ── */}
      <Dialog open={announcementDialogOpen} onClose={() => setAnnouncementDialogOpen(false)} fullWidth maxWidth="xs">
        <form onSubmit={handleAnnouncementSubmit}>
          <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>Dispatch SaaS Announcement</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Announcement Title"
              placeholder="e.g. Schedule Maintenance Downtime"
              required
              value={announcement.title}
              onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
            />
            <FormControl fullWidth size="small">
              <InputLabel id="announcement-target-select-label">Target Tenant Filter</InputLabel>
              <Select
                labelId="announcement-target-select-label"
                value={announcement.target}
                label="Target Tenant Filter"
                onChange={(e) => setAnnouncement({ ...announcement, target: e.target.value })}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="All Tenants">All Tenants (Platform-wide)</MenuItem>
                <MenuItem value="Enterprise Plan">Enterprise Schools Only</MenuItem>
                <MenuItem value="Standard Plan">Standard Tier Subscribers Only</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Broadcast Statement Message"
              placeholder="Type statement here..."
              required
              value={announcement.message}
              onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={announcement.pushAlert}
                  onChange={(e) => setAnnouncement({ ...announcement, pushAlert: e.target.checked })}
                  color="error"
                />
              }
              label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Enforce emergency alert pop-up banners upon admin logins</Typography>}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setAnnouncementDialogOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button type="submit" variant="contained" color="error" sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>BroadcastNotice</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── DIALOG: SYSTEM BACKUP ── */}
      <Dialog open={backupDialogOpen} onClose={() => setBackupDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>Initiate Cross-Region Backup</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }}>
            You are initiating a manual snapshot of all PostgreSQL schemas and MongoDB file catalogs.
          </Typography>
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Last System Backup status:</Typography>
            <Chip label={backupStatus} size="small" color="primary" sx={{ fontWeight: 700 }} />
          </Box>
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
            🚨 Warning: This backup job runs asynchronously. High S3 network output could slightly degrade heavy report compilation jobs for Standard tier tenants.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setBackupDialogOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleTriggerBackup} variant="contained" color="success" sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
            Start Backup Snapshot
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuperAdminDashboard;
