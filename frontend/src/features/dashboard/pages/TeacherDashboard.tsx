import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  CircularProgress,
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
} from '@mui/material';
import {
  School as SchoolIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  CalendarMonth as CalendarIcon,
  MenuBook as MenuBookIcon,
  Chat as ChatIcon,
  Bolt as BoltIcon,
  ArrowForward as ArrowIcon,
  AutoAwesome as AIIcon,
  TaskAlt as GradeIcon,
  SupervisorAccount as SupervisorIcon,
  People as PeopleIcon,
  Mail as MailIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

// ── Mock Data matching Design Specification ───────────────────────────
const MOCK_TEACHER = {
  name: 'Dr. Sarah Jenkins',
  id: 'TCH-2023-042',
  department: 'Science & Biology',
  schoolName: 'PS Educational Institute',
  classesToday: 4,
  totalStudents: 128,
  pendingAttendance: 2,
  assignmentsPendingReview: 14,
  upcomingExams: 3,
  unreadMessages: 5,
  pendingRequests: 4,
  upcomingMeetings: 2,
};

const MOCK_TODAY_CLASSES = [
  { id: 1, subject: 'Advanced Biology', gradeClass: 'Grade 9-A', time: '08:30 AM – 09:20 AM', location: 'Lab 2', status: 'completed', link: '#' },
  { id: 2, subject: 'Genetics', gradeClass: 'Grade 10-C', time: '09:30 AM – 10:20 AM', location: 'Room 304', status: 'current', link: 'https://zoom.us/j/123456789' },
  { id: 3, subject: 'Introductory Science', gradeClass: 'Grade 7-B', time: '11:00 AM – 11:50 AM', location: 'Room 102', status: 'upcoming', link: '#' },
  { id: 4, subject: 'AP Biology Sem 2', gradeClass: 'Grade 11-A', time: '01:30 PM – 02:20 PM', location: 'Lab 2', status: 'upcoming', link: 'https://zoom.us/j/987654321' },
];

const MOCK_ASSIGNMENTS = [
  { id: 1, title: 'Cell Division Lab Report', subject: 'AP Biology', class: 'Grade 11-A', submitted: 28, total: 32, status: 'evaluating', daysLeft: 1 },
  { id: 2, title: 'Mendelian Genetics Problem Set', subject: 'Genetics', class: 'Grade 10-C', submitted: 18, total: 30, status: 'active', daysLeft: 4 },
  { id: 3, title: 'Photosynthesis Quiz Draft', subject: 'Intro Science', class: 'Grade 7-B', submitted: 0, total: 25, status: 'draft', daysLeft: null },
  { id: 4, title: 'Ecosystems Diagram Submission', subject: 'Advanced Biology', class: 'Grade 9-A', submitted: 32, total: 32, status: 'completed', daysLeft: null },
];

const MOCK_LEAVE_REQUESTS = [
  { id: 1, studentName: 'Ryan Cook', class: 'Grade 9-A', reason: 'Medical appointment', date: 'Today', status: 'pending' },
  { id: 2, studentName: 'Emma Watson', class: 'Grade 10-C', reason: 'Family emergency', date: 'Tomorrow', status: 'pending' },
  { id: 3, studentName: 'Jessie Miller', class: 'Grade 11-A', reason: 'Sore throat & flu', date: 'Jun 8', status: 'pending' },
];

const MOCK_RESOURCES = [
  { id: 1, title: 'Mitosis vs Meiosis Slide Deck', type: 'PPT', class: 'Grade 9-A', size: '12.4 MB' },
  { id: 2, title: 'Genetics Pedigree Chart Guide', type: 'PDF', class: 'Grade 10-C', size: '2.1 MB' },
  { id: 3, title: 'Lab Safety Video Lecture', type: 'Video', class: 'Grade 7-B', size: '240 MB' },
];

const MOCK_COMMUNICATIONS = [
  { name: 'Mrs. Cook (Parent)', role: 'Parent of Ryan Cook', msg: 'Hello Dr. Jenkins, Ryan will miss class today due to an orthodontist appointment.', time: '10 min ago', unread: true },
  { name: 'Principal Miller', role: 'Administration', msg: 'Please review and submit the monthly syllabus coverage worksheet by Friday.', time: '1 hour ago', unread: true },
  { name: 'Academic Cell', role: 'Coordinator', msg: 'The room allocation for AP Biology final exams has been updated to Main Hall A.', time: '1 day ago', unread: false },
];

const STUDENT_PERFORMANCE_ALERTS = [
  { name: 'Alex Mercer', class: 'Grade 9-A', attendance: 68, grade: 58, status: 'high-risk' },
  { name: 'Jane Doe', class: 'Grade 11-A', attendance: 72, grade: 64, status: 'medium-risk' },
  { name: 'Marcus Brody', class: 'Grade 10-C', attendance: 95, grade: 98, status: 'top-performer' },
];

const SUB_TIMETABLE = [
  { day: 'Mon', periods: ['9-A Bio', '11-A AP Bio', '7-B Science', 'Lab Prep'] },
  { day: 'Tue', periods: ['10-C Gen', '9-A Bio', 'Staff Sync', '11-A AP Bio'] },
  { day: 'Wed', periods: ['9-A Bio', '7-B Science', 'Lab Prep', 'Mentoring'] },
  { day: 'Thu', periods: ['10-C Gen', '9-A Bio', 'AP Bio Lab', 'Substitute Duty'] },
  { day: 'Fri', periods: ['11-A AP Bio', '7-B Science', 'Department Meet', 'Mentoring'] },
];

// Helper components
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

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [selectedClassForAttendance, setSelectedClassForAttendance] = useState<string>('');

  // Interactive Checklist State
  const [studentsChecklist, setStudentsChecklist] = useState([
    { id: 1, name: 'Liam Neeson', present: true },
    { id: 2, name: 'John Doe', present: true },
    { id: 3, name: 'Jessica Roy', present: false },
    { id: 4, name: 'Alex Mercer', present: true },
    { id: 5, name: 'Emily Clarke', present: true },
  ]);

  // AI Generator Mock State
  const [aiInput, setAiInput] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Command Search Bar (Cmd + K panel simulation)
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');

  // Handle AI generation simulation
  const handleAIGenerate = (type: string) => {
    setAiLoading(true);
    setAiOutput('');
    setTimeout(() => {
      setAiLoading(false);
      if (type === 'lesson') {
        setAiOutput(
          `📚 **Syllabus Draft: Mendelian Genetics (45 Mins)**\n\n` +
          `1. **Focus/Intro (10m)**: Review Mendel's Pea plant experiments. Outline phenotype vs genotype.\n` +
          `2. **Direct Instruction (15m)**: Introduce Punnett Squares (monohybrid cross). Demonstrate homozygous vs heterozygous traits.\n` +
          `3. **Guided Practice (10m)**: Draw crosses on board (e.g. Bb x Bb) and calculate 3:1 ratio probabilities.\n` +
          `4. **Exit Ticket (10m)**: Assign 2-question quiz to assess individual understanding.`
        );
      } else if (type === 'quiz') {
        setAiOutput(
          `📝 **Smart Quiz: Cell Mitosis (5 Questions)**\n\n` +
          `1. *Which phase of mitosis involves chromosomes lining up at the cell equator?* (Metaphase)\n` +
          `2. *What structure produces spindle fibers during prophase?* (Centrioles)\n` +
          `3. *True/False: Sister chromatids separate during Anaphase.* (True)\n` +
          `4. *In what stage does the nuclear membrane reform?* (Telophase)\n` +
          `5. *Differentiate Cytokinesis from Mitosis.* (Cytoplasmic division vs nuclear division).`
        );
      }
    }, 1200);
  };

  const toggleStudentAttendance = (id: number) => {
    setStudentsChecklist(prev =>
      prev.map(s => (s.id === id ? { ...s, present: !s.present } : s))
    );
  };

  const handleOpenAttendance = (className: string) => {
    setSelectedClassForAttendance(className);
    setAttendanceDialogOpen(true);
  };

  const handleSaveAttendance = () => {
    setAttendanceDialogOpen(false);
    alert(`Attendance successfully logged for ${selectedClassForAttendance}!`);
  };

  return (
    <Box sx={{ pb: 6 }}>

      {/* ═══ 1. COMMAND PANEL TRIGGER ═══ */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<SearchIcon />}
          onClick={() => setCommandOpen(true)}
          sx={{ textTransform: 'none', borderRadius: 2.5, fontWeight: 600 }}
        >
          Quick Search / Cmd + K
        </Button>
      </Box>

      {/* ═══ 2. HERO BANNER ═══ */}
      <Card
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #0d3b4c 100%)',
          color: 'white',
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(79,70,229,0.2)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(99,102,241,0.15)', filter: 'blur(40px)' }} />
        <Box sx={{ position: 'absolute', bottom: -50, left: '20%', width: 180, height: 180, borderRadius: '50%', bgcolor: 'rgba(16,185,129,0.12)', filter: 'blur(35px)' }} />

        <CardContent sx={{ p: { xs: 3, md: 4 }, position: 'relative', zIndex: 2 }}>
          <Grid container spacing={3} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant="overline" sx={{ opacity: 0.6, letterSpacing: 2, fontWeight: 700 }}>FACULTY PORTAL</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5, mb: 1, fontFamily: "'Outfit', sans-serif" }}>
                Welcome back, {MOCK_TEACHER.name} 👋
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 2.5, fontFamily: "'Inter', sans-serif" }}>
                {MOCK_TEACHER.department} Department · Room allocation: Lab 2 / Block B
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {[
                  { label: `${MOCK_TEACHER.classesToday} Classes Today`, color: '#6366f1' },
                  { label: `${MOCK_TEACHER.totalStudents} Students`, color: '#0d9488' },
                  { label: `${MOCK_TEACHER.assignmentsPendingReview} To Grade`, color: '#f59e0b' },
                  { label: `${MOCK_TEACHER.pendingAttendance} Pending Attendance`, color: '#ef4444' },
                ].map((item) => (
                  <Chip
                    key={item.label}
                    label={item.label}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      fontWeight: 600,
                      backdropFilter: 'blur(8px)',
                    }}
                  />
                ))}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2, bgcolor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 3, p: 2, backdropFilter: 'blur(10px)' }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: '#10b981', fontWeight: 800 }}>SJ</Avatar>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{MOCK_TEACHER.name}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>ID: {MOCK_TEACHER.id}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>{MOCK_TEACHER.schoolName}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ═══ 3. QUICK SHORTCUTS ACTIONS BAR ═══ */}
      <Card sx={{ mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }} elevation={0}>
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <BoltIcon fontSize="small" color="primary" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }} color="text.secondary">
              Direct Shortcuts
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {[
              { label: 'Mark Attendance', icon: <CheckCircleIcon />, color: '#10b981', action: () => handleOpenAttendance('General Class') },
              { label: 'Create Assignment', icon: <AssignmentIcon />, color: '#6366f1', path: '/marks' },
              { label: 'Enter Grades', icon: <GradeIcon />, color: '#3b82f6', path: '/marks' },
              { label: 'Broadcast Announcement', icon: <NotificationsIcon />, color: '#f59e0b', path: '/notifications' },
              { label: 'Schedule Meeting', icon: <EventIcon />, color: '#ec4899', path: '/timetables' },
              { label: 'AI Assistant', icon: <AIIcon />, color: '#8b5cf6', action: () => { document.getElementById('ai-tools-section')?.scrollIntoView({ behavior: 'smooth' }) } },
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

      {/* ═══ 4. SCHEDULE TIMELINE & DOCK ═══ */}
      <Grid container spacing={3} sx={{ mb: 4 }}>

        {/* Schedule */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <SectionTitle
                icon={<CalendarIcon />}
                title="Today's Teaching Schedule"
                subtitle="Classes allocated for today"
                action={
                  <Button size="small" endIcon={<ArrowIcon />} sx={{ textTransform: 'none', fontWeight: 600 }} onClick={() => navigate('/timetables')}>
                    Weekly Schedule
                  </Button>
                }
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {MOCK_TODAY_CLASSES.map((cls) => {
                  const isCurrent = cls.status === 'current';
                  const isCompleted = cls.status === 'completed';
                  return (
                    <Box
                      key={cls.id}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: isCurrent ? 'primary.main' : 'divider',
                        bgcolor: isCurrent ? 'primary.main' + '08' : isCompleted ? 'action.hover' : 'background.paper',
                        opacity: isCompleted ? 0.7 : 1,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: 'space-between',
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 700 }}>{cls.subject}</Typography>
                          <Chip label={cls.gradeClass} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                          {isCurrent && <Chip label="CURRENT CLASS" color="primary" size="small" sx={{ fontWeight: 700, height: 18, fontSize: '0.6rem' }} />}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {cls.time} · {cls.location}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' }, justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          disableElevation
                          onClick={() => handleOpenAttendance(cls.gradeClass)}
                          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                        >
                          Mark Attendance
                        </Button>
                        {cls.link !== '#' && (
                          <Button
                            size="small"
                            variant="outlined"
                            href={cls.link}
                            target="_blank"
                            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                          >
                            Online Link
                          </Button>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Analytics performance charts */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <SectionTitle icon={<TrendingUpIcon />} title="Performance Distribution" subtitle="Active Term grades across student registry" />
              <Box sx={{ height: 200, width: '100%', mb: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'A', count: 18, fill: '#6366f1' },
                    { name: 'B', count: 32, fill: '#0d9488' },
                    { name: 'C', count: 25, fill: '#3b82f6' },
                    { name: 'D', count: 8, fill: '#f59e0b' },
                    { name: 'F', count: 2, fill: '#ef4444' },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tickLine={false} style={{ fontSize: '0.75rem' }} />
                    <YAxis tickLine={false} axisLine={false} style={{ fontSize: '0.75rem' }} />
                    <RechartsTooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <strong>Class Average: 82%</strong>. Recommended revision session scheduled for mitosis cycle.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ═══ 5. ASSIGNMENTS & DISCUSSIONS ═══ */}
      <Grid container spacing={3} sx={{ mb: 4 }}>

        {/* Assignments */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <SectionTitle
                icon={<AssignmentIcon />}
                title="Assignments & Review Center"
                subtitle="Evaluate pending homeworks & worksheets"
              />
              <Tabs
                value={activeTab}
                onChange={(_, val) => setActiveTab(val)}
                sx={{ mb: 2, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 36, fontSize: '0.8rem' } }}
              >
                <Tab label="Evaluating (2)" />
                <Tab label="Active (1)" />
                <Tab label="Drafts (1)" />
              </Tabs>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {MOCK_ASSIGNMENTS
                  .filter((a) => {
                    if (activeTab === 0) return a.status === 'evaluating' || a.status === 'completed';
                    if (activeTab === 1) return a.status === 'active';
                    return a.status === 'draft';
                  })
                  .map((a) => (
                    <Box
                      key={a.id}
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
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{a.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {a.subject} · {a.class} {a.daysLeft ? `· Due in ${a.daysLeft}d` : ''}
                        </Typography>
                        <Box sx={{ width: '100%', mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Submissions: {a.submitted} / {a.total}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(a.submitted / a.total) * 100 || 0}
                            sx={{ height: 4, borderRadius: 2, mt: 0.5 }}
                          />
                        </Box>
                      </Box>
                      <Box>
                        {a.status === 'evaluating' ? (
                          <Button size="small" variant="contained" disableElevation onClick={() => navigate('/marks')} sx={{ textTransform: 'none', borderRadius: 1.5 }}>
                            Grade
                          </Button>
                        ) : (
                          <Chip label={a.status.toUpperCase()} size="small" variant="outlined" />
                        )}
                      </Box>
                    </Box>
                  ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Messaging & Announcements */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <SectionTitle
                icon={<ChatIcon />}
                title="Inbox & Communication"
                subtitle="Recent updates from parents & admin"
              />
              <List disablePadding>
                {MOCK_COMMUNICATIONS.map((c, idx) => (
                  <React.Fragment key={c.name}>
                    <ListItem sx={{ px: 0, py: 1.5, alignItems: 'flex-start' }}>
                      <Avatar sx={{ bgcolor: c.unread ? 'primary.main' : 'text.disabled', mr: 2, width: 36, height: 36, fontSize: '0.85rem' }}>
                        {c.name[0]}
                      </Avatar>
                      <ListItemText
                        disableTypography
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{c.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{c.time}</Typography>
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{c.role}</Typography>
                            <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.5, fontSize: '0.8rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {c.msg}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {idx < MOCK_COMMUNICATIONS.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ═══ 6. AI-ASSISTED CO-PILOT MODULE ═══ */}
      <Card id="ai-tools-section" elevation={0} sx={{ border: '1.5px solid #8b5cf6', bgcolor: '#faf5ff', borderRadius: 3, mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <AIIcon sx={{ color: '#8b5cf6' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#6d28d9', fontFamily: "'Outfit', sans-serif" }}>
                AI-Assisted Co-Pilot Tool
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "'Inter', sans-serif" }}>
                Generate instant, curriculum-aligned lesson outlines or quiz banks using local context
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Type lesson theme or textbook chapter name here... (e.g., Mitosis cell division)"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  mb: 2,
                  '& .MuiOutlinedInput-root': { borderRadius: 2 }
                }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  disableElevation
                  startIcon={<AIIcon />}
                  onClick={() => handleAIGenerate('lesson')}
                  sx={{ textTransform: 'none', bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' }, fontWeight: 700, borderRadius: 2, flex: 1 }}
                >
                  Generate Plan
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => handleAIGenerate('quiz')}
                  sx={{ textTransform: 'none', color: '#8b5cf6', borderColor: '#8b5cf6', fontWeight: 600, borderRadius: 2, flex: 1 }}
                >
                  Generate Quiz
                </Button>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Card sx={{ minHeight: 150, bgcolor: 'background.paper', border: '1px dashed #c084fc', borderRadius: 2 }}>
                <CardContent>
                  {aiLoading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4, gap: 2 }}>
                      <CircularProgress size={30} color="secondary" />
                      <Typography variant="caption" color="text.secondary">Building learning syllabus outcomes...</Typography>
                    </Box>
                  ) : aiOutput ? (
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line', fontFamily: "'Inter', sans-serif" }}>
                      {aiOutput}
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4, color: 'text.disabled' }}>
                      <AIIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                      <Typography variant="caption">Generated outcomes will stream here.</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ═══ 7. APPROVALS & ATTENDANCE TRENDS ═══ */}
      <Grid container spacing={3}>

        {/* Approvals */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <SectionTitle
                icon={<SupervisorIcon />}
                title="Student Requests & Leaves"
                subtitle="Pending administrative permissions"
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {MOCK_LEAVE_REQUESTS.map((req) => (
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
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{req.studentName}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {req.class} · {req.reason}
                      </Typography>
                      <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                        Date Requested: {req.date}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" color="success" sx={{ border: '1px solid' }}>
                        <CheckIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" sx={{ border: '1px solid' }}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Resources & Syllabus schedule */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <SectionTitle
                icon={<MenuBookIcon />}
                title="Learning Resources & Materials"
                subtitle="Distribute notes and study guides to students"
                action={<Button size="small" endIcon={<DownloadIcon />} sx={{ textTransform: 'none', fontWeight: 600 }}>Add Resource</Button>}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {MOCK_RESOURCES.map((res) => (
                  <Box
                    key={res.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'primary.main' + '08', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>
                      {res.type}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{res.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{res.class} · {res.size}</Typography>
                    </Box>
                    <IconButton size="small">
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── ATTENDANCE ENTRY DIALOG ────────────────────────────────────── */}
      <Dialog open={attendanceDialogOpen} onClose={() => setAttendanceDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
          Record Attendance - {selectedClassForAttendance}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
            Uncheck the box to mark a student absent. Marked values will be saved in the master registry.
          </Typography>
          <List>
            {studentsChecklist.map((std) => (
              <ListItem key={std.id} disablePadding sx={{ py: 0.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={std.present}
                      onChange={() => toggleStudentAttendance(std.id)}
                      color="success"
                    />
                  }
                  label={<Typography variant="body2" sx={{ fontWeight: 600 }}>{std.name}</Typography>}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttendanceDialogOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleSaveAttendance} variant="contained" disableElevation sx={{ textTransform: 'none', borderRadius: 2 }}>
            Save Attendance
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── QUICK SEARCH COMMAND BOX DIALOG ───────────────────────────── */}
      <Dialog open={commandOpen} onClose={() => setCommandOpen(false)} fullWidth maxWidth="xs">
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Type a command or student name..."
            variant="outlined"
            value={commandQuery}
            onChange={(e) => setCommandQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }
            }}
            sx={{ mb: 2 }}
          />
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>Quick Actions Suggestions</Typography>
          <List>
            {[
              { text: 'Mark Grade 9-A Attendance', action: () => { setCommandOpen(false); handleOpenAttendance('Grade 9-A'); } },
              { text: 'Create Exam Assessment Sheet', action: () => { setCommandOpen(false); navigate('/examinations'); } },
              { text: 'Open Local AI Quiz Architect', action: () => { setCommandOpen(false); document.getElementById('ai-tools-section')?.scrollIntoView({ behavior: 'smooth' }); } },
            ].filter(i => i.text.toLowerCase().includes(commandQuery.toLowerCase())).map((item) => (
              <ListItem key={item.text} disablePadding>
                <Button fullWidth onClick={item.action} sx={{ textTransform: 'none', justifyContent: 'flex-start', color: 'text.primary', py: 1 }}>
                  {item.text}
                </Button>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

    </Box>
  );
};

export default TeacherDashboard;
