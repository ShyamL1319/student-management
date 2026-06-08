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
  AccountBalance as AccountBalanceIcon,
  EmojiEvents as TrophyIcon,
  VideoCameraFront as VideoIcon,
  Download as DownloadIcon,
  PlayCircle as PlayIcon,
  Warning as WarningIcon,
  Timer as TimerIcon,
  Star as StarIcon,
  HealthAndSafety as HealthIcon,
  Work as WorkIcon,
  ArrowForward as ArrowIcon,
  Bolt as BoltIcon,
  FiberManualRecord as DotIcon,
  Grade as GradeIcon,
  AddTask as AddTaskIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { DashboardResponse } from '../api/dashboardApi';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

// ── Mock Data ─────────────────────────────────────────
const MOCK_STUDENT = {
  name: 'Priya Sharma',
  id: 'STU-2024-089',
  class: 'XII-A',
  section: 'Science',
  rollNo: '089',
  academicYear: '2024-2025',
  gpa: 3.85,
  attendancePct: 92,
  completedAssignments: 18,
  pendingAssignments: 4,
  upcomingExams: 3,
  subjectsEnrolled: 6,
  notifications: 7,
};

const MOCK_SCHEDULE = [
  { id: 1, subject: 'Physics', teacher: 'Dr. A. Kumar', time: '08:00 – 09:00', room: 'Room 301', status: 'completed', color: '#6366f1' },
  { id: 2, subject: 'Mathematics', teacher: 'Prof. R. Gupta', time: '09:15 – 10:15', room: 'Room 204', status: 'current', color: '#0d9488' },
  { id: 3, subject: 'Chemistry', teacher: 'Dr. S. Mehta', time: '10:30 – 11:30', room: 'Lab 2', status: 'upcoming', color: '#f59e0b' },
  { id: 4, subject: 'English', teacher: 'Ms. P. Verma', time: '12:00 – 13:00', room: 'Room 108', status: 'upcoming', color: '#ec4899' },
  { id: 5, subject: 'Biology', teacher: 'Dr. M. Singh', time: '14:00 – 15:00', room: 'Lab 1', status: 'upcoming', color: '#22c55e' },
];

const MOCK_ASSIGNMENTS = [
  { id: 1, title: 'Wave Optics Lab Report', subject: 'Physics', due: 'Tomorrow', status: 'pending', priority: 'high' },
  { id: 2, title: 'Integration Exercises – Set C', subject: 'Mathematics', due: 'In 2 days', status: 'pending', priority: 'medium' },
  { id: 3, title: 'Organic Chemistry Review', subject: 'Chemistry', due: 'In 3 days', status: 'pending', priority: 'low' },
  { id: 4, title: 'Essay – Climate Change', subject: 'English', due: 'Jun 12', status: 'submitted', priority: 'low' },
  { id: 5, title: 'Cell Division Notes', subject: 'Biology', due: 'Jun 10', status: 'graded', priority: 'low', grade: 'A' },
];

const MOCK_EXAMS = [
  { id: 1, subject: 'Physics', date: 'Jun 20', time: '10:00 AM', venue: 'Hall A', countdown: 14 },
  { id: 2, subject: 'Mathematics', date: 'Jun 22', time: '09:00 AM', venue: 'Hall B', countdown: 16 },
  { id: 3, subject: 'Chemistry', date: 'Jun 25', time: '10:00 AM', venue: 'Lab Block', countdown: 19 },
];

const MOCK_ATTENDANCE = [
  { subject: 'Physics', attended: 44, total: 48, pct: 92 },
  { subject: 'Mathematics', attended: 46, total: 50, pct: 92 },
  { subject: 'Chemistry', attended: 40, total: 46, pct: 87 },
  { subject: 'English', attended: 48, total: 50, pct: 96 },
  { subject: 'Biology', attended: 38, total: 44, pct: 86 },
  { subject: 'Computer Sc.', attended: 42, total: 44, pct: 95 },
];

