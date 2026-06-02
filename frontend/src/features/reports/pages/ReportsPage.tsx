import { FC, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import SchoolIcon from '@mui/icons-material/School';
import { useAuth } from '../../../contexts/AuthContext';
import { reportsApi } from '../reportsApi';

export const ReportsPage: FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const roleName = typeof user?.role === 'string' ? user.role : (user?.role as any)?.name || '';
  const role = roleName as string;

  const handleExport = async (type: string, format: 'pdf' | 'excel') => {
    setLoading(`${type}-${format}`);
    setError(null);
    try {
      await reportsApi.exportReport(type, format);
    } catch (err: any) {
      console.error('Export failed:', err);
      setError(`Failed to export ${type} report. Please try again.`);
    } finally {
      setLoading(null);
    }
  };

  const reports = [
    {
      id: 'student',
      title: 'Student Report',
      description: 'List of all students with their class, roll number, and status.',
      icon: <PeopleIcon fontSize="large" color="primary" />,
    },
    {
      id: 'teacher',
      title: 'Teacher Report',
      description: 'Directory of teachers with department and contact information.',
      icon: <SchoolIcon fontSize="large" color="secondary" />,
    },
    {
      id: 'attendance',
      title: 'Attendance Report',
      description: 'Daily attendance records for students and classes.',
      icon: <AssessmentIcon fontSize="large" color="warning" />,
    },
    {
      id: 'exam',
      title: 'Exam & Performance Report',
      description: 'Student marks, grades, and exam performance analysis.',
      icon: <AssessmentIcon fontSize="large" color="info" />,
    },
    {
      id: 'fee',
      title: 'Fees & Collection Report',
      description: 'Detailed view of fee collections, pending amounts, and balances.',
      icon: <AttachMoneyIcon fontSize="large" color="success" />,
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Reports & Exports
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Generate and download detailed reports in PDF or Excel format.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {reports.map((report) => (
          <Grid item xs={12} sm={6} md={4} key={report.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                  {report.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {report.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  {report.description}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={loading === `${report.id}-pdf` ? <CircularProgress size={20} /> : <PictureAsPdfIcon />}
                    onClick={() => handleExport(report.id, 'pdf')}
                    disabled={!!loading}
                  >
                    PDF
                  </Button>
                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={loading === `${report.id}-excel` ? <CircularProgress size={20} /> : <TableChartIcon />}
                    onClick={() => handleExport(report.id, 'excel')}
                    disabled={!!loading}
                  >
                    Excel
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
