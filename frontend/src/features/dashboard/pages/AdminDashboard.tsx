import React, { useState } from 'react';
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
  ListItemSecondaryAction,
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Class as ClassIcon,
  Event as EventIcon,
  AccountBalance as AccountBalanceIcon,
  CheckCircleOutlined as CheckCircleIcon,
  AssignmentTurnedIn as AssignmentIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Send as SendIcon,
  Download as DownloadIcon,
  Mail as MailIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Settings as SettingsIcon,
  ArrowForward as ArrowIcon,
  Bolt as BoltIcon,
  Search as SearchIcon,
  ReceiptLong as InvoiceIcon,
  AutoAwesome as AIIcon,
  NotificationsActive as AlertIcon,
  MenuBook as BookIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import type { DashboardResponse } from '../api/dashboardApi';

export interface AdminDashboardProps {
  data: DashboardResponse;
  firstName: string;
}

// ── Mock Datasets for Dashboard Features ───────────────────────────────────
const MOCK_FINANCIAL_TRENDS = [
  { month: 'Jan', collected: 125000, projected: 140000 },
  { month: 'Feb', collected: 138000, projected: 140000 },
  { month: 'Mar', collected: 155000, projected: 150000 },
  { month: 'Apr', collected: 142000, projected: 160000 },
  { month: 'May', collected: 168000, projected: 165000 },
  { month: 'Jun', collected: 185000, projected: 180000 },
];

const MOCK_ACADEMIC_STATS = [
  { subject: 'Mathematics', average: 78, passRate: 94 },
  { subject: 'Science', average: 82, passRate: 97 },
  { subject: 'English', average: 85, passRate: 99 },
  { subject: 'Social Studies', average: 80, passRate: 96 },
  { subject: 'Computer Science', average: 88, passRate: 100 },
];

const MOCK_LEAVE_REQUESTS = [
  { id: 'LV-101', name: 'Robert Vance', role: 'Teacher (Math)', type: 'Sick Leave', duration: '2 Days (Jun 8-9)', reason: 'Dental surgery appointment', docAttached: true },
  { id: 'LV-102', name: 'Janice Geller', role: 'Staff (Admins)', type: 'Casual Leave', duration: '1 Day (Jun 12)', reason: 'Family engagement ceremony', docAttached: false },
  { id: 'LV-103', name: 'Dr. Sarah Jenkins', role: 'Teacher (Biology)', type: 'Sick Leave', duration: '3 Days (Jun 15-17)', reason: 'Severe throat inflammation', docAttached: true },
];

const MOCK_WAIVER_REQUESTS = [
  { id: 'WV-501', student: 'Ryan Cook', grade: 'Grade 9-A', request: '50% Waiver', type: 'Need-based Scholarship', annualIncome: '$32,000', rationale: 'Single-parent household with medical expenses' },
  { id: 'WV-502', student: 'Emma Watson', grade: 'Grade 10-C', request: '100% Waiver', type: 'Merit-based Excellence', annualIncome: '$75,000', rationale: 'National Mathematical Olympiad Gold Medalist' },
];

const MOCK_ADMISSION_APPLICATIONS = [
  { id: 'AD-901', name: 'Tyler Durden', grade: 'Grade 11-B', score: '92%', status: 'Document Verified' },
  { id: 'AD-902', name: 'Marla Singer', grade: 'Grade 9-A', score: '88%', status: 'Interview Scheduled' },
  { id: 'AD-903', name: 'Robert Paulson', grade: 'Grade 12-A', score: '74%', status: 'Under Review' },
];

