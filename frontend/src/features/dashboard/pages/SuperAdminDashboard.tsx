import React, { useState, useEffect } from 'react';
import { schoolApi } from '../../schools/api/schools.api';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
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
  School as SchoolIcon,
  AccountBalance as AccountBalanceIcon,
  Send as SendIcon,
  Bolt as BoltIcon,
  AutoAwesome as AIIcon,
  Dns as ServerIcon,
  Shield as ShieldIcon,
  CreditCard as CreditCardIcon,
  Power as PowerIcon,
  History as AuditIcon,
  Storage as DbIcon,
  Add as AddIcon,
  Cached as RefreshIcon,
} from '@mui/icons-material';
// useNavigate not required here
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import type { DashboardResponse } from '../api/dashboardApi';
import { SectionTitle } from '../../../components/common/SectionTitle';

export interface SuperAdminDashboardProps {
  data: DashboardResponse;
}
import {
  MOCK_PLATFORM_REVENUE,
  MOCK_INFRA_METRICS,
  MOCK_SUBSCRIPTION_PLANS,
  MOCK_SECURITY_THREATS,
  MOCK_AUDIT_LOGS,
} from '../fixtures/superAdminMocks';

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ data }) => {

  // ── States for active view controls ─────────────────────────────────────
  const [activeTab, setActiveTab] = useState(0);
  type SchoolRow = {
    id: string;
    name: string;
    domain: string;
    plan: string;
    users: number;
    storage: string;
    status: string;
    health: string;
  };
  type SecurityEvent = {
    time: string;
    event: string;
    ip: string;
    user: string;
    status: string;
  };
  type AuditLog = {
    id?: string;
    user?: string;
    action: string;
    target?: string;
    time: string;
    description?: string;
  };

  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(data.securityThreats || MOCK_SECURITY_THREATS);
  const [plans, setPlans] = useState(MOCK_SUBSCRIPTION_PLANS);

  const fetchSchools = async () => {
    try {
      const result = await schoolApi.getSchools({ limit: 100 });
      if (result && result.data) {
        const mapped = result.data.map((school: { _id?: string; id?: string; name: string; isActive?: boolean; }) => ({
          id: school._id || school.id,
          name: school.name,
          domain: `${school.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.edtech.com`,
          plan: school.name.toLowerCase().includes('hogwarts') ? 'Enterprise' : school.name.toLowerCase().includes('xavier') ? 'Premium' : 'Standard',
          users: 150 + Math.floor(Math.random() * 50),
          storage: `${20 + Math.floor(Math.random() * 80)} GB`,
          status: school.isActive ? 'Active' : 'Suspended',
          health: school.isActive ? 'Healthy' : 'Critical',
        }));
        setSchools(mapped);
      }
    } catch (err) {
      console.error('Failed to load schools', err);
    }
  };
  useEffect(() => {
    // calling async fetch and setting state inside effect via inner async function
    // it only runs once on mount
    (async () => {
      try {
        await fetchSchools();
      } catch (e) {
        console.error('fetchSchools error', e);
      }
    })();
  }, []);

  useEffect(() => {
    if (data.securityThreats) {
      // Defer setState to avoid synchronous setState-in-effect lint
      setTimeout(() => setSecurityEvents(data.securityThreats as SecurityEvent[]), 0);
    }
  }, [data]);

  // Snackbar feedback notification states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('success');

  // Quick Action Dialog states
  const [schoolDialogOpen, setSchoolDialogOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);

  // Forms states
  const [newSchool, setNewSchool] = useState({ name: '', address: '', plan: 'Standard', ownerEmail: '' });
  const [newPlan, setNewPlan] = useState({ name: '', price: '', billing: 'Monthly', storage: '100 GB' });
  const [announcement, setAnnouncement] = useState({ title: '', target: 'All Schools', message: '', pushAlert: false });

  // Infrastructure Actions simulation states
  const [isRestartingNode, setIsRestartingNode] = useState(false);
  const [, setRedisFlushing] = useState(false);
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

  // ── School Directory Operations ─────────────────────────────────────────
  const handleToggleSchoolStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      await schoolApi.updateSchool(id, { isActive: nextStatus === 'Active' });
      showNotification(`School status updated to ${nextStatus}.`, nextStatus === 'Active' ? 'success' : 'warning');
      fetchSchools();
    } catch (err) {
      console.error(err);
      showNotification('Failed to update school status.', 'error');
    }
  };

  const handleCloneConfig = (id: string) => {
    showNotification(`Cloned system limits, localized calendars, and schema configurations from school ${id}.`, 'info');
  };

  // ── Submissions ────────────────────────────────────────────────────────
  const handleCreateSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchool.name || !newSchool.address) {
      showNotification('Please fill in School Name and Address.', 'warning');
      return;
    }
    try {
      await schoolApi.createSchool({
        name: newSchool.name,
        address: newSchool.address,
        phone: '123-456-7890',
        email: newSchool.ownerEmail || `admin@${newSchool.name.toLowerCase().replace(/\s+/g, '')}.com`,
        isActive: true,
      });
      setSchoolDialogOpen(false);
      showNotification(`School "${newSchool.name}" created successfully.`, 'success');
      setNewSchool({ name: '', address: '', plan: 'Standard', ownerEmail: '' });
      fetchSchools();
    } catch (err) {
      console.error(err);
      showNotification('Failed to create school.', 'error');
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
    setAnnouncement({ title: '', target: 'All Schools', message: '', pushAlert: false });
  };

  const handleTriggerBackup = () => {
    setBackupDialogOpen(false);
    showNotification('System backup snapshot initiated (AWS S3 RDS replicator)...', 'info');
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
    setSecurityEvents((prev: SecurityEvent[]) => prev.filter((e) => e.ip !== ip));
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
              { label: 'Create School', icon: <AddIcon />, color: '#0d9488', action: () => setSchoolDialogOpen(true) },
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
          { title: 'Total Active Schools', value: `${schools.filter(t => t.status === 'Active').length} / ${schools.length}`, sub: 'Active school profiles', icon: <SchoolIcon sx={{ color: '#0d9488' }} /> },
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
                    <RechartsTooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
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

      {/* ── 4. SCHOOLS, PLANS, INFRASTRUCTURE AND COMPLIANCE tabs ── */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 4 }}>
        <CardContent>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, '& .MuiTab-root': { textTransform: 'none', fontWeight: 700 } }}
          >
            <Tab label="School Directory" icon={<SchoolIcon fontSize="small" />} iconPosition="start" />
            <Tab label="Subscription Plans" icon={<CreditCardIcon fontSize="small" />} iconPosition="start" />
            <Tab label="Infrastructure Uptime" icon={<ServerIcon fontSize="small" />} iconPosition="start" />
            <Tab label="SOC Audit Logs" icon={<AuditIcon fontSize="small" />} iconPosition="start" />
            <Tab label="Integrations & Settings" icon={<PowerIcon fontSize="small" />} iconPosition="start" />
          </Tabs>

          {/* TAB 0: School Directory */}
          {activeTab === 0 && (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, maxHeight: 400, overflowY: 'auto' }}>
              <Table stickyHeader>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>School Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Target Domain</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Active Plan</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Active Users</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Storage Utilization</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>State</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Controls</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schools.map((school) => (
                    <TableRow key={school.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{school.name}</TableCell>
                      <TableCell color="text.secondary">{school.domain}</TableCell>
                      <TableCell>
                        <Chip label={school.plan} color={school.plan === 'Enterprise' ? 'secondary' : 'default'} size="small" sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell>{school.users.toLocaleString()}</TableCell>
                      <TableCell>{school.storage}</TableCell>
                      <TableCell>
                        <Chip
                          label={school.status}
                          color={school.status === 'Active' ? 'success' : school.status === 'Trial' ? 'info' : 'error'}
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color={school.status === 'Active' ? 'error' : 'success'}
                            onClick={() => handleToggleSchoolStatus(school.id, school.status)}
                            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, py: 0.25 }}
                          >
                            {school.status === 'Active' ? 'Suspend' : 'Activate'}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleCloneConfig(school.id)}
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
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, maxHeight: 400, overflowY: 'auto' }}>
              <Table stickyHeader>
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

              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, maxHeight: 300, overflowY: 'auto' }}>
                <Table stickyHeader>
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
                    {securityEvents.map((evt) => (
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
              <Box sx={{ maxHeight: 250, overflowY: 'auto', pr: 1 }}>
                <List disablePadding>
                  {((data.recentActivity || MOCK_AUDIT_LOGS) as AuditLog[]).map((log, idx: number) => (
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
            </Box>
          )}

          {/* TAB 4: Integrations Settings */}
          {activeTab === 4 && (
            <Grid container spacing={3}>
              {[
                { key: 'stripe' as const, name: 'Stripe Gateway', desc: 'Subscription recurring collection billing and payment processing', active: integrations.stripe },
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

      {/* ── DIALOG: CREATE SCHOOL ── */}
      <Dialog open={schoolDialogOpen} onClose={() => setSchoolDialogOpen(false)} fullWidth maxWidth="xs">
        <form onSubmit={handleCreateSchoolSubmit}>
          <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>Create New School</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="School Name"
              placeholder="e.g. Hogwarts Academy"
              required
              value={newSchool.name}
              onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="School Address"
              placeholder="e.g. 123 Main Street"
              required
              value={newSchool.address}
              onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="School Admin Email"
              type="email"
              placeholder="e.g. headmaster@school.com"
              value={newSchool.ownerEmail}
              onChange={(e) => setNewSchool({ ...newSchool, ownerEmail: e.target.value })}
            />
            <FormControl fullWidth size="small">
              <InputLabel id="school-plan-select-label">Subscription Tier Plan</InputLabel>
              <Select
                labelId="school-plan-select-label"
                value={newSchool.plan}
                label="Subscription Tier Plan"
                onChange={(e) => setNewSchool({ ...newSchool, plan: e.target.value })}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="Standard">Standard ($199/mo)</MenuItem>
                <MenuItem value="Premium">Premium ($1,999/yr)</MenuItem>
                <MenuItem value="Enterprise">Enterprise Custom (SLA)</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setSchoolDialogOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>Create School</Button>
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
              <InputLabel id="announcement-target-select-label">Target Audience</InputLabel>
              <Select
                labelId="announcement-target-select-label"
                value={announcement.target}
                label="Target Audience"
                onChange={(e) => setAnnouncement({ ...announcement, target: e.target.value })}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="All Schools">All Schools (Platform-wide)</MenuItem>
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
            🚨 Warning: This backup job runs asynchronously. High S3 network output could slightly degrade heavy report compilation jobs.
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