const MOCK_SUBJECTS = [
  { name: 'Physics', score: 88, color: '#6366f1' },
  { name: 'Mathematics', score: 95, color: '#0d9488' },
  { name: 'Chemistry', score: 76, color: '#f59e0b' },
  { name: 'English', score: 82, color: '#ec4899' },
  { name: 'Biology', score: 90, color: '#22c55e' },
  { name: 'Computer Sc.', score: 97, color: '#3b82f6' },
];

const MOCK_GROWTH = [
  { month: 'Jan', gpa: 3.4 }, { month: 'Feb', gpa: 3.5 }, { month: 'Mar', gpa: 3.6 },
  { month: 'Apr', gpa: 3.7 }, { month: 'May', gpa: 3.8 }, { month: 'Jun', gpa: 3.85 },
];

const MOCK_RESOURCES = [
  { id: 1, title: 'Wave Optics – Chapter Notes', type: 'PDF', subject: 'Physics', size: '2.4 MB' },
  { id: 2, title: 'Calculus Lecture Recording', type: 'Video', subject: 'Mathematics', size: '480 MB' },
  { id: 3, title: 'Periodic Table Reference', type: 'PDF', subject: 'Chemistry', size: '1.1 MB' },
  { id: 4, title: 'Grammar Workbook', type: 'E-Book', subject: 'English', size: '8.3 MB' },
];

const MOCK_ANNOUNCEMENTS = [
  { id: 1, title: 'Term Examination Schedule Released', type: 'exam', time: '2 hours ago', urgent: true },
  { id: 2, title: 'Annual Sports Day – June 28th', type: 'event', time: '1 day ago', urgent: false },
  { id: 3, title: 'Library Books Due – June 15th', type: 'notice', time: '2 days ago', urgent: false },
  { id: 4, title: 'Parent-Teacher Meeting – June 18th', type: 'notice', time: '3 days ago', urgent: false },
];

const MOCK_FEES = {
  paid: 45000,
  outstanding: 12500,
  dueDate: 'Jun 30, 2025',
  history: [
    { desc: 'Term 1 Tuition', date: 'Jan 5', amount: 22500, status: 'paid' },
    { desc: 'Lab Fees', date: 'Jan 5', amount: 5000, status: 'paid' },
    { desc: 'Activity Fee', date: 'Mar 1', amount: 7500, status: 'paid' },
    { desc: 'Term 2 Tuition', date: 'Jun 30', amount: 12500, status: 'pending' },
  ],
};

const MOCK_ACHIEVEMENTS = [
  { id: 1, title: 'Perfect Attendance', subtitle: 'March 2025', icon: '🏅' },
  { id: 2, title: 'Top Scorer – Math', subtitle: 'Mid-term 2025', icon: '🥇' },
  { id: 3, title: 'Science Olympiad', subtitle: 'District Level', icon: '🔬' },
  { id: 4, title: 'Essay Winner', subtitle: 'School Level', icon: '✍️' },
];

const QUICK_ACTIONS = [
  { label: 'Join Class', icon: <VideoIcon />, color: '#0d9488', path: '/timetables' },
  { label: 'Apply Leave', icon: <CalendarIcon />, color: '#6366f1', path: '/attendances' },
  { label: 'Attendance', icon: <CheckCircleIcon />, color: '#22c55e', path: '/attendances' },
  { label: 'Submit Work', icon: <AddTaskIcon />, color: '#f59e0b', path: '/marks' },
  { label: 'Exam Info', icon: <EventIcon />, color: '#ef4444', path: '/examinations' },
  { label: 'Pay Fees', icon: <AccountBalanceIcon />, color: '#3b82f6', path: '/fees' },
  { label: 'Resources', icon: <MenuBookIcon />, color: '#8b5cf6', path: '/notifications' },
  { label: 'Message', icon: <ChatIcon />, color: '#ec4899', path: '/notifications' },
];

// ── Helper Components ──────────────────────────────────
const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
    completed: { label: 'Done', color: 'success' },
    current: { label: 'Now', color: 'warning' },
    upcoming: { label: 'Up Next', color: 'default' },
    submitted: { label: 'Submitted', color: 'success' },
    graded: { label: 'Graded', color: 'success' },
    pending: { label: 'Pending', color: 'warning' },
  };
  const cfg = map[status] ?? { label: status, color: 'default' as const };
  return <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />;
};

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
        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{title}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
      </Box>
    </Box>
    {action}
  </Box>
);