const MOCK_CORRECTIONS = [
  { id: 'CR-301', name: 'Leo Rivera', class: 'Grade 6-B', field: 'Attendance Correction', original: 'Absent (Jun 4)', correction: 'Present', reason: 'Field trip attendance delay' },
  { id: 'CR-302', name: 'David Miller', class: 'Grade 8-A', field: 'Mark correction (Quiz 2)', original: '14/20', correction: '18/20', reason: 'Recount error in laboratory report marks' },
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

const AdminDashboard: React.FC<AdminDashboardProps> = ({ data, firstName }) => {
  const navigate = useNavigate();

  // ── States for interactive checklists/workflow items ───────────────────
  const [leaves, setLeaves] = useState(MOCK_LEAVE_REQUESTS);
  const [waivers, setWaivers] = useState(MOCK_WAIVER_REQUESTS);
  const [admissions, setAdmissions] = useState(MOCK_ADMISSION_APPLICATIONS);
  const [corrections, setCorrections] = useState(MOCK_CORRECTIONS);

  const [activeWorkflowTab, setActiveWorkflowTab] = useState(0);
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState(0);

  // Snackbar feedback notification states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'info' | 'warning'>('success');

  // Quick Action Dialog states
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [teacherDialogOpen, setTeacherDialogOpen] = useState(false);
  const [feeDialogOpen, setFeeDialogOpen] = useState(false);
  const [noticeDialogOpen, setNoticeDialogOpen] = useState(false);

  // Forms states
  const [newStudent, setNewStudent] = useState({ name: '', class: '', email: '', parentPhone: '' });
  const [newTeacher, setNewTeacher] = useState({ name: '', department: '', email: '', classAssigned: '' });
  const [feeCollection, setFeeCollection] = useState({ studentId: '', amount: '', paymentMethod: 'Card' });
  const [notice, setNotice] = useState({ title: '', target: 'All', content: '', emailBroadcast: false });

  // AI-Insights Interactive Actions States
  const [aiSuggestionsDismissed, setAiSuggestionsDismissed] = useState(false);
  const [classroomOptimizationApplied, setClassroomOptimizationApplied] = useState(false);
  const [activeDefaulterAlerts, setActiveDefaulterAlerts] = useState(3);

  // Report Generator Engine States
  const [reportType, setReportType] = useState('Academic');
  const [reportFormat, setReportFormat] = useState('PDF');
  const [schedulerOpen, setSchedulerOpen] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState('Weekly');
  const [scheduleEmail, setScheduleEmail] = useState('');

  // ── Show notification helper ──────────────────────────────────────────
  const showNotification = (msg: string, severity: 'success' | 'info' | 'warning' = 'success') => {
    setSnackbarMessage(msg);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // ── Approvals Center Actions handlers ──────────────────────────────────
  const handleApproveLeave = (id: string) => {
    setLeaves(prev => prev.filter(l => l.id !== id));
    showNotification(`Leave request ${id} approved successfully. Substitute notification dispatched.`, 'success');
  };

  const handleRejectLeave = (id: string) => {
    setLeaves(prev => prev.filter(l => l.id !== id));
    showNotification(`Leave request ${id} rejected. Faculty notified.`, 'warning');
  };

  const handleApproveWaiver = (id: string) => {
    setWaivers(prev => prev.filter(w => w.id !== id));
    showNotification(`Fee waiver scholarship request ${id} approved. Tuition invoice updated in ledger.`, 'success');
  };

  const handleRejectWaiver = (id: string) => {
    setWaivers(prev => prev.filter(w => w.id !== id));
    showNotification(`Fee waiver scholarship request ${id} rejected. Parent notified.`, 'warning');
  };

  const handleApproveAdmission = (id: string) => {
    setAdmissions(prev => prev.filter(a => a.id !== id));
    showNotification(`Admission application ${id} approved. Welcome packet and registration ID dispatched.`, 'success');
  };

  const handleRejectAdmission = (id: string) => {
    setAdmissions(prev => prev.filter(a => a.id !== id));
    showNotification(`Admission application ${id} cataloged as deferred.`, 'info');
  };

  const handleApproveCorrection = (id: string) => {
    setCorrections(prev => prev.filter(c => c.id !== id));
    showNotification(`Registry correction ${id} approved. Metrics recalculated.`, 'success');
  };

  // ── Forms Submission Simulation ──────────────────────────────────────
  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.class) {
      showNotification('Please fill in Student Name and Assigned Class.', 'warning');
      return;
    }
    setStudentDialogOpen(false);
    showNotification(`Student "${newStudent.name}" enrolled into ${newStudent.class} successfully!`, 'success');
    setNewStudent({ name: '', class: '', email: '', parentPhone: '' });
  };

  const handleAddTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.name || !newTeacher.department) {
      showNotification('Please fill in Teacher Name and Department.', 'warning');
      return;
    }
    setTeacherDialogOpen(false);
    showNotification(`Educator "${newTeacher.name}" successfully added to ${newTeacher.department}.`, 'success');
    setNewTeacher({ name: '', department: '', email: '', classAssigned: '' });
  };

  const handleFeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeCollection.studentId || !feeCollection.amount) {
      showNotification('Please fill in Student ID and Collection Amount.', 'warning');
      return;
    }
    setFeeDialogOpen(false);
    showNotification(`Tuition payment of $${parseFloat(feeCollection.amount).toLocaleString()} collected successfully!`, 'success');
    setFeeCollection({ studentId: '', amount: '', paymentMethod: 'Card' });
  };

  const handleNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notice.title || !notice.content) {
      showNotification('Notice Title and Content cannot be empty.', 'warning');
      return;
    }
    setNoticeDialogOpen(false);
    showNotification(`Notice "${notice.title}" published to audience: "${notice.target}".`, 'success');
    setNotice({ title: '', target: 'All', content: '', emailBroadcast: false });
  };

  // ── Report Generator trigger ──────────────────────────────────────────
  const handleGenerateReport = () => {
    showNotification(`Generating ${reportType} report in ${reportFormat} format. Download starting automatically.`, 'info');
  };

  const handleScheduleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleEmail) {
      showNotification('Please provide a valid recipient email address.', 'warning');
      return;
    }
    setSchedulerOpen(false);
    showNotification(`Scheduled weekly "${reportType}" reports to be delivered to "${scheduleEmail}".`, 'success');
    setScheduleEmail('');
  };

  const { widgets, recentActivity } = data;

  // Render dashboard layout
  return (
    <Box sx={{ pb: 6 }}>
      {/* ── 1. QUICK SHORTCUTS / ACTION TOOLBAR ── */}
      <Card sx={{ mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }} elevation={0}>
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <BoltIcon fontSize="small" color="primary" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }} color="text.secondary">
              Quick Admin Shortcuts
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {[
              { label: 'Add Student', icon: <SchoolIcon />, color: '#0d9488', action: () => setStudentDialogOpen(true) },
              { label: 'Add Teacher', icon: <PeopleIcon />, color: '#6366f1', action: () => setTeacherDialogOpen(true) },
              { label: 'Collect Fees', icon: <InvoiceIcon />, color: '#10b981', action: () => setFeeDialogOpen(true) },
              { label: 'Send Broadcast', icon: <SendIcon />, color: '#f59e0b', action: () => setNoticeDialogOpen(true) },
              { label: 'Manage Roles', icon: <SettingsIcon />, color: '#ef4444', path: '/users' },
              { label: 'System Reports', icon: <DownloadIcon />, color: '#3b82f6', action: () => { document.getElementById('reports-generator-section')?.scrollIntoView({ behavior: 'smooth' }) } },
            ].map((qa) => (
              <Grid size={{ xs: 6, sm: 4, md: 2 }} key={qa.label}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={qa.path ? () => navigate(qa.path) : qa.action}
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

      {/* ── 2. WORKSPACE ANALYTIC PANELS ── */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Tuition Collections Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <SectionTitle
                icon={<AccountBalanceIcon />}
                title="Tuition Income Target Analysis"
                subtitle="Projected collections vs actual receipts (current fiscal year)"
              />
              <Box sx={{ height: 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_FINANCIAL_TRENDS} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                    <defs>
                      <linearGradient id="actualCol" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="projCol" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0.1} />
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
                    <RechartsTooltip
                      formatter={(value: any) => [`$${value.toLocaleString()}`, '']}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.85rem',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.85rem', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="collected" stroke="#4f46e5" fillOpacity={1} fill="url(#actualCol)" name="Actual Collections" />
                    <Area type="monotone" dataKey="projected" stroke="#0d9488" fillOpacity={1} fill="url(#projCol)" name="Projected Targets" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Academic averages distribution / status */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <SectionTitle
                icon={<TrendingUpIcon />}
                title="Curriculum & Grade Analytics"
                subtitle="Average class grades by major subjects"
              />
              <Tabs
                value={activeAnalyticsTab}
                onChange={(_, val) => setActiveAnalyticsTab(val)}
                variant="fullWidth"
                sx={{ mb: 2.5, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 32, fontSize: '0.75rem' } }}
              >
                <Tab label="Subject Averages" />
                <Tab label="Registry Stats" />
              </Tabs>

              {activeAnalyticsTab === 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {MOCK_ACADEMIC_STATS.map((stat) => (
                    <Box key={stat.subject}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{stat.subject}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }} color="primary">{stat.average}% average</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={stat.average}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'action.hover',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: stat.average >= 85 ? '#0d9488' : stat.average >= 80 ? '#3b82f6' : '#f59e0b'
                          }
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ py: 1 }}>
                  <List disablePadding>
                    {[
                      { label: 'Overall Passing Rate', value: '96.2%', color: 'success' as const },
                      { label: 'Teacher-to-Student Ratio', value: '1 : 22', color: 'primary' as const },
                      { label: 'Unassigned Sections', value: '0 Sections', color: 'info' as const },
                      { label: 'Curriculum Coverage', value: '84.8% Complete', color: 'success' as const },
                      { label: 'Hostel Occupancy Rate', value: '92.1% (368 / 400)', color: 'warning' as const },
                    ].map((item, idx) => (
                      <ListItem key={idx} sx={{ px: 0, py: 1.2 }} divider={idx < 4}>
                        <ListItemText
                          disableTypography
                          primary={<Typography variant="body2" sx={{ fontWeight: 500 }}>{item.label}</Typography>}
                        />
                        <Chip label={item.value} size="small" color={item.color} sx={{ fontWeight: 700 }} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── 3. AI-POWERED INSIGHTS CO-PILOT MODULE ── */}
      {!aiSuggestionsDismissed && (
        <Card elevation={0} sx={{ border: '1.5px solid #8b5cf6', bgcolor: '#faf5ff', borderRadius: 3, mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <AIIcon sx={{ color: '#8b5cf6' }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#6d28d9', fontFamily: "'Outfit', sans-serif" }}>
                    AI-Powered Administrative Recommendations
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "'Inter', sans-serif" }}>
                    Real-time operational optimization suggestions generated using machine learning engines
                  </Typography>
                </Box>
              </Box>
              <IconButton size="small" onClick={() => setAiSuggestionsDismissed(true)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Grid container spacing={3}>
              {/* Card 1: Attendance Risk */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ border: '1px dashed #d8b4fe', borderRadius: 2.5, height: '100%' }} elevation={0}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <AlertIcon sx={{ color: '#ec4899', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }} color="text.primary">Attendance Risk Alert</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        14 students flagged with attendance rates falling below the 75% baseline requirement. High risk of chronic absenteeism.
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      color="secondary"
                      startIcon={<SendIcon />}
                      onClick={() => {
                        setNotice({
                          title: 'Urgent: Attendance Policy Advisory',
                          target: 'Parents',
                          content: 'This is a friendly reminder that standard school rules require a minimum of 75% active classroom attendance to register for Term Finals examinations. Please audit your child\'s records or contact the academic cell.',
                          emailBroadcast: true
                        });
                        setNoticeDialogOpen(true);
                      }}
                      sx={{ textTransform: 'none', bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' }, fontWeight: 700, borderRadius: 2 }}
                    >
                      Draft Parents Advisory
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* Card 2: Defaulters Prediction */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ border: '1px dashed #d8b4fe', borderRadius: 2.5, height: '100%' }} elevation={0}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <InvoiceIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }} color="text.primary">Fee Default Predictions</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        Historical invoice timeline delays suggest {activeDefaulterAlerts} accounts are at risk of missing the Term Fall deadline.
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        color="secondary"
                        onClick={() => {
                          setActiveDefaulterAlerts(0);
                          showNotification('Automated friendly email fee reminders dispatched to predicted defaulters.', 'success');
                        }}
                        disabled={activeDefaulterAlerts === 0}
                        sx={{ textTransform: 'none', color: '#8b5cf6', borderColor: '#8b5cf6', fontWeight: 600, borderRadius: 2, flex: 1 }}
                      >
                        {activeDefaulterAlerts > 0 ? 'Send Reminders' : 'Dispatched'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Card 3: Room/Resource Optimization */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ border: '1px dashed #d8b4fe', borderRadius: 2.5, height: '100%' }} elevation={0}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <ClassIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }} color="text.primary">Room Optimization Suggestion</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        Grade 9-A Biology (32 students) and Grade 7-B Science (15 students) swap is suggested. Lab 2 is currently overcrowded.
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      color="secondary"
                      startIcon={<CheckIcon />}
                      disabled={classroomOptimizationApplied}
                      onClick={() => {
                        setClassroomOptimizationApplied(true);
                        showNotification('Timetable room allocation swaps applied and notifications updated.', 'success');
                      }}
                      sx={{ textTransform: 'none', bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' }, fontWeight: 700, borderRadius: 2 }}
                    >
                      {classroomOptimizationApplied ? 'Optimization Applied' : 'Approve Swaps'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* ── 4. APPROVALS & WORKFLOW WORKSPACE CENTER ── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <SectionTitle
                icon={<CheckCircleIcon />}
                title="Approvals & Workflow Hub"
                subtitle="Review, approve or request details for ongoing school transactions"
              />

              <Tabs
                value={activeWorkflowTab}
                onChange={(_, val) => setActiveWorkflowTab(val)}
                sx={{ mb: 2, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 36, fontSize: '0.8rem' } }}
              >
                <Tab label={`Leave Requests (${leaves.length})`} />
                <Tab label={`Fee Waivers (${waivers.length})`} />
                <Tab label={`Admissions Pipeline (${admissions.length})`} />
                <Tab label={`Corrections (${corrections.length})`} />
              </Tabs>

              {/* Leave Requests Tab */}
              {activeWorkflowTab === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {leaves.length > 0 ? (
                    leaves.map((req) => (
                      <Box
                        key={req.id}
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box sx={{ pr: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{req.name}</Typography>
                            <Chip label={req.role} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{req.type} · {req.duration}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Reason: "{req.reason}"
                          </Typography>
                          {req.docAttached && (
                            <Chip
                              icon={<BookIcon style={{ fontSize: 12 }} />}
                              label="MedicalCertificate.pdf"
                              size="small"
                              variant="outlined"
                              color="primary"
                              sx={{ mt: 1, height: 18, fontSize: '0.65rem' }}
                            />
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            disableElevation
                            onClick={() => handleApproveLeave(req.id)}
                            startIcon={<CheckIcon />}
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleRejectLeave(req.id)}
                            startIcon={<CloseIcon />}
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                          >
                            Reject
                          </Button>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ py: 4, textBaseline: 'center', textAlign: 'center', color: 'text.disabled' }}>
                      <CheckCircleIcon sx={{ fontSize: 36, mb: 1, opacity: 0.4 }} />
                      <Typography variant="caption" sx={{ display: 'block' }}>All leave requests completed!</Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Fee Waivers Tab */}
              {activeWorkflowTab === 1 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {waivers.length > 0 ? (
                    waivers.map((req) => (
                      <Box
                        key={req.id}
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box sx={{ pr: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{req.student}</Typography>
                            <Chip label={req.grade} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                            <Chip label={req.request} color="primary" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Waiver Subtype: {req.type} | Family Income: {req.annualIncome}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                            Rationale: "{req.rationale}"
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            disableElevation
                            onClick={() => handleApproveWaiver(req.id)}
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
                          >
                            Grant
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleRejectWaiver(req.id)}
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                          >
                            Deny
                          </Button>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ py: 4, textBaseline: 'center', textAlign: 'center', color: 'text.disabled' }}>
                      <CheckCircleIcon sx={{ fontSize: 36, mb: 1, opacity: 0.4 }} />
                      <Typography variant="caption" sx={{ display: 'block' }}>No pending waiver requests.</Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Admissions Tab */}
              {activeWorkflowTab === 2 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {admissions.length > 0 ? (
                    admissions.map((req) => (
                      <Box
                        key={req.id}
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{req.name}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Grade Level: {req.grade} | Prior Merit Entrance Score: {req.score}
                          </Typography>
                          <Chip label={req.status} size="small" variant="filled" color="info" sx={{ mt: 1, height: 18, fontSize: '0.65rem', fontWeight: 600 }} />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            disableElevation
                            onClick={() => handleApproveAdmission(req.id)}
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleRejectAdmission(req.id)}
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                          >
                            Defer
                          </Button>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ py: 4, textBaseline: 'center', textAlign: 'center', color: 'text.disabled' }}>
                      <CheckCircleIcon sx={{ fontSize: 36, mb: 1, opacity: 0.4 }} />
                      <Typography variant="caption" sx={{ display: 'block' }}>Admission pipeline is empty.</Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Corrections Tab */}
              {activeWorkflowTab === 3 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {corrections.length > 0 ? (
                    corrections.map((req) => (
                      <Box
                        key={req.id}
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{req.name}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {req.class} · {req.field}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500, fontSize: '0.8rem' }}>
                            <Box component="span" sx={{ color: 'error.main', textDecoration: 'line-through' }}>{req.original}</Box>
                            {' → '}
                            <Box component="span" sx={{ color: 'success.main', fontWeight: 700 }}>{req.correction}</Box>
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Justification: "{req.reason}"
                          </Typography>
                        </Box>
                        <Box>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            disableElevation
                            onClick={() => handleApproveCorrection(req.id)}
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
                          >
                            Approve
                          </Button>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ py: 4, textBaseline: 'center', textAlign: 'center', color: 'text.disabled' }}>
                      <CheckCircleIcon sx={{ fontSize: 36, mb: 1, opacity: 0.4 }} />
                      <Typography variant="caption" sx={{ display: 'block' }}>No pending registry corrections.</Typography>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Audit Log / Feed */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <SectionTitle
                icon={<InfoIcon />}
                title="Audited Actions Feed"
                subtitle="Live school administration audit log history"
              />
              {recentActivity && recentActivity.length > 0 ? (
                <List disablePadding>
                  {recentActivity.map((activity, i) => (
                    <ListItem key={i} sx={{ px: 0, py: 1.5, alignItems: 'flex-start' }} divider={i !== recentActivity.length - 1}>
                      <ListItemIcon sx={{ minWidth: 24, mt: 0.5 }}>
                        <FiberManualRecordIcon sx={{ fontSize: '10px', color: 'primary.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        disableTypography
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                            {activity.description}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {activity.time}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No recent audited operations detected.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── 5. REPORTS GENERATOR CONSOLE ── */}
      <Card id="reports-generator-section" elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 4 }}>
        <CardContent>
          <SectionTitle
            icon={<DownloadIcon />}
            title="Reports & Analytics Console"
            subtitle="Generate real-time files or schedule recurring reports directly to school headers"
          />

          <Grid container spacing={3} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="report-type-select-label">Report Category</InputLabel>
                <Select
                  labelId="report-type-select-label"
                  value={reportType}
                  label="Report Category"
                  onChange={(e) => setReportType(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="Academic">Academic (Grades, Classes)</MenuItem>
                  <MenuItem value="Financial">Financial Ledger (Collections, Defaulters)</MenuItem>
                  <MenuItem value="Operational">Operational Statistics (Transport, Library)</MenuItem>
                  <MenuItem value="Admissions">Admissions Conversion Funnel</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="report-format-select-label">Export Format</InputLabel>
                <Select
                  labelId="report-format-select-label"
                  value={reportFormat}
                  label="Export Format"
                  onChange={(e) => setReportFormat(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="PDF">Adobe PDF (.pdf)</MenuItem>
                  <MenuItem value="Excel">Microsoft Excel (.xlsx)</MenuItem>
                  <MenuItem value="CSV">Comma Separated Values (.csv)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleGenerateReport}
                startIcon={<DownloadIcon />}
                sx={{ textTransform: 'none', py: 1, fontWeight: 700, borderRadius: 2 }}
              >
                Generate &amp; Download
              </Button>
              <Button
                variant="outlined"
                onClick={() => setSchedulerOpen(true)}
                startIcon={<EventIcon />}
                sx={{ textTransform: 'none', py: 1, fontWeight: 600, borderRadius: 2, minWidth: 120 }}
              >
                Schedule
              </Button>
            </Grid>
          </Grid>
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

      {/* ── DIALOG: ADD STUDENT ── */}
      <Dialog open={studentDialogOpen} onClose={() => setStudentDialogOpen(false)} fullWidth maxWidth="xs">
        <form onSubmit={handleAddStudentSubmit}>
          <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>Enroll New Student</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Student Full Name"
              placeholder="e.g. Harry Potter"
              required
              value={newStudent.name}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="Class Assignment"
              placeholder="e.g. Grade 9-A"
              required
              value={newStudent.class}
              onChange={(e) => setNewStudent({ ...newStudent, class: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="Email Address"
              type="email"
              placeholder="e.g. student@school.com"
              value={newStudent.email}
              onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="Parent Contact Number"
              placeholder="e.g. +1 555 1234"
              value={newStudent.parentPhone}
              onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setStudentDialogOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>Enroll Student</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── DIALOG: ADD TEACHER ── */}
      <Dialog open={teacherDialogOpen} onClose={() => setTeacherDialogOpen(false)} fullWidth maxWidth="xs">
        <form onSubmit={handleAddTeacherSubmit}>
          <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>Add Educator / Teacher</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Teacher Full Name"
              placeholder="e.g. Minerva McGonagall"
              required
              value={newTeacher.name}
              onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="Department Field"
              placeholder="e.g. Science & Transfiguration"
              required
              value={newTeacher.department}
              onChange={(e) => setNewTeacher({ ...newTeacher, department: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="Workplace Email Address"
              type="email"
              placeholder="e.g. teacher@school.edu"
              value={newTeacher.email}
              onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="Classroom Assignment"
              placeholder="e.g. Grade 11-A, Section B"
              value={newTeacher.classAssigned}
              onChange={(e) => setNewTeacher({ ...newTeacher, classAssigned: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setTeacherDialogOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>Add Faculty</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── DIALOG: COLLECT FEES ── */}
      <Dialog open={feeDialogOpen} onClose={() => setFeeDialogOpen(false)} fullWidth maxWidth="xs">
        <form onSubmit={handleFeeSubmit}>
          <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>Collect Fee Payment</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Student Profile ID or Name"
              placeholder="e.g. STD-2023-084"
              required
              value={feeCollection.studentId}
              onChange={(e) => setFeeCollection({ ...feeCollection, studentId: e.target.value })}
            />
            <TextField
              fullWidth
              size="small"
              label="Billing Collection Amount ($)"
              type="number"
              placeholder="e.g. 1500"
              required
              value={feeCollection.amount}
              onChange={(e) => setFeeCollection({ ...feeCollection, amount: e.target.value })}
            />
            <FormControl fullWidth size="small">
              <InputLabel id="payment-method-select-label">Payment Channel</InputLabel>
              <Select
                labelId="payment-method-select-label"
                value={feeCollection.paymentMethod}
                label="Payment Channel"
                onChange={(e) => setFeeCollection({ ...feeCollection, paymentMethod: e.target.value })}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="Card">Credit / Debit Card</MenuItem>
                <MenuItem value="Bank Transfer">Direct Bank Transfer</MenuItem>
                <MenuItem value="Cash">Cash Receipt</MenuItem>
                <MenuItem value="Scholarship">Scholarship Deduction</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setFeeDialogOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button type="submit" variant="contained" color="success" sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>Collect Payment</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── DIALOG: NOTICE BROADCAST ── */}
      <Dialog open={noticeDialogOpen} onClose={() => setNoticeDialogOpen(false)} fullWidth maxWidth="xs">
        <form onSubmit={handleNoticeSubmit}>
          <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>Broadcast Announcement</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Notice Summary / Title"
              placeholder="e.g. Midterm Exams Schedule Shifted"
              required
              value={notice.title}
              onChange={(e) => setNotice({ ...notice, title: e.target.value })}
            />
            <FormControl fullWidth size="small">
              <InputLabel id="notice-target-select-label">Target Audience</InputLabel>
              <Select
                labelId="notice-target-select-label"
                value={notice.target}
                label="Target Audience"
                onChange={(e) => setNotice({ ...notice, target: e.target.value })}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="All">All Audiences (Entire Institution)</MenuItem>
                <MenuItem value="Teachers">Educators &amp; Faculty Only</MenuItem>
                <MenuItem value="Parents">Parents &amp; Guardians Only</MenuItem>
                <MenuItem value="Students">Enrolled Students Only</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Announcement Content"
              placeholder="Type the official statement body here..."
              required
              value={notice.content}
              onChange={(e) => setNotice({ ...notice, content: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={notice.emailBroadcast}
                  onChange={(e) => setNotice({ ...notice, emailBroadcast: e.target.checked })}
                  color="primary"
                />
              }
              label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Dispatch SMS &amp; Email campaigns simultaneously</Typography>}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setNoticeDialogOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>Publish Notice</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── DIALOG: REPORTS SCHEDULER ── */}
      <Dialog open={schedulerOpen} onClose={() => setSchedulerOpen(false)} fullWidth maxWidth="xs">
        <form onSubmit={handleScheduleReportSubmit}>
          <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>Schedule Automated Reports</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Set up automated email delivery of "{reportType}" analytics report.
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel id="scheduler-frequency-label">Frequency</InputLabel>
              <Select
                labelId="scheduler-frequency-label"
                value={scheduleFrequency}
                label="Frequency"
                onChange={(e) => setScheduleFrequency(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="Daily">Daily Reports Delivery</MenuItem>
                <MenuItem value="Weekly">Weekly (Every Monday Morning)</MenuItem>
                <MenuItem value="Monthly">Monthly (1st of Calendar Month)</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              label="Recipient Email Address"
              type="email"
              placeholder="e.g. director@school.edu"
              required
              value={scheduleEmail}
              onChange={(e) => setScheduleEmail(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setSchedulerOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>Activate Schedule</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

// ── Custom Dot Icon to avoid import mismatches ────────────────────────────
const FiberManualRecordIcon: React.FC<{ sx?: any }> = ({ sx }) => {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" style={sx}>
      <circle cx="5" cy="5" r="4" fill="currentColor" />
    </svg>
  );
};

export default AdminDashboard;
