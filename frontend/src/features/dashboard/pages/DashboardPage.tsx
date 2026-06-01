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
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import EventIcon from '@mui/icons-material/Event';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchDashboardData } from '../api/dashboardApi';
import type { DashboardResponse } from '../api/dashboardApi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const DashboardPage: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return <Typography color="error">{error}</Typography>;
  }

  const roleName = typeof user?.role === 'string' ? user.role : (user?.role as any)?.name || '';
  const role = roleName as string;
  const { widgets, recentActivity } = data;

  // Generate widgets based on available data
  const statWidgets = [];

  if (widgets.totalSchools !== undefined) {
    statWidgets.push({
      title: 'Total Schools',
      value: widgets.totalSchools,
      icon: <SchoolIcon fontSize="large" color="primary" />,
      link: '/schools',
    });
  }
  if (widgets.totalUsers !== undefined) {
    statWidgets.push({
      title: 'Total Users',
      value: widgets.totalUsers,
      icon: <PeopleIcon fontSize="large" color="secondary" />,
      link: '/users',
    });
  }
  if (widgets.totalStudents !== undefined) {
    statWidgets.push({
      title: 'Total Students',
      value: widgets.totalStudents,
      icon: <PeopleIcon fontSize="large" color="info" />,
      link: '/students',
    });
  }
  if (widgets.totalTeachers !== undefined) {
    statWidgets.push({
      title: 'Total Teachers',
      value: widgets.totalTeachers,
      icon: <SchoolIcon fontSize="large" color="success" />,
      link: '/teachers',
    });
  }
  if (widgets.totalClasses !== undefined) {
    statWidgets.push({
      title: 'Active Classes',
      value: widgets.totalClasses,
      icon: <ClassIcon fontSize="large" color="warning" />,
      link: '/classes',
    });
  }
  if (widgets.myClasses !== undefined) {
    statWidgets.push({
      title: 'My Classes',
      value: widgets.myClasses,
      icon: <ClassIcon fontSize="large" color="primary" />,
      link: '/classes',
    });
  }
  if (widgets.upcomingExams !== undefined) {
    statWidgets.push({
      title: 'Upcoming Exams',
      value: widgets.upcomingExams,
      icon: <EventIcon fontSize="large" color="error" />,
      link: '/examinations',
    });
  }
  if (widgets.attendancePercentage !== undefined) {
    statWidgets.push({
      title: 'Attendance Rate',
      value: `${widgets.attendancePercentage}%`,
      icon: <EventIcon fontSize="large" color="success" />,
      link: '/attendances',
    });
  }
  if (widgets.totalMarksRecords !== undefined) {
    statWidgets.push({
      title: 'Marks Records',
      value: widgets.totalMarksRecords,
      icon: <EventIcon fontSize="large" color="primary" />,
      link: '/marks',
    });
  }
  if (widgets.globalRevenue !== undefined) {
    statWidgets.push({
      title: 'Global Revenue',
      value: `$${widgets.globalRevenue}`,
      icon: <AccountBalanceIcon fontSize="large" color="success" />,
      link: '#',
    });
  }
  if (widgets.totalRevenue !== undefined) {
    statWidgets.push({
      title: 'Total Revenue',
      value: `$${widgets.totalRevenue}`,
      icon: <AccountBalanceIcon fontSize="large" color="success" />,
      link: '/fees/collections',
    });
  }
  if (widgets.pendingFees !== undefined) {
    statWidgets.push({
      title: 'Pending Fees',
      value: `$${widgets.pendingFees}`,
      icon: <AccountBalanceIcon fontSize="large" color="error" />,
      link: '/fees/pending',
    });
  }
  if (widgets.childrenCount !== undefined) {
    statWidgets.push({
      title: 'Children',
      value: widgets.childrenCount,
      icon: <PeopleIcon fontSize="large" color="primary" />,
      link: '#',
    });
  }

  // Mock data for Recharts just to show it visually if actual charts data not fully available
  const mockChartData = [
    { name: 'Jan', revenue: 4000, expected: 5000 },
    { name: 'Feb', revenue: 3000, expected: 5000 },
    { name: 'Mar', revenue: 5000, expected: 5000 },
    { name: 'Apr', revenue: 4500, expected: 5000 },
    { name: 'May', revenue: 6000, expected: 5000 },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard{' '}
        <Typography variant="caption" color="textSecondary">
          ({role})
        </Typography>
      </Typography>

      <Grid container spacing={3}>
        {statWidgets.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card>
              <CardActionArea onClick={() => stat.link !== '#' && navigate(stat.link)}>
                <CardContent
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4">{stat.value}</Typography>
                  </Box>
                  <Box>{stat.icon}</Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {(role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN') && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Revenue Overview
          </Typography>
          <Card>
            <CardContent sx={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Actual Revenue" />
                  <Bar dataKey="expected" fill="#82ca9d" name="Expected Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Recent Activity
        </Typography>
        <Card>
          <CardContent>
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((activity, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Typography variant="body1">{activity.description}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {activity.time}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body1" color="textSecondary">
                No recent activity.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
