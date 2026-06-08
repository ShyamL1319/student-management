import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Alert,
  Paper,
} from '@mui/material';
import {
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Warning as WarningIcon,
  Send as SendIcon,
  Add as AddIcon,
  DateRange as DateIcon,
} from '@mui/icons-material';
import { parentsApi } from '../../parents/api/parents.api';

export interface ChildSummary {
  _id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  rollNumber?: string;
  dob?: string;
  class?: {
    _id: string;
    name: string;
  };
  section?: {
    _id: string;
    name: string;
  };
  attendancePct?: number;
  unpaidFees?: number;
  outstandingInvoices?: number;
  averageMarks?: number | null;
  upcomingExamsCount?: number;
}

export interface ParentDashboardData {
  children: ChildSummary[];
  totalChildrenCount: number;
}

export interface AttendanceRecord {
  _id: string;
  date: string;
  status: string;
  remarks?: string;
}

export interface AcademicMark {
  subjectId: string;
  examId: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  gpa: number;
}

export interface AcademicData {
  gpa: number;
  marks: AcademicMark[];
}

export interface FeeInvoice {
  _id: string;
  invoiceNumber: string;
  dueDate: string;
  netAmount: number;
  pendingAmount: number;
  status: string;
}

export interface ExamSchedule {
  _id: string;
  name: string;
  type: string;
  isPublished: boolean;
  schedule?: unknown[];
}

export interface NotificationItem {
  _id: string;
  recipientId: string;
  title: string;
  message: string;
  createdAt: string;
}

export interface MessageUser {
  _id: string;
  firstName: string;
  lastName: string;
  roleType: string;
}

export interface MessageItem {
  _id: string;
  senderId: MessageUser;
  recipientId: MessageUser;
  subject?: string;
  content: string;
  createdAt: string;
}