// ── Main Component ─────────────────────────────────────
interface StudentDashboardProps {
  data: DashboardResponse;
  firstName?: string;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ data, firstName = 'Priya' }) => {
  const navigate = useNavigate();
  const [assignmentTab, setAssignmentTab] = useState(0);

  const student = {
    name: firstName || MOCK_STUDENT.name,
    id: MOCK_STUDENT.id,
    class: MOCK_STUDENT.class,
    section: MOCK_STUDENT.section,
    rollNo: MOCK_STUDENT.rollNo,
    academicYear: MOCK_STUDENT.academicYear,
    gpa: data.widgets?.gpa ?? MOCK_STUDENT.gpa,
    attendancePct: data.widgets?.attendancePercentage ?? MOCK_STUDENT.attendancePct,
    completedAssignments: data.widgets?.completedAssignments ?? MOCK_STUDENT.completedAssignments,
    pendingAssignments: data.widgets?.pendingAssignments ?? MOCK_STUDENT.pendingAssignments,
    upcomingExams: data.widgets?.upcomingExams ?? MOCK_STUDENT.upcomingExams,
    subjectsEnrolled: data.widgets?.subjectsEnrolled ?? MOCK_STUDENT.subjectsEnrolled,
    notifications: data.widgets?.notifications ?? MOCK_STUDENT.notifications,
  };

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <Box sx={{ pb: 4 }}>

      {/* ═══ 1. HERO BANNER ═══ */}
      <Card
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0d4a3a 100%)',
          color: 'white',
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(99,102,241,0.25)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', bgcolor: 'rgba(99,102,241,0.12)', filter: 'blur(40px)' }} />
        <Box sx={{ position: 'absolute', bottom: -40, left: '30%', width: 160, height: 160, borderRadius: '50%', bgcolor: 'rgba(13,148,136,0.15)', filter: 'blur(30px)' }} />

        <CardContent sx={{ p: { xs: 3, md: 4 }, position: 'relative', zIndex: 2 }}>
          <Grid container spacing={3} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="overline" sx={{ opacity: 0.6, letterSpacing: 2 }}>STUDENT PORTAL</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5, mb: 0.5 }}>
                {greeting}, {firstName}! 👋
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.75, mb: 2.5 }}>
                Class {student.class} · Roll #{student.rollNo} · {student.academicYear}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {[
                  { label: `GPA ${student.gpa}`, bg: 'rgba(99,102,241,0.3)', border: 'rgba(99,102,241,0.5)' },
                  { label: `${student.attendancePct}% Attendance`, bg: 'rgba(13,148,136,0.3)', border: 'rgba(13,148,136,0.5)' },
                  { label: `${student.pendingAssignments} Pending`, bg: 'rgba(245,158,11,0.25)', border: 'rgba(245,158,11,0.4)' },
                  { label: `${student.upcomingExams} Exams`, bg: 'rgba(239,68,68,0.25)', border: 'rgba(239,68,68,0.4)' },
                ].map((p) => (
                  <Box key={p.label} sx={{ px: 1.5, py: 0.5, bgcolor: p.bg, border: `1px solid ${p.border}`, borderRadius: 5, backdropFilter: 'blur(8px)' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{p.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2, bgcolor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 3, p: 2 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: '#6366f1', fontWeight: 800, fontSize: '1.2rem' }}>
                  {firstName[0]}
                </Avatar>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{student.name}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>ID: {student.id}</Typography>
                  <br />
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>{student.section} Stream</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ═══ 2. QUICK ACTIONS BAR ═══ */}
      <Card sx={{ mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }} elevation={0}>
        <CardContent sx={{ py: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <BoltIcon fontSize="small" color="primary" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }} color="text.secondary">
              Quick Actions
            </Typography>
          </Box>
          <Grid container spacing={1.5}>
            {QUICK_ACTIONS.map((qa) => (
              <Grid size={{ xs: 6, sm: 3, md: 'auto' }} key={qa.label} sx={{ flex: { md: 1 } }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate(qa.path)}
                  startIcon={<Box component="span" sx={{ color: qa.color, display: 'flex', alignItems: 'center' }}>{qa.icon}</Box>}
                  sx={{
                    borderColor: 'divider',
                    color: 'text.primary',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    py: 1.25,
                    borderRadius: 2.5,
                    textTransform: 'none',
                    transition: 'all 0.15s',
                    '&:hover': { borderColor: qa.color, bgcolor: `${qa.color}12`, color: qa.color, transform: 'translateY(-1px)' },
                  }}
                >
                  {qa.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* ═══ 3. SUMMARY STAT CARDS ═══ */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: 'Attendance', value: `${student.attendancePct}%`, sub: 'This semester', icon: <CheckCircleIcon />, color: '#22c55e', bg: '#f0fdf4', border: '#86efac' },
          { label: 'Current GPA', value: `${student.gpa}`, sub: 'Out of 4.0', icon: <TrendingUpIcon />, color: '#6366f1', bg: '#f0f0ff', border: '#c4b5fd' },
          { label: 'Pending', value: `${student.pendingAssignments}`, sub: 'Assignments due', icon: <AssignmentIcon />, color: '#f59e0b', bg: '#fffbeb', border: '#fcd34d' },
          { label: 'Upcoming Exams', value: `${student.upcomingExams}`, sub: 'This month', icon: <EventIcon />, color: '#ef4444', bg: '#fef2f2', border: '#fca5a5' },
          { label: 'Completed', value: `${student.completedAssignments}`, sub: 'Assignments done', icon: <AddTaskIcon />, color: '#0d9488', bg: '#f0fdfa', border: '#99f6e4' },
          { label: 'Subjects', value: `${student.subjectsEnrolled}`, sub: 'Enrolled this term', icon: <SchoolIcon />, color: '#3b82f6', bg: '#eff6ff', border: '#93c5fd' },
          { label: "Today's Classes", value: `${(data.scheduleToday || MOCK_SCHEDULE).length}`, sub: 'Scheduled today', icon: <CalendarIcon />, color: '#8b5cf6', bg: '#faf5ff', border: '#d8b4fe' },
          { label: 'Notifications', value: `${student.notifications}`, sub: 'Unread alerts', icon: <NotificationsIcon />, color: '#ec4899', bg: '#fdf2f8', border: '#f9a8d4' },
        ].map((s) => (
          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={s.label}>
            <Card
              elevation={0}
              sx={{
                border: `1.5px solid ${s.border}`,
                bgcolor: s.bg,
                borderRadius: 3,
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 8px 24px ${s.color}22` },
                cursor: 'pointer',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, mb: 1.5 }}>
                  {s.icon}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: s.color, letterSpacing: -0.5 }}>{s.value}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.25 }} color="text.primary">{s.label}</Typography>
                <Typography variant="caption" color="text.secondary">{s.sub}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ═══ 4. TODAY'S SCHEDULE  +  ACADEMIC PROGRESS ═══ */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <SectionTitle
                icon={<CalendarIcon />}
                title="Today's Schedule"
                subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                action={
                  <Button size="small" endIcon={<ArrowIcon />} sx={{ textTransform: 'none', fontWeight: 600 }} onClick={() => navigate('/timetables')}>
                    Full Timetable
                  </Button>
                }
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {(data.scheduleToday || MOCK_SCHEDULE).map((cls: any) => (
                  <Box
                    key={cls.id}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 2, p: 2,
                      borderRadius: 2.5,
                      border: `1.5px solid ${cls.status === 'current' ? cls.color : 'transparent'}`,
                      bgcolor: cls.status === 'current' ? `${cls.color}10` : cls.status === 'completed' ? 'action.hover' : 'background.paper',
                      position: 'relative', overflow: 'hidden',
                      opacity: cls.status === 'completed' ? 0.65 : 1,
                      transition: 'box-shadow 0.15s',
                      '&:hover': { boxShadow: `0 4px 16px ${cls.color}20` },
                    }}
                  >
                    <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: cls.color, borderRadius: '4px 0 0 4px' }} />
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: `${cls.color}18`, color: cls.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ml: 0.5 }}>
                      <SchoolIcon fontSize="small" />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{cls.subject}</Typography>
                        {cls.status === 'current' && <Chip label="LIVE" size="small" sx={{ bgcolor: cls.color, color: 'white', fontWeight: 800, height: 18, fontSize: '0.6rem' }} />}
                      </Box>
                      <Typography variant="caption" color="text.secondary">{cls.teacher} · {cls.room}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }} color="text.secondary" >{cls.time}</Typography>
                      <StatusChip status={cls.status} />
                    </Box>
                    {cls.status === 'current' && (
                      <Button size="small" variant="contained" sx={{ flexShrink: 0, textTransform: 'none', fontWeight: 700, bgcolor: cls.color, '&:hover': { bgcolor: cls.color }, borderRadius: 2 }} startIcon={<VideoIcon fontSize="small" />}>
                        Join
                      </Button>
                    )}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <SectionTitle icon={<TrendingUpIcon />} title="Academic Progress" subtitle="GPA growth this semester" />
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress variant="determinate" value={(student.gpa / 4) * 100} size={110} thickness={5} sx={{ color: '#6366f1' }} />
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }} color="#6366f1">{student.gpa}</Typography>
                    <Typography variant="caption" color="text.secondary">GPA</Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ height: 100, mb: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.charts?.gpaGrowth || MOCK_GROWTH} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gpaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis domain={[3.2, 4.0]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: 8, fontSize: '0.8rem', border: '1px solid #e2e8f0' }} />
                    <Area type="monotone" dataKey="gpa" stroke="#6366f1" strokeWidth={2.5} fill="url(#gpaGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {(data.charts?.subjectsScores || MOCK_SUBJECTS).map((s: any) => (
                  <Box key={s.name}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>{s.name}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: s.color || '#6366f1' }}>{s.score}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={s.score}
                      sx={{ height: 5, borderRadius: 3, bgcolor: `${s.color || '#6366f1'}20`, '& .MuiLinearProgress-bar': { bgcolor: s.color || '#6366f1', borderRadius: 3 } }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ═══ 5. ASSIGNMENT CENTER  +  UPCOMING EXAMS ═══ */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent>
              <SectionTitle
                icon={<AssignmentIcon />}
                title="Assignment Center"
                subtitle="Track, submit and monitor your work"
                action={
                  <Button size="small" variant="contained" disableElevation sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }} onClick={() => navigate('/marks')}>
                    Submit Work
                  </Button>
                }
              />
              <Tabs
                value={assignmentTab}
                onChange={(_, v) => setAssignmentTab(v)}
                sx={{ mb: 2, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 36, fontSize: '0.8rem' } }}
              >
                <Tab label={`Pending (${(data.assignments || MOCK_ASSIGNMENTS).filter((a: any) => a.status === 'pending').length})`} />
                <Tab label="Submitted" />
                <Tab label="Graded" />
              </Tabs>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {(data.assignments || MOCK_ASSIGNMENTS)
                  .filter((a: any) => {
                    if (assignmentTab === 0) return a.status === 'pending';
                    if (assignmentTab === 1) return a.status === 'submitted';
                    return a.status === 'graded';
                  })
                  .map((a: any) => {
                    const priorityColor = a.priority === 'high' ? '#ef4444' : a.priority === 'medium' ? '#f59e0b' : '#22c55e';
                    return (
                      <Box
                        key={a.id}
                        sx={{
                          p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider',
                          display: 'flex', alignItems: 'center', gap: 2,
                          transition: 'box-shadow 0.15s', '&:hover': { boxShadow: 2 },
                        }}
                      >
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: priorityColor, flexShrink: 0 }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{a.title}</Typography>
                          <Typography variant="caption" color="text.secondary">{a.subject} · Due: {a.due}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                          {'grade' in a && a.grade && <Chip label={`Grade: ${a.grade}`} size="small" color="success" />}
                          <StatusChip status={a.status} />
                          {a.status === 'pending' && (
                            <Tooltip title="Submit">
                              <IconButton size="small" color="primary" onClick={() => navigate('/marks')}>
                                <ArrowIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <SectionTitle
                icon={<EventIcon />}
                title="Upcoming Exams"
                subtitle="Stay prepared — schedule & countdown"
                action={
                  <Button size="small" endIcon={<DownloadIcon />} sx={{ textTransform: 'none', fontWeight: 600 }}>
                    Hall Ticket
                  </Button>
                }
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {(data.exams || MOCK_EXAMS).map((exam: any) => (
                  <Box
                    key={exam.id}
                    sx={{ p: 2, borderRadius: 2.5, background: 'linear-gradient(135deg, #fef2f2 0%, #fff5f5 100%)', border: '1px solid #fca5a5' }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{exam.subject}</Typography>
                        <Typography variant="caption" color="text.secondary">{exam.date} · {exam.time} · {exam.venue}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#ef4444' }}>
                          <TimerIcon sx={{ fontSize: 14 }} />
                          <Typography variant="caption" sx={{ fontWeight: 800 }} color="#ef4444">{exam.countdown}d</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">remaining</Typography>
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.max(0, 100 - (exam.countdown / 30) * 100)}
                      sx={{ mt: 1.5, height: 4, borderRadius: 2, bgcolor: '#fecaca', '& .MuiLinearProgress-bar': { bgcolor: '#ef4444' } }}
                    />
                  </Box>
                ))}
                <Button variant="outlined" color="error" fullWidth sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }} onClick={() => navigate('/examinations')}>
                  Full Exam Schedule →
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ═══ 6. ATTENDANCE MANAGEMENT ═══ */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 4 }}>
        <CardContent>
          <SectionTitle
            icon={<CheckCircleIcon />}
            title="Attendance Management"
            subtitle="Subject-wise breakdown and eligibility status"
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="outlined" sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }} onClick={() => navigate('/attendances')}>Apply Leave</Button>
                <Button size="small" variant="outlined" sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>Apply Correction</Button>
              </Box>
            }
          />
          <Grid container spacing={2}>
            {(data.attendanceBreakdown || MOCK_ATTENDANCE).map((att: any) => {
              const warn = att.pct < 75;
              const caution = att.pct < 85 && att.pct >= 75;
              const barColor = warn ? '#ef4444' : caution ? '#f59e0b' : '#22c55e';
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={att.subject}>
                  <Box sx={{ p: 2, borderRadius: 2.5, border: `1.5px solid ${warn ? '#fca5a5' : caution ? '#fcd34d' : '#86efac'}`, bgcolor: warn ? '#fef2f2' : caution ? '#fffbeb' : '#f0fdf4' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{att.subject}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {warn && <WarningIcon sx={{ fontSize: 14, color: '#ef4444' }} />}
                        <Typography variant="body2" sx={{ fontWeight: 800, color: barColor }}>{att.pct}%</Typography>
                      </Box>
                    </Box>
                    <LinearProgress variant="determinate" value={att.pct} sx={{ height: 6, borderRadius: 3, bgcolor: `${barColor}25`, '& .MuiLinearProgress-bar': { bgcolor: barColor } }} />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {att.attended}/{att.total} classes attended
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* ═══ 7. FEES  +  LEARNING RESOURCES ═══ */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <SectionTitle icon={<AccountBalanceIcon />} title="Fees & Payments" subtitle="Track dues and payment history" />
              {(() => {
                const feesObj = data.fees || MOCK_FEES;
                return (
                  <>
                    {feesObj.outstanding > 0 && (
                      <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                        <strong>₹{feesObj.outstanding.toLocaleString()}</strong> outstanding · Due: {feesObj.dueDate}
                      </Alert>
                    )}
                    <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5 }}>
                      <Box sx={{ flex: 1, p: 1.5, bgcolor: '#f0fdf4', border: '1px solid #86efac', borderRadius: 2.5, textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }} color="#22c55e">₹{feesObj.paid.toLocaleString()}</Typography>
                        <Typography variant="caption" color="text.secondary">Paid</Typography>
                      </Box>
                      <Box sx={{ flex: 1, p: 1.5, bgcolor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 2.5, textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }} color="#ef4444">₹{feesObj.outstanding.toLocaleString()}</Typography>
                        <Typography variant="caption" color="text.secondary">Outstanding</Typography>
                      </Box>
                    </Box>
                    <List disablePadding dense>
                      {(feesObj.history || []).map((h: any, i: number) => (
                        <React.Fragment key={i}>
                          <ListItem sx={{ px: 0, py: 1 }}>
                            <ListItemIcon sx={{ minWidth: 28 }}>
                              <DotIcon sx={{ fontSize: 8, color: h.status === 'paid' ? '#22c55e' : '#f59e0b' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{h.desc}</Typography>}
                              secondary={h.date}
                            />
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{h.amount.toLocaleString()}</Typography>
                              <Chip label={h.status} size="small" color={h.status === 'paid' ? 'success' : 'warning'} sx={{ height: 16, fontSize: '0.6rem' }} />
                            </Box>
                          </ListItem>
                          {feesObj.history && i < feesObj.history.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </>
                );
              })()}
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button variant="contained" disableElevation fullWidth sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }} onClick={() => navigate('/fees')}>Pay Now</Button>
                <Button variant="outlined" fullWidth sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }} startIcon={<DownloadIcon />}>Receipt</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <SectionTitle
                icon={<MenuBookIcon />}
                title="Learning Resources"
                subtitle="Notes, recordings and study materials"
                action={<Button size="small" endIcon={<ArrowIcon />} sx={{ textTransform: 'none', fontWeight: 600 }}>View All</Button>}
              />
              <Grid container spacing={2}>
                {(data.resources || MOCK_RESOURCES).map((r: any) => {
                  const isVideo = r.type === 'Video';
                  return (
                    <Grid size={{ xs: 12, sm: 6 }} key={r.id}>
                      <Box
                        sx={{
                          p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider',
                          display: 'flex', gap: 1.5, alignItems: 'flex-start',
                          transition: 'box-shadow 0.15s, transform 0.15s',
                          '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' },
                        }}
                      >
                        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: isVideo ? '#fef2f2' : '#f0f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: isVideo ? '#ef4444' : '#6366f1' }}>
                          {isVideo ? <PlayIcon /> : <MenuBookIcon />}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{r.title}</Typography>
                          <Typography variant="caption" color="text.secondary">{r.subject} · {r.type} · {r.size}</Typography>
                          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                            <Button size="small" variant="outlined" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.7rem', py: 0.25, borderRadius: 1.5 }} startIcon={<DownloadIcon sx={{ fontSize: 12 }} />}>Download</Button>
                            {isVideo && (
                              <Button size="small" variant="outlined" color="error" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.7rem', py: 0.25, borderRadius: 1.5 }} startIcon={<PlayIcon sx={{ fontSize: 12 }} />}>Play</Button>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ═══ 8. ANNOUNCEMENTS  +  ACHIEVEMENTS ═══ */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent>
              <SectionTitle icon={<NotificationsIcon />} title="Announcements & Notices" subtitle="School-wide alerts and department notices" />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {(data.announcements || MOCK_ANNOUNCEMENTS).map((a: any) => {
                  const typeColor = a.type === 'exam' ? '#ef4444' : a.type === 'event' ? '#8b5cf6' : '#0d9488';
                  const typeBg = a.type === 'exam' ? '#fef2f2' : a.type === 'event' ? '#faf5ff' : '#f0fdfa';
                  return (
                    <Box
                      key={a.id}
                      sx={{ p: 2, borderRadius: 2.5, border: `1px solid ${a.urgent ? '#fca5a5' : 'divider'}`, bgcolor: a.urgent ? '#fff5f5' : 'background.paper', display: 'flex', alignItems: 'center', gap: 2 }}
                    >
                      <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: typeBg, color: typeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {a.type === 'exam' ? <EventIcon fontSize="small" /> : a.type === 'event' ? <StarIcon fontSize="small" /> : <NotificationsIcon fontSize="small" />}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{a.title}</Typography>
                          {a.urgent && <Chip label="URGENT" size="small" color="error" sx={{ height: 16, fontSize: '0.6rem' }} />}
                        </Box>
                        <Typography variant="caption" color="text.secondary">{a.time}</Typography>
                      </Box>
                      <Chip label={a.type.toUpperCase()} size="small" sx={{ bgcolor: typeBg, color: typeColor, fontWeight: 700, fontSize: '0.6rem', border: `1px solid ${typeColor}40` }} />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <SectionTitle icon={<TrophyIcon />} title="Achievements & Rewards" subtitle="Badges, certifications and awards" />
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {(data.achievements || MOCK_ACHIEVEMENTS).map((ach: any) => (
                  <Grid size={{ xs: 6 }} key={ach.id}>
                    <Box sx={{ p: 2, borderRadius: 2.5, textAlign: 'center', border: '1px solid', borderColor: 'divider', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.03)' } }}>
                      <Typography sx={{ fontSize: 32 }}>{ach.icon}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>{ach.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{ach.subtitle}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ p: 2, borderRadius: 2.5, background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GradeIcon />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Class Rank: #3</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>Top 10% of class · XII-A · 2024-25</Typography>
                </Box>
                <TrophyIcon sx={{ ml: 'auto', color: '#fbbf24' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ═══ 9. HEALTH  +  CAREER  +  COMMUNICATION ═══ */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <SectionTitle icon={<HealthIcon />} title="Health & Wellness" subtitle="Records, counseling & wellness" />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { label: 'Medical Records', desc: 'Last updated: May 2025', icon: '🏥' },
                  { label: 'Counseling Appointment', desc: 'Next: Jun 15, 11:00 AM', icon: '💬' },
                  { label: 'Wellness Resources', desc: '12 articles available', icon: '🌿' },
                ].map((h) => (
                  <Box key={h.label} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                    <Typography sx={{ fontSize: 24 }}>{h.icon}</Typography>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{h.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{h.desc}</Typography>
                    </Box>
                    <ArrowIcon sx={{ ml: 'auto', fontSize: 16, color: 'text.disabled' }} />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <SectionTitle icon={<WorkIcon />} title="Career & Placement" subtitle="Internships, guidance and resume" />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { label: 'Career Counseling', desc: '3 sessions available', icon: '🎯', badge: 'NEW' },
                  { label: 'Internship Board', desc: '14 active listings', icon: '💼', badge: '14' },
                  { label: 'Resume Builder', desc: 'AI-powered templates', icon: '📄', badge: null },
                  { label: 'Career Events', desc: 'Campus drive: Jun 28', icon: '🏛️', badge: '1' },
                ].map((c) => (
                  <Box key={c.label} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                    <Typography sx={{ fontSize: 22 }}>{c.icon}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{c.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{c.desc}</Typography>
                    </Box>
                    {c.badge && <Chip label={c.badge} size="small" color={c.badge === 'NEW' ? 'success' : 'primary'} sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700 }} />}
                    <ArrowIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <SectionTitle icon={<ChatIcon />} title="Communication" subtitle="Message teachers and classmates" />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { name: 'Dr. A. Kumar', role: 'Physics Teacher', msg: 'Submit your lab report by tomorrow.', time: '10 min', unread: 2, color: '#6366f1' },
                  { name: 'Prof. R. Gupta', role: 'Math Teacher', msg: 'Great work on the test!', time: '2 hrs', unread: 0, color: '#0d9488' },
                  { name: 'Class Group XII-A', role: 'Group Chat', msg: 'Study session tonight at 8 PM?', time: 'Yesterday', unread: 5, color: '#f59e0b' },
                ].map((m) => (
                  <Box
                    key={m.name}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    onClick={() => navigate('/notifications')}
                  >
                    <Avatar sx={{ width: 38, height: 38, bgcolor: `${m.color}20`, color: m.color, fontWeight: 700, fontSize: '0.85rem' }}>
                      {m.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{m.name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>{m.time}</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{m.msg}</Typography>
                    </Box>
                    {m.unread > 0 && (
                      <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.6rem' }}>{m.unread}</Typography>
                      </Box>
                    )}
                  </Box>
                ))}
                <Button variant="outlined" fullWidth sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, mt: 0.5 }} startIcon={<ChatIcon />} onClick={() => navigate('/notifications')}>
                  Open Messages
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;
