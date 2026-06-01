import type { FC } from 'react';
import { Box, Typography, Card, CardContent, CardActionArea, Grid } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useAuth } from '../../../contexts/AuthContext';

export const ReportsPage: FC = () => {
  const { user } = useAuth();
  const roleName = typeof user?.role === 'string' ? user.role : (user?.role as any)?.name || '';
  const role = roleName as string;

  const reports = [
    {
      title: 'Attendance Report',
      description: 'View detailed attendance statistics.',
      icon: <AssessmentIcon fontSize="large" color="primary" />,
    },
    {
      title: 'Fees Report',
      description: 'View collections and pending fees.',
      icon: <AttachMoneyIcon fontSize="large" color="success" />,
    },
    {
      title: 'Student Performance',
      description: 'View student marks and exam results.',
      icon: <PeopleIcon fontSize="large" color="secondary" />,
    },
  ];

  if (role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN') {
    reports.push({
      title: 'School Overview Report',
      description: 'View overall school performance metrics.',
      icon: <AssessmentIcon fontSize="large" color="warning" />,
    });
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>

      <Grid container spacing={3}>
        {reports.map((report, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardActionArea
                onClick={() => alert('Report generation not implemented in prototype.')}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 4,
                  }}
                >
                  <Box sx={{ mb: 2 }}>{report.icon}</Box>
                  <Typography variant="h6" gutterBottom>
                    {report.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {report.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