export const ParentDashboard: React.FC = () => {
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [activeChildIndex, setActiveChildIndex] = useState<number>(0);
  const [, setDashboardData] = useState<ParentDashboardData | null>(null);

  // Scoped active child records
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [academic, setAcademic] = useState<AcademicData>({ marks: [], gpa: 0 });
  const [fees, setFees] = useState<FeeInvoice[]>([]);
  const [exams, setExams] = useState<ExamSchedule[]>([]);

  // Global dashboard overlays
  const [, setNotifications] = useState<NotificationItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);

  // Load States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // Link Child wizard states
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [admissionNo, setAdmissionNo] = useState('');
  const [childDob, setChildDob] = useState('');
  const [linkError, setLinkError] = useState('');
  const [linkSuccess, setLinkSuccess] = useState('');
  const [linking, setLinking] = useState(false);

  // Messaging states
  const [newMessage, setNewMessage] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [sending, setSending] = useState(false);

  // Reload trigger to refresh the page safely
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const handleReload = () => setReloadTrigger(prev => prev + 1);

  const activeChild = children[activeChildIndex];

  // Base Data Fetcher
  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setLoading(true);
        setError('');

        const parentDashboard = await parentsApi.getDashboard();
        setDashboardData(parentDashboard);

        const childrenList = await parentsApi.getChildren();
        setChildren(childrenList);

        const notifs = await parentsApi.getNotifications();
        setNotifications(notifs);

        const msgs = await parentsApi.getMessages();
        setMessages(msgs);

        if (childrenList.length > 0) {
          setActiveChildIndex(0);
        }
      } catch (err: unknown) {
        setError(
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to load dashboard data'
        );
      } finally {
        setLoading(false);
      }
    };

    loadBaseData();
  }, [reloadTrigger]);

  // Reload child-specific records when active child updates
  useEffect(() => {
    if (!activeChild) return;

    const loadChildDetails = async () => {
      try {
        const studentId = activeChild._id;

        const [attnRes, acadRes, feeRes, examRes] = await Promise.all([
          parentsApi.getChildAttendance(studentId),
          parentsApi.getChildAcademic(studentId),
          parentsApi.getChildFees(studentId),
          parentsApi.getChildExams(studentId),
        ]);

        setAttendance(attnRes.data || []);
        setAcademic(acadRes || { marks: [], gpa: 0 });
        setFees(feeRes || []);
        setExams(examRes || []);
      } catch (err) {
        console.error('Failed to load child telemetry', err);
      }
    };

    loadChildDetails();
  }, [activeChild]);

  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError('');
    setLinkSuccess('');
    setLinking(true);

    try {
      await parentsApi.linkChild({ admissionNumber: admissionNo, dob: childDob });
      setLinkSuccess('Child linked successfully!');
      setAdmissionNo('');
      setChildDob('');
      // Reload children array
      const childrenList = await parentsApi.getChildren();
      setChildren(childrenList);
      setTimeout(() => {
        setIsLinkOpen(false);
        setLinkSuccess('');
      }, 1500);
    } catch (err: unknown) {
      setLinkError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Verification failed. Please check child records.'
      );
    } finally {
      setLinking(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage || !recipientId) return;
    setSending(true);

    try {
      await parentsApi.sendMessage({ recipientId, content: newMessage });
      setNewMessage('');
      const msgs = await parentsApi.getMessages();
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to dispatch message', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={handleReload}>Retry</Button>}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* 1. Header & Multi-Child Selector */}
      <Card
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #111827 100%)',
          color: 'white',
          borderRadius: 4,
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="overline" sx={{ opacity: 0.6, letterSpacing: 2 }}>PARENT PORTAL</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                Welcome Back! 👋
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                Monitor your children's attendance, grades, and invoice collections in real-time.
              </Typography>

              {children.length > 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Select Child:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {children.map((child, idx) => (
                      <Chip
                        key={child._id}
                        label={`${child.firstName} ${child.lastName}`}
                        onClick={() => setActiveChildIndex(idx)}
                        color={idx === activeChildIndex ? 'primary' : 'default'}
                        variant={idx === activeChildIndex ? 'filled' : 'outlined'}
                        sx={{
                          fontWeight: 700,
                          color: idx === activeChildIndex ? 'white' : 'rgba(255,255,255,0.7)',
                          borderColor: 'rgba(255,255,255,0.3)',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              ) : (
                <Alert severity="info" sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                  No linked children found. Let's link your first child now.
                </Alert>
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 5 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsLinkOpen(true)}
                sx={{
                  bgcolor: '#0d9488',
                  '&:hover': { bgcolor: '#0f766e' },
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 2,
                }}
              >
                Link Child Sibling
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Renders Onboarding if no children linked */}
      {children.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
          <WarningIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>No Children Associated</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            To view academic performance, timetables, and billing receipts, link your child's profile first.
          </Typography>
          <Button variant="contained" onClick={() => setIsLinkOpen(true)} sx={{ borderRadius: 2 }}>
            Link Child Profile
          </Button>
        </Paper>
      ) : (
        <>
          {/* Active Child Overview Badges */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              { label: 'Attendance Rate', value: `${activeChild?.attendancePct || 100}%`, desc: 'Target > 75%', icon: <CheckCircleIcon />, color: '#0d9488' },
              { label: 'Academic Average', value: activeChild?.averageMarks ? `${activeChild.averageMarks}%` : 'N/A', desc: 'Combined grade avg', icon: <TrendingUpIcon />, color: '#6366f1' },
              { label: 'Upcoming Exams', value: `${activeChild?.upcomingExamsCount || 0} Scheduled`, desc: 'This month', icon: <EventIcon />, color: '#ef4444' },
              { label: 'Tuition Outstanding', value: `$${activeChild?.unpaidFees || 0}`, desc: `${activeChild?.outstandingInvoices || 0} invoices due`, icon: <AccountBalanceIcon />, color: '#f59e0b' },
            ].map((stat, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                        {stat.label}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: stat.color }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{stat.desc}</Typography>
                    </Box>
                    <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', color: stat.color }}>
                      {stat.icon}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* 2. Workspace Navigation Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
              <Tab label="Attendance" sx={{ fontWeight: 700 }} />
              <Tab label="Performance" sx={{ fontWeight: 700 }} />
              <Tab label="Invoices & Fees" sx={{ fontWeight: 700 }} />
              <Tab label="Exam Schedules" sx={{ fontWeight: 700 }} />
              <Tab label="Direct Mailbox" sx={{ fontWeight: 700 }} />
            </Tabs>
          </Box>

          {/* TAB 0: ATTENDANCE LEDGER */}
          {activeTab === 0 && (
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Attendance Records Ledger</Typography>
                {attendance.length > 0 ? (
                  <List disablePadding>
                    {attendance.map((record, idx) => (
                      <React.Fragment key={record._id}>
                        <ListItem sx={{ py: 1.5 }}>
                          <ListItemIcon>
                            <DateIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={new Date(record.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            secondary={record.remarks || 'Standard school day'}
                          />
                          <Chip
                            label={record.status}
                            color={record.status === 'PRESENT' ? 'success' : record.status === 'ABSENT' ? 'error' : 'warning'}
                            sx={{ fontWeight: 700 }}
                          />
                        </ListItem>
                        {idx < attendance.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">No attendance logs found for this child.</Typography>
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB 1: PERFORMANCE GRADES */}
          {activeTab === 1 && (
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Term Results & Grades</Typography>
                {academic.marks.length > 0 ? (
                  <Grid container spacing={2}>
                    {academic.marks.map((mark: AcademicMark, idx: number) => (
                      <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                        <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Subject ID: {mark.subjectId}</Typography>
                            <Typography variant="caption" color="text.secondary">Exam ID: {mark.examId}</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{mark.marksObtained} / {mark.maxMarks}</Typography>
                            <Chip label={`Grade: ${mark.grade}`} color="primary" size="small" sx={{ fontWeight: 700 }} />
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography color="text.secondary">No term results graded yet.</Typography>
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB 2: INVOICES & FEES */}
          {activeTab === 2 && (
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Outstanding Tuition Invoices</Typography>
                {fees.length > 0 ? (
                  <List disablePadding>
                    {fees.map((invoice, idx) => (
                      <React.Fragment key={invoice._id}>
                        <ListItem sx={{ py: 2 }}>
                          <ListItemIcon>
                            <AccountBalanceIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={`Invoice ${invoice.invoiceNumber}`}
                            secondary={`Due: ${new Date(invoice.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                          />
                          <Box sx={{ mr: 3, textAlign: 'right' }}>
                            <Typography sx={{ fontWeight: 700 }}>${invoice.netAmount}</Typography>
                            <Chip
                              label={invoice.status}
                              size="small"
                              color={invoice.status === 'PAID' ? 'success' : invoice.status === 'ISSUED' ? 'error' : 'warning'}
                              sx={{ fontWeight: 700 }}
                            />
                          </Box>
                          {invoice.pendingAmount > 0 && (
                            <Button variant="contained" color="error" size="small" sx={{ borderRadius: 1.5, fontWeight: 700 }}>
                              Pay Now
                            </Button>
                          )}
                        </ListItem>
                        {idx < fees.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">No invoice items on file.</Typography>
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB 3: EXAM SCHEDULES */}
          {activeTab === 3 && (
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Exam Schedules</Typography>
                {exams.length > 0 ? (
                  <List disablePadding>
                    {exams.map((exam, idx) => (
                      <React.Fragment key={exam._id}>
                        <ListItem sx={{ py: 2 }}>
                          <ListItemIcon>
                            <EventIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={exam.name}
                            secondary={`Type: ${exam.type} | Schedules: ${exam.schedule?.length || 0} slots`}
                          />
                          <Chip label={exam.isPublished ? "Published" : "Draft"} variant="outlined" size="small" />
                        </ListItem>
                        {idx < exams.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">No upcoming exams listed for this child's class.</Typography>
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB 4: DIRECT MAILBOX */}
          {activeTab === 4 && (
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Direct Communication Feed</Typography>

                <Grid container spacing={3}>
                  {/* Left Pane: Send Form */}
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        required
                        fullWidth
                        label="Recipient User ID (Teacher/Staff)"
                        value={recipientId}
                        onChange={(e) => setRecipientId(e.target.value)}
                        slotProps={{ input: { sx: { borderRadius: '8px' } } }}
                      />
                      <TextField
                        required
                        fullWidth
                        multiline
                        rows={4}
                        label="Type Message Content..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        slotProps={{ input: { sx: { borderRadius: '8px' } } }}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={sending || !newMessage || !recipientId}
                        startIcon={<SendIcon />}
                        sx={{ py: 1.25, borderRadius: 2, fontWeight: 700 }}
                      >
                        {sending ? 'Sending...' : 'Send Message'}
                      </Button>
                    </Box>
                  </Grid>

                  {/* Right Pane: Messages History */}
                  <Grid size={{ xs: 12, md: 7 }}>
                    <Box sx={{ maxHeight: 400, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, bgcolor: 'action.hover' }}>
                      {messages.length > 0 ? (
                        <List disablePadding>
                          {messages.map((msg) => (
                            <Box
                              key={msg._id}
                              sx={{
                                mb: 2,
                                p: 1.5,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: 'background.paper',
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                  {msg.senderId?.firstName} {msg.senderId?.lastName} ({msg.senderId?.roleType})
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(msg.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                              </Box>
                              <Typography variant="body2">{msg.content}</Typography>
                            </Box>
                          ))}
                        </List>
                      ) : (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                          Inbox empty. Start a conversation above.
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* 3. Link Child Modal Dialog */}
      <Dialog open={isLinkOpen} onClose={() => setIsLinkOpen(false)} slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Link Student Sibling Profile</DialogTitle>
        <Box component="form" onSubmit={handleLinkChild}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, minWidth: 320 }}>
            {linkError && <Alert severity="error">{linkError}</Alert>}
            {linkSuccess && <Alert severity="success">{linkSuccess}</Alert>}
            <Typography variant="body2" color="text.secondary">
              Input the child's official school details below to associate their profile.
            </Typography>
            <TextField
              required
              fullWidth
              label="Child Admission Number"
              placeholder="ADM-YYYY-XXXXXX"
              value={admissionNo}
              onChange={(e) => setAdmissionNo(e.target.value)}
              slotProps={{ input: { sx: { borderRadius: '8px' } } }}
            />
            <TextField
              required
              fullWidth
              type="date"
              label="Child Birth Date"
              slotProps={{ inputLabel: { shrink: true }, input: { sx: { borderRadius: '8px' } } }}
              value={childDob}
              onChange={(e) => setChildDob(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setIsLinkOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={linking} sx={{ fontWeight: 700, borderRadius: 2 }}>
              {linking ? 'Verifying...' : 'Link Profile'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default ParentDashboard;
