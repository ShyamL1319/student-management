import type { FC } from 'react';
import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CircularProgress,
  LinearProgress,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Class as ClassIcon,
  Event as EventIcon,
  AccountBalance as AccountBalanceIcon,
  CheckCircleOutlined as CheckCircleIcon,
  AssignmentTurnedIn as AssignmentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchDashboardData } from '../api/dashboardApi';
import type { DashboardResponse } from '../api/dashboardApi';

import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';
import ParentDashboard from './ParentDashboard';


export const DashboardPage: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Interactive mock state for Staff Checklists
  const [todoList, setTodoList] = useState([
    { id: 1, text: 'File student admissions catalog', checked: true },
    { id: 2, text: 'Verify teacher leave request logs', checked: false },
    { id: 3, text: 'Audit monthly fee collections report', checked: false },
    { id: 4, text: 'Update library textbook reserves', checked: false },
  ]);

  const toggleTodo = (id: number) => {
    setTodoList(prev =>
      prev.map(todo => (todo.id === id ? { ...todo, checked: !todo.checked } : todo))
    );
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const dashboardData = await fetchDashboardData();
        setData(dashboardData);
      } catch {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6">{error || 'Failed to load dashboard data'}</Typography>
      </Box>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userTyped = user as any;

  // Resolve highest priority role from roles list
  const priority = ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'USER'];
  let role = 'USER';

  const roles = userTyped?.roles || [];
  const roleNames = roles.map((r: any) => typeof r === 'string' ? r : r?.name).filter(Boolean);

  // Fallback to legacy single role
  const singleRole = typeof userTyped?.role === 'string' ? userTyped.role : userTyped?.role?.name || '';
  if (singleRole && !roleNames.includes(singleRole)) {
    roleNames.push(singleRole);
  }

  const roleNamesUpper = roleNames.map((r: string) => r.toUpperCase());

  for (const p of priority) {
    if (roleNamesUpper.includes(p)) {
      role = p;
      break;
    }
  }
  const { widgets } = data;

  const firstName = typeof userTyped?.firstName === 'string' ? userTyped.firstName : 'User';

  // Generate dynamic stat cards based on role availability
  const statWidgets = [];

  if (widgets.totalUsers !== undefined) {
    statWidgets.push({
      title: 'Total Users',
      value: widgets.totalUsers,
      desc: 'Active user database profiles',
      icon: <PeopleIcon sx={{ color: '#6366f1' }} />,
      link: '/users',
    });
  }
  if (widgets.totalStudents !== undefined) {
    statWidgets.push({
      title: 'Total Students',
      value: widgets.totalStudents,
      desc: 'Registered student roster',
      icon: <PeopleIcon sx={{ color: '#0d9488' }} />,
      link: '/students',
    });
  }
  if (widgets.totalTeachers !== undefined) {
    statWidgets.push({
      title: 'Total Teachers',
      value: widgets.totalTeachers,
      desc: 'Assigned academic educators',
      icon: <SchoolIcon sx={{ color: '#10b981' }} />,
      link: '/teachers',
    });
  }
  if (widgets.totalClasses !== undefined) {
    statWidgets.push({
      title: 'Active Classes',
      value: widgets.totalClasses,
      desc: 'Academic classrooms listed',
      icon: <ClassIcon sx={{ color: '#f59e0b' }} />,
      link: '/classes',
    });
  }
  if (widgets.myClasses !== undefined) {
    statWidgets.push({
      title: 'My Classes',
      value: widgets.myClasses,
      desc: 'Teaching schedules today',
      icon: <ClassIcon sx={{ color: '#6366f1' }} />,
      link: '/timetables',
    });
  }
  if (widgets.upcomingExams !== undefined) {
    statWidgets.push({
      title: 'Upcoming Exams',
      value: widgets.upcomingExams,
      desc: 'Scheduled examinations in system',
      icon: <EventIcon sx={{ color: '#ef4444' }} />,
      link: '/exams',
    });
  }
  if (widgets.attendancePercentage !== undefined) {
    statWidgets.push({
      title: 'Attendance Rate',
      value: `${widgets.attendancePercentage}%`,
      desc: 'Average school attendance status',
      icon: <CheckCircleIcon sx={{ color: '#10b981' }} />,
      link: '/attendances',
    });
  }
  if (widgets.totalMarksRecords !== undefined) {
    statWidgets.push({
      title: 'Marks Recorded',
      value: widgets.totalMarksRecords,
      desc: 'Graded report card entries',
      icon: <AssignmentIcon sx={{ color: '#3b82f6' }} />,
      link: '/marks',
    });
  }
  if (widgets.totalRevenue !== undefined) {
    statWidgets.push({
      title: 'Fee Revenue',
      value: `$${widgets.totalRevenue.toLocaleString()}`,
      desc: 'Total collected tuition revenues',
      icon: <AccountBalanceIcon sx={{ color: '#10b981' }} />,
      link: '/fee-collections',
    });
  }
  if (widgets.pendingFees !== undefined) {
    statWidgets.push({
      title: 'Pending Invoices',
      value: `$${widgets.pendingFees.toLocaleString()}`,
      desc: 'Outstanding tuition payments due',
      icon: <AccountBalanceIcon sx={{ color: '#ef4444' }} />,
      link: '/pending-fees',
    });
  }
  if (widgets.childrenCount !== undefined) {
    statWidgets.push({
      title: 'Enrolled Children',
      value: widgets.childrenCount,
      desc: 'Academic family dependents',
      icon: <PeopleIcon sx={{ color: '#6366f1' }} />,
      link: '#',
    });
  }



  return (
    <Box>
      {/* 1. Welcoming Hero Banner */}
      <Card
        sx={{
          mb: 4,
          background: (theme) =>
            theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, #312e81 0%, #4f46e5 100%)'
              : 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          color: 'white',
          borderRadius: '16px',
          boxShadow: 'none',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '30%',
            height: '100%',
            borderRadius: '50%',
            background: 'rgba(20, 184, 166, 0.15)',
            filter: 'blur(50px)',
          },
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 }, position: 'relative', zIndex: 2 }}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  letterSpacing: '-0.5px',
                  mb: 1,
                }}
              >
                Welcome back, {firstName}!
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.85, fontFamily: "'Inter', sans-serif" }}>
                Here is the current operational status for PS Educational Institute.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Box
                sx={{
                  display: 'inline-block',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(8px)',
                  px: 2,
                  py: 1,
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>
                  Role: {role}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 2. Top-level Statistic Badges */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statWidgets.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'light'
                      ? '0 10px 15px -3px rgba(0,0,0,0.05)'
                      : 'none',
                },
              }}
            >
              <CardActionArea
                onClick={() => stat.link !== '#' && navigate(stat.link)}
                sx={{ height: '100%', p: 1 }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ pr: 1 }}>
                    <Typography color="text.secondary" variant="overline" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stat.desc}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'light' ? 'rgba(79, 70, 229, 0.05)' : 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 3. Role-Based Central Workspaces */}
      <Grid container spacing={4}>
        {/* --- ROLE: SUPER_ADMIN --- */}
        {role === 'SUPER_ADMIN' && (
          <Grid size={{ xs: 12 }}>
            <SuperAdminDashboard data={data} firstName={firstName} />
          </Grid>
        )}

        {/* --- ROLE: ADMIN --- */}
        {role === 'ADMIN' && (
          <Grid size={{ xs: 12 }}>
            <AdminDashboard data={data} firstName={firstName} />
          </Grid>
        )}

        {/* --- ROLE: TEACHER --- */}
        {role === 'TEACHER' && (
          <Grid size={{ xs: 12 }}>
            <TeacherDashboard data={data} firstName={firstName} />
          </Grid>
        )}

        {/* --- ROLE: STUDENT --- */}
        {role === 'STUDENT' && (
          <Grid size={{ xs: 12 }}>
            <StudentDashboard data={data} firstName={firstName} />
          </Grid>
        )}

        {/* --- ROLE: PARENT --- */}
        {role === 'PARENT' && (
          <Grid size={{ xs: 12 }}>
            <ParentDashboard />
          </Grid>
        )}

        {/* --- ROLE: USER (OAuth Registered) --- */}
        {role === 'USER' && (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ p: 2, borderRadius: '16px' }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, mb: 2 }}>
                  Your Account Status
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', fontFamily: "'Inter', sans-serif" }}>
                  Welcome to PS Educational Institute! Your account has been successfully registered and linked via your OAuth provider.
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Card variant="outlined" sx={{ p: 2, borderRadius: '12px', height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, fontFamily: "'Outfit', sans-serif" }}>
                        ℹ️ Pending Admission
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        To access class schedules, report cards, or fee portals, your account must be assigned to an active student, teacher, or parent profile by the administration.
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Card variant="outlined" sx={{ p: 2, borderRadius: '12px', height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, fontFamily: "'Outfit', sans-serif" }}>
                        🏫 School Details
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Name:</strong> PS Educational Institute<br />
                        <strong>Address:</strong> Sikar, Rajasthan, India<br />
                        <strong>Email:</strong> admin@school.com
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Card variant="outlined" sx={{ p: 2, borderRadius: '12px', height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, fontFamily: "'Outfit', sans-serif" }}>
                        📞 Contact Support
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        If you believe this is an error or need your role updated, please reach out to the administrative office at support@school.com.
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* --- ROLE: STAFF & OTHERS --- */}
        {role !== 'SUPER_ADMIN' && role !== 'ADMIN' && role !== 'TEACHER' && role !== 'STUDENT' && role !== 'PARENT' && role !== 'USER' && (
          <>
            {/* Left Workspace: Interactive checklist */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, mb: 2 }}>
                    Task Operations Checklist
                  </Typography>
                  <List disablePadding>
                    {todoList.map((todo) => (
                      <ListItem key={todo.id} disablePadding sx={{ py: 1 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={todo.checked}
                              onChange={() => toggleTodo(todo.id)}
                              color="primary"
                            />
                          }
                          label={
                            <Typography
                              variant="body2"
                              sx={{
                                textDecoration: todo.checked ? 'line-through' : 'none',
                                color: todo.checked ? 'text.secondary' : 'text.primary',
                                fontWeight: todo.checked ? 400 : 500,
                              }}
                            >
                              {todo.text}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Workspace: Leave logs */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, mb: 3 }}>
                    My Leaves Account
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>Paid Sick Leave</Typography>
                      <Typography variant="body2" color="text.secondary">8 / 12 Days Used</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={(8 / 12) * 100} sx={{ height: 6, borderRadius: 3 }} />
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>Vacations Earned</Typography>
                      <Typography variant="body2" color="text.secondary">14 / 20 Days Used</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={(14 / 20) * 100} color="success" sx={{ height: 6, borderRadius: 3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};
