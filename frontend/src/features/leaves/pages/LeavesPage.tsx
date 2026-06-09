import type { FC } from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  IconButton,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  EventNote as EventNoteIcon,
} from '@mui/icons-material';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip } from 'recharts';
import { useAuth } from '../../../contexts/AuthContext';
import { leavesApi } from '../api/leaves.api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`leaves-tabpanel-${index}`}
      aria-labelledby={`leaves-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

export const LeavesPage: FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Dialog States
  const [applyOpen, setApplyOpen] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [remarks, setRemarks] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    type: 'Sick',
    reason: '',
    medicalAttachmentUrl: '',
  });

  // Resolve role
  const userTyped = user as any;
  const roleName = userTyped?.role
    ? typeof userTyped.role === 'string'
      ? userTyped.role
      : userTyped.role.name
    : '';

  const isRequester = ['STUDENT', 'TEACHER', 'STAFF'].includes(roleName);
  const isApprover = ['ADMIN', 'SUPER_ADMIN', 'TEACHER'].includes(roleName);

  const fetchBalances = async () => {
    if (!isRequester) return;
    try {
      const res = await leavesApi.getLeaveBalances();
      setBalances(res || []);
    } catch (err) {
      console.error('Failed to load leave balances', err);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await leavesApi.getLeaveRequests();
      setRequests(res?.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch leave history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!isApprover) return;
    try {
      const res = await leavesApi.getLeaveAnalytics();
      setAnalytics(res);
    } catch (err) {
      console.error('Failed to load leave analytics', err);
    }
  };

  const loadData = () => {
    fetchRequests();
    fetchBalances();
    fetchAnalytics();
  };

  useEffect(() => {
    loadData();
  }, [roleName]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (start > end) {
      alert('Start date cannot be after end date');
      return;
    }

    if (formData.type === 'Medical' && !formData.medicalAttachmentUrl) {
      alert('Medical attachment URL is required for medical leaves');
      return;
    }

    try {
      await leavesApi.createLeaveRequest(formData);
      setApplyOpen(false);
      setFormData({
        startDate: '',
        endDate: '',
        type: 'Sick',
        reason: '',
        medicalAttachmentUrl: '',
      });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit leave request');
    }
  };

  const handleOpenAction = (req: any, type: 'APPROVED' | 'REJECTED') => {
    setSelectedRequest(req);
    setActionType(type);
    setRemarks('');
    setActionOpen(true);
  };

  const handleActionSubmit = async () => {
    if (!selectedRequest) return;
    try {
      await leavesApi.updateLeaveRequestStatus(selectedRequest._id, {
        status: actionType,
        remarks,
      });
      setActionOpen(false);
      setSelectedRequest(null);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update leave request status');
    }
  };

  const handleCancelRequest = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
    try {
      await leavesApi.cancelLeaveRequest(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel leave request');
    }
  };

  // Recharts color palette
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'CANCELLED':
        return 'default';
      default:
        return 'warning';
    }
  };

  const getDaysCount = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      {/* Header Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: 'white',
          p: 4,
          borderRadius: 4,
          mb: 4,
          boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
            Leave Management System
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Submit, track, and approve leave requests effortlessly.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={loadData}
            startIcon={<RefreshIcon />}
            sx={{ textTransform: 'none', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
          >
            Refresh
          </Button>
          {isRequester && (
            <Button
              variant="contained"
              onClick={() => setApplyOpen(true)}
              startIcon={<AddIcon />}
              sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
            >
              Apply Leave
            </Button>
          )}
        </Box>
      </Box>

      {/* Leave Balance Widgets */}
      {isRequester && balances.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {balances.map((b) => (
            <Grid size={{ xs: 12, sm: 4 }} key={b._id}>
              <Card sx={{ borderRadius: 3, borderLeft: `6px solid ${b.leaveType === 'Sick' ? '#ef4444' : b.leaveType === 'Casual' ? '#3b82f6' : '#10b981'}` }}>
                <CardContent>
                  <Typography color="textSecondary" variant="subtitle2" sx={{ fontWeight: 600 }} gutterBottom>
                    {b.leaveType} Leave Balance ({b.year})
                  </Typography>
                  <Typography variant="h3" color="primary" sx={{ my: 1, fontWeight: 700 }}>
                    {b.allocated - b.used - b.pending} <Typography component="span" variant="h6">/ {b.allocated} remaining</Typography>
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Used: {b.used} days | Pending hold: {b.pending} days
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="leave portal tabs">
          <Tab label="Leave History" sx={{ fontWeight: 600, textTransform: 'none' }} />
          {isApprover && <Tab label="Pending Approvals" sx={{ fontWeight: 600, textTransform: 'none' }} />}
          {isApprover && <Tab label="Analytics Dashboard" sx={{ fontWeight: 600, textTransform: 'none' }} />}
        </Tabs>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Tab Panel 1: History */}
      <TabPanel value={activeTab} index={0}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : requests.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <EventNoteIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6">No leave requests found</Typography>
            <Typography variant="body2" color="textSecondary">You have not submitted or processed any leave requests yet.</Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell><strong>Requester</strong></TableCell>
                  <TableCell><strong>Leave Type</strong></TableCell>
                  <TableCell><strong>Start Date</strong></TableCell>
                  <TableCell><strong>End Date</strong></TableCell>
                  <TableCell><strong>Duration</strong></TableCell>
                  <TableCell><strong>Reason</strong></TableCell>
                  <TableCell><strong>Workflow State</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((row) => (
                  <TableRow key={row._id} hover>
                    <TableCell>
                      {row.requesterId
                        ? `${row.requesterId.firstName} ${row.requesterId.lastName} (${row.requesterType})`
                        : `User (${row.requesterType})`}
                    </TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{new Date(row.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(row.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>{getDaysCount(row.startDate, row.endDate)} Days</TableCell>
                    <TableCell>{row.reason}</TableCell>
                    <TableCell>
                      <Typography variant="caption" color="textSecondary">
                        Step {row.currentStep} of {row.approvalWorkflow?.length || 1} ({row.approvalWorkflow?.find((w: any) => w.step === row.currentStep)?.approverRole || 'Admin'})
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={row.status} color={getStatusChipColor(row.status)} size="small" sx={{ fontWeight: 600 }} />
                    </TableCell>
                    <TableCell align="right">
                      {isRequester && row.requesterId?._id === user?._id && ['PENDING', 'APPROVED'].includes(row.status) && (
                        <Tooltip title="Cancel Request">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleCancelRequest(row._id)}
                            disabled={row.status === 'APPROVED' && new Date(row.startDate) <= new Date()}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Tab Panel 2: Approvals */}
      {isApprover && (
        <TabPanel value={activeTab} index={1}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
          ) : requests.filter(r => r.status === 'PENDING').length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
              <CheckIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography variant="h6">All caught up!</Typography>
              <Typography variant="body2" color="textSecondary">There are no pending leave requests awaiting your approval.</Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
              <Table>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell><strong>Requester</strong></TableCell>
                    <TableCell><strong>Leave Type</strong></TableCell>
                    <TableCell><strong>Start Date</strong></TableCell>
                    <TableCell><strong>End Date</strong></TableCell>
                    <TableCell><strong>Duration</strong></TableCell>
                    <TableCell><strong>Reason</strong></TableCell>
                    <TableCell><strong>Attachment</strong></TableCell>
                    <TableCell align="right"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests
                    .filter((r) => r.status === 'PENDING')
                    .map((row) => (
                      <TableRow key={row._id} hover>
                        <TableCell>
                          {row.requesterId
                            ? `${row.requesterId.firstName} ${row.requesterId.lastName} (${row.requesterType})`
                            : `User (${row.requesterType})`}
                        </TableCell>
                        <TableCell>{row.type}</TableCell>
                        <TableCell>{new Date(row.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(row.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>{getDaysCount(row.startDate, row.endDate)} Days</TableCell>
                        <TableCell>{row.reason}</TableCell>
                        <TableCell>
                          {row.medicalAttachmentUrl ? (
                            <a href={row.medicalAttachmentUrl} target="_blank" rel="noopener noreferrer">View Doc</a>
                          ) : 'None'}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<CheckIcon />}
                              onClick={() => handleOpenAction(row, 'APPROVED')}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              startIcon={<CloseIcon />}
                              onClick={() => handleOpenAction(row, 'REJECTED')}
                            >
                              Reject
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      )}

      {/* Tab Panel 3: Analytics */}
      {isApprover && (
        <TabPanel value={activeTab} index={2}>
          {analytics ? (
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ borderRadius: 3, p: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Leave Types Distribution</Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Sick', value: analytics.distribution.Sick },
                            { name: 'Casual', value: analytics.distribution.Casual },
                            { name: 'Medical', value: analytics.distribution.Medical },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {COLORS.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ borderRadius: 3, p: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Leaves Summary Overview</Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Total', count: analytics.summary.total },
                          { name: 'Approved', count: analytics.summary.approved },
                          { name: 'Pending', count: analytics.summary.pending },
                          { name: 'Rejected', count: analytics.summary.rejected },
                        ]}
                      >
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip />
                        <Bar dataKey="count" fill="#6366f1">
                          {COLORS.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
          )}
        </TabPanel>
      )}

      {/* Apply Leave Dialog */}
      <Dialog open={applyOpen} onClose={() => setApplyOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Apply for Leave</DialogTitle>
        <form onSubmit={handleApplySubmit}>
          <DialogContent sx={{ pt: 1 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  select
                  fullWidth
                  label="Leave Type"
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  required
                >
                  <MenuItem value="Sick">Sick Leave</MenuItem>
                  <MenuItem value="Casual">Casual Leave</MenuItem>
                  <MenuItem value="Medical">Medical Leave</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleFormChange}
                  slotProps={{ inputLabel: { shrink: true } }}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleFormChange}
                  slotProps={{ inputLabel: { shrink: true } }}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Reason for Leave"
                  name="reason"
                  value={formData.reason}
                  onChange={handleFormChange}
                  required
                />
              </Grid>
              {formData.type === 'Medical' && (
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Medical Certificate Attachment URL"
                    name="medicalAttachmentUrl"
                    value={formData.medicalAttachmentUrl}
                    onChange={handleFormChange}
                    placeholder="https://example.com/certificate.pdf"
                    required
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setApplyOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ textTransform: 'none', borderRadius: 2 }}>Submit Request</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Approve/Reject Confirmation Dialog */}
      <Dialog open={actionOpen} onClose={() => setActionOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {actionType === 'APPROVED' ? 'Approve Leave Request' : 'Reject Leave Request'}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Provide comments/remarks below for this leave request updates.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Remarks / Comments"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setActionOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            onClick={handleActionSubmit}
            variant="contained"
            color={actionType === 'APPROVED' ? 'success' : 'error'}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
