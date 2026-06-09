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
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CloudUpload as CloudUploadIcon,
  Publish as PublishIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, Cell } from 'recharts';
import { useAuth } from '../../../contexts/AuthContext';
import { assignmentsApi } from '../api/assignments.api';
import { classesApi } from '../../classes/api/classes.api';
import { subjectsApi } from '../../subjects/api/subjects.api';
import { AssignmentUpload } from '../components/AssignmentUpload';

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
      id={`assignments-tabpanel-${index}`}
      aria-labelledby={`assignments-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

export const AssignmentsPage: FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Dialog open/close states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [gradeOpen, setGradeOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    classId: '',
    dueDate: '',
    maxMarks: 100,
    attachmentUrl: '',
    attachmentName: '',
    isPublished: false,
    latePolicy: {
      allowLate: true,
      gracePeriodMinutes: 0,
      penaltyPercentagePerDay: 0,
      maxPenaltyPercentage: 50,
    },
  });

  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [gradeData, setGradeData] = useState({
    marksObtained: 0,
    feedback: '',
  });

  const [bulkGradeItems, setBulkGradeItems] = useState<any[]>([]);

  // Resolve role
  const userTyped = user as any;
  const roleName = userTyped?.role
    ? typeof userTyped.role === 'string'
      ? userTyped.role
      : userTyped.role.name
    : '';

  const isTeacherOrAdmin = ['TEACHER', 'ADMIN', 'SUPER_ADMIN'].includes(roleName);
  const isStudent = roleName === 'STUDENT';

  const loadSelectionData = async () => {
    if (isTeacherOrAdmin) {
      try {
        const [classesData, subjectsData] = await Promise.all([
          classesApi.getClasses(),
          subjectsApi.getSubjects(),
        ]);
        setClasses(classesData?.data || []);
        setSubjects(subjectsData?.data || []);
      } catch (err) {
        console.error('Failed to load classes or subjects selection options', err);
      }
    }
  };

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const res = await assignmentsApi.getAssignments();
      setAssignments(res?.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch assignments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
    loadSelectionData();
  }, [roleName]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if (newValue === 0) {
      setSelectedAssignment(null);
      setSubmissions([]);
      setAnalytics(null);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('latePolicy.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        latePolicy: {
          ...formData.latePolicy,
          [field]: field === 'allowLate' ? e.target.checked : Number(value),
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === 'maxMarks' ? Number(value) : value,
      });
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await assignmentsApi.createAssignment(formData);
      setCreateOpen(false);
      resetForm();
      loadAssignments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create assignment');
    }
  };

  const handleEditOpen = (assignment: any) => {
    setSelectedAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description || '',
      subjectId: assignment.subject?._id || assignment.subject || '',
      classId: assignment.class?._id || assignment.class || '',
      dueDate: new Date(assignment.dueDate).toISOString().substring(0, 16),
      maxMarks: assignment.maxMarks,
      attachmentUrl: assignment.attachmentUrl || '',
      attachmentName: assignment.attachmentName || '',
      isPublished: assignment.isPublished,
      latePolicy: assignment.latePolicy || {
        allowLate: true,
        gracePeriodMinutes: 0,
        penaltyPercentagePerDay: 0,
        maxPenaltyPercentage: 50,
      },
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    try {
      await assignmentsApi.updateAssignment(selectedAssignment._id, formData);
      setEditOpen(false);
      resetForm();
      setSelectedAssignment(null);
      loadAssignments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update assignment');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this assignment and all its submissions?')) return;
    try {
      await assignmentsApi.deleteAssignment(id);
      loadAssignments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete assignment');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await assignmentsApi.publishAssignment(id);
      loadAssignments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to publish assignment');
    }
  };

  const handleUploadSuccess = async (fileUrl: string, fileName: string, fileSize: number) => {
    if (!selectedAssignment) return;
    try {
      await assignmentsApi.submitAssignment(selectedAssignment._id, { fileUrl, fileName, fileSize });
      setSubmitOpen(false);
      setSelectedAssignment(null);
      loadAssignments();
      alert('Homework submitted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to register submission details');
    }
  };

  const handleViewSubmissions = async (assignment: any) => {
    setSelectedAssignment(assignment);
    setActiveTab(1);
    try {
      setLoading(true);
      const [subs, analyticsRes] = await Promise.all([
        assignmentsApi.getSubmissions(assignment._id),
        assignmentsApi.getAssignmentAnalytics(assignment._id),
      ]);
      setSubmissions(subs || []);
      setAnalytics(analyticsRes);
    } catch (err) {
      console.error('Failed to load submissions list', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeOpen = (submission: any) => {
    setSelectedSubmission(submission);
    setGradeData({
      marksObtained: submission.marksObtained || 0,
      feedback: submission.feedback || '',
    });
    setGradeOpen(true);
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission || !selectedAssignment) return;
    try {
      await assignmentsApi.gradeSubmission(selectedSubmission._id, gradeData);
      setGradeOpen(false);
      setSelectedSubmission(null);
      // Reload submissions
      const subs = await assignmentsApi.getSubmissions(selectedAssignment._id);
      setSubmissions(subs || []);
      const analyticsRes = await assignmentsApi.getAssignmentAnalytics(selectedAssignment._id);
      setAnalytics(analyticsRes);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to grade submission');
    }
  };

  const handleBulkOpen = () => {
    const ungraded = submissions.filter(s => s.status !== 'Graded');
    setBulkGradeItems(ungraded.map(s => ({
      submissionId: s._id,
      studentName: `${s.student?.firstName} ${s.student?.lastName}`,
      marksObtained: s.marksObtained || 0,
      feedback: s.feedback || '',
    })));
    setBulkOpen(true);
  };

  const handleBulkItemChange = (index: number, field: string, val: any) => {
    const items = [...bulkGradeItems];
    items[index] = {
      ...items[index],
      [field]: field === 'marksObtained' ? Number(val) : val,
    };
    setBulkGradeItems(items);
  };

  const handleBulkGradeSubmit = async () => {
    if (!selectedAssignment) return;
    try {
      await assignmentsApi.bulkGradeSubmissions(selectedAssignment._id, {
        grades: bulkGradeItems.map(item => ({
          submissionId: item.submissionId,
          marksObtained: item.marksObtained,
          feedback: item.feedback,
        })),
      });
      setBulkOpen(false);
      setBulkGradeItems([]);
      const subs = await assignmentsApi.getSubmissions(selectedAssignment._id);
      setSubmissions(subs || []);
      const analyticsRes = await assignmentsApi.getAssignmentAnalytics(selectedAssignment._id);
      setAnalytics(analyticsRes);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit bulk grades');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subjectId: '',
      classId: '',
      dueDate: '',
      maxMarks: 100,
      attachmentUrl: '',
      attachmentName: '',
      isPublished: false,
      latePolicy: {
        allowLate: true,
        gracePeriodMinutes: 0,
        penaltyPercentagePerDay: 0,
        maxPenaltyPercentage: 50,
      },
    });
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const getSubmissionStatusColor = (sub: any) => {
    if (!sub) return 'default';
    if (sub.status === 'Graded') return 'success';
    if (sub.isLate) return 'error';
    return 'primary';
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      {/* Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          color: 'white',
          p: 4,
          borderRadius: 4,
          mb: 4,
          boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
            Assignment Management System
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            {isTeacherOrAdmin
              ? 'Publish homework tasks, track student submissions, and perform bulk evaluations.'
              : 'View assigned coursework, submit document solutions, and review grades.'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={loadAssignments}
            startIcon={<RefreshIcon />}
            sx={{ textTransform: 'none', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
          >
            Refresh
          </Button>
          {isTeacherOrAdmin && (
            <Button
              variant="contained"
              onClick={() => { resetForm(); setCreateOpen(true); }}
              startIcon={<AddIcon />}
              sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
            >
              New Assignment
            </Button>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="assignments portal tabs">
          <Tab label="Coursework List" sx={{ fontWeight: 600, textTransform: 'none' }} />
          {selectedAssignment && isTeacherOrAdmin && (
            <Tab label={`Submissions (${submissions.length})`} sx={{ fontWeight: 600, textTransform: 'none' }} />
          )}
          {selectedAssignment && isTeacherOrAdmin && (
            <Tab label="Performance Analytics" sx={{ fontWeight: 600, textTransform: 'none' }} />
          )}
        </Tabs>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Panel 0: Assignment List */}
      <TabPanel value={activeTab} index={0}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : assignments.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6">No assignments found</Typography>
            <Typography variant="body2" color="textSecondary">There are no assignments published in your classes yet.</Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell><strong>Assignment Title</strong></TableCell>
                  <TableCell><strong>Class</strong></TableCell>
                  <TableCell><strong>Subject</strong></TableCell>
                  <TableCell><strong>Due Date</strong></TableCell>
                  <TableCell><strong>Max Marks</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map((row) => (
                  <TableRow key={row._id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.title}</Typography>
                      <Typography variant="caption" color="textSecondary">{row.description}</Typography>
                    </TableCell>
                    <TableCell>{row.class?.name || 'Class'}</TableCell>
                    <TableCell>{row.subject?.name || 'Subject'}</TableCell>
                    <TableCell>{new Date(row.dueDate).toLocaleString()}</TableCell>
                    <TableCell>{row.maxMarks} Marks</TableCell>
                    <TableCell>
                      {isStudent ? (
                        <Chip
                          label={row.submission ? (row.submission.status === 'Graded' ? `Graded (${row.submission.marksObtained}/${row.maxMarks})` : 'Submitted') : 'Pending'}
                          color={getSubmissionStatusColor(row.submission)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      ) : (
                        <Chip
                          label={row.isPublished ? 'Published' : 'Draft'}
                          color={row.isPublished ? 'success' : 'default'}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {isStudent && (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          {row.attachmentUrl && (
                            <Button size="small" variant="outlined" href={row.attachmentUrl} target="_blank" rel="noopener noreferrer">
                              Download Materials
                            </Button>
                          )}
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<CloudUploadIcon />}
                            onClick={() => { setSelectedAssignment(row); setSubmitOpen(true); }}
                            disabled={row.submission && row.submission.status === 'Graded'}
                          >
                            {row.submission ? 'Resubmit' : 'Submit'}
                          </Button>
                        </Box>
                      )}
                      {isTeacherOrAdmin && (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          {!row.isPublished && (
                            <Tooltip title="Publish to Class">
                              <IconButton color="success" onClick={() => handlePublish(row._id)}>
                                <PublishIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="View Submissions">
                            <IconButton color="primary" onClick={() => handleViewSubmissions(row)}>
                              <AssessmentIcon />
                            </IconButton>
                          </Tooltip>
                          <IconButton color="default" onClick={() => handleEditOpen(row)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDelete(row._id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Panel 1: Submissions */}
      <TabPanel value={activeTab} index={1}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : submissions.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6">No submissions yet</Typography>
            <Typography variant="body2" color="textSecondary">Students have not uploaded files for this assignment yet.</Typography>
          </Paper>
        ) : (
          <Box>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Submitted Solutions</Typography>
              <Button variant="outlined" color="primary" onClick={handleBulkOpen} startIcon={<CheckIcon />}>
                Bulk Evaluation
              </Button>
            </Box>
            <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
              <Table>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell><strong>Student</strong></TableCell>
                    <TableCell><strong>File Name</strong></TableCell>
                    <TableCell><strong>Submitted At</strong></TableCell>
                    <TableCell><strong>Lateness</strong></TableCell>
                    <TableCell><strong>Grade Score</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="right"><strong>Evaluation</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions.map((row) => (
                    <TableRow key={row._id} hover>
                      <TableCell>{row.student ? `${row.student.firstName} ${row.student.lastName}` : 'Student'}</TableCell>
                      <TableCell>
                        {row.fileUrl ? (
                          <a href={row.fileUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#4f46e5', fontWeight: 600 }}>
                            {row.fileName || 'View file'}
                          </a>
                        ) : 'No attachment'}
                      </TableCell>
                      <TableCell>{new Date(row.submittedAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.isLate ? 'Late Submission' : 'On Time'}
                          color={row.isLate ? 'error' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {row.status === 'Graded' ? `${row.marksObtained}/${selectedAssignment?.maxMarks || 100}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip label={row.status} color={row.status === 'Graded' ? 'success' : 'warning'} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <Button variant="contained" size="small" onClick={() => handleGradeOpen(row)}>
                          {row.status === 'Graded' ? 'Re-Grade' : 'Grade'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </TabPanel>

      {/* Panel 2: Analytics */}
      <TabPanel value={activeTab} index={2}>
        {analytics ? (
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ borderRadius: 3, textAlign: 'center', p: 3, borderLeft: '6px solid #6366f1' }}>
                <Typography variant="subtitle2" color="textSecondary">Total Evaluated</Typography>
                <Typography variant="h3" sx={{ my: 1, fontWeight: 700 }}>{analytics.totalEvaluated}</Typography>
                <Typography variant="caption" color="textSecondary">graded attempts</Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ borderRadius: 3, textAlign: 'center', p: 3, borderLeft: '6px solid #10b981' }}>
                <Typography variant="subtitle2" color="textSecondary">Average Score</Typography>
                <Typography variant="h3" sx={{ my: 1, fontWeight: 700 }}>
                  {analytics.averageScore} <Typography component="span" variant="h5">/ {selectedAssignment?.maxMarks || 100}</Typography>
                </Typography>
                <Typography variant="caption" color="textSecondary">academic mean</Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ borderRadius: 3, textAlign: 'center', p: 3, borderLeft: '6px solid #f59e0b' }}>
                <Typography variant="subtitle2" color="textSecondary">Submission Rate</Typography>
                <Typography variant="h3" sx={{ my: 1, fontWeight: 700 }}>{analytics.submissionRate}%</Typography>
                <Typography variant="caption" color="textSecondary">participation</Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Card sx={{ borderRadius: 3, p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Score Bounds Report</Typography>
                <Box sx={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Lowest Score', value: analytics.lowestScore },
                        { name: 'Average Score', value: analytics.averageScore },
                        { name: 'Highest Score', value: analytics.highestScore },
                      ]}
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip />
                      <Bar dataKey="value" fill="#6366f1">
                        {COLORS.slice(0, 3).map((entry, index) => (
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

      {/* Create Assignment Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create New Assignment</DialogTitle>
        <form onSubmit={handleCreateSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Title" name="title" value={formData.title} onChange={handleFormChange} required />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth multiline rows={3} label="Description" name="description" value={formData.description} onChange={handleFormChange} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField select fullWidth label="Class" name="classId" value={formData.classId} onChange={handleFormChange} required>
                  {classes.map((c) => (
                    <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField select fullWidth label="Subject" name="subjectId" value={formData.subjectId} onChange={handleFormChange} required>
                  {subjects.map((s) => (
                    <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth type="datetime-local" label="Due Date" name="dueDate" value={formData.dueDate} onChange={handleFormChange} slotProps={{ inputLabel: { shrink: true } }} required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth type="number" label="Max Marks" name="maxMarks" value={formData.maxMarks} onChange={handleFormChange} required />
              </Grid>
              {/* Late Policy */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Late Submission configuration</Typography>
                <TextField
                  fullWidth
                  type="number"
                  label="Daily Penalty Percentage"
                  name="latePolicy.penaltyPercentagePerDay"
                  value={formData.latePolicy.penaltyPercentagePerDay}
                  onChange={handleFormChange}
                  helperText="Deducted percentage per calendar day of lateness."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Assignment Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Assignment</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Title" name="title" value={formData.title} onChange={handleFormChange} required />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth multiline rows={3} label="Description" name="description" value={formData.description} onChange={handleFormChange} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField select fullWidth label="Class" name="classId" value={formData.classId} onChange={handleFormChange} required>
                  {classes.map((c) => (
                    <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField select fullWidth label="Subject" name="subjectId" value={formData.subjectId} onChange={handleFormChange} required>
                  {subjects.map((s) => (
                    <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth type="datetime-local" label="Due Date" name="dueDate" value={formData.dueDate} onChange={handleFormChange} slotProps={{ inputLabel: { shrink: true } }} required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth type="number" label="Max Marks" name="maxMarks" value={formData.maxMarks} onChange={handleFormChange} required />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Daily Penalty Percentage"
                  name="latePolicy.penaltyPercentagePerDay"
                  value={formData.latePolicy.penaltyPercentagePerDay}
                  onChange={handleFormChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save Changes</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Submit Assignment Dialog */}
      <Dialog open={submitOpen} onClose={() => setSubmitOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Submit Assignment</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Submit your file for: <strong>{selectedAssignment?.title}</strong>. Maximum file size is 10MB (PDF/ZIP/JPEG).
          </Typography>
          {selectedAssignment && (
            <AssignmentUpload assignmentId={selectedAssignment._id} onSuccess={handleUploadSuccess} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Grade Submission Dialog */}
      <Dialog open={gradeOpen} onClose={() => setGradeOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Evaluate Submission</DialogTitle>
        <form onSubmit={handleGradeSubmit}>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Student: <strong>{selectedSubmission?.student?.firstName} {selectedSubmission?.student?.lastName}</strong>
              {selectedSubmission?.isLate && <span style={{ color: 'red', display: 'block' }}>Submitted LATE!</span>}
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  type="number"
                  label={`Marks Obtained (Max ${selectedAssignment?.maxMarks || 100})`}
                  value={gradeData.marksObtained}
                  onChange={(e) => setGradeData({ ...gradeData, marksObtained: Number(e.target.value) })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Teacher Feedback"
                  value={gradeData.feedback}
                  onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setGradeOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save Grade</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Bulk Evaluation Dialog */}
      <Dialog open={bulkOpen} onClose={() => setBulkOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Bulk Evaluation Grid</DialogTitle>
        <DialogContent>
          {bulkGradeItems.length === 0 ? (
            <Typography variant="body1">All submissions have been evaluated.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Student</strong></TableCell>
                    <TableCell><strong>Marks Obtained (Max {selectedAssignment?.maxMarks || 100})</strong></TableCell>
                    <TableCell><strong>Feedback Comments</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bulkGradeItems.map((item, idx) => (
                    <TableRow key={item.submissionId}>
                      <TableCell>{item.studentName}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          value={item.marksObtained}
                          onChange={(e) => handleBulkItemChange(idx, 'marksObtained', e.target.value)}
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={item.feedback}
                          onChange={(e) => handleBulkItemChange(idx, 'feedback', e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setBulkOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleBulkGradeSubmit} disabled={bulkGradeItems.length === 0}>
            Submit All Grades
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
