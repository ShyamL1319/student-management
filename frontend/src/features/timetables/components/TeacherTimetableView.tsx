import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
} from '@mui/material';
import { timetableAPI } from '../../../api/timetables/timetableAPI';

interface TeacherTimetableViewProps {
  teacherId?: string;
}

const TeacherTimetableView: React.FC<TeacherTimetableViewProps> = ({ teacherId: initialTeacherId }) => {
  const [timetables, setTimetables] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState(initialTeacherId || '');
  const [academicYearId, setAcademicYearId] = useState('');

  const fetchTeacherTimetable = async () => {
    if (!teacherId) {
      setError('Please enter a teacher ID');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (academicYearId) params.academicYear = academicYearId;

      const response = await timetableAPI.getTeacherTimetable(teacherId, params);
      setTimetables(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (initialTeacherId) {
      setTeacherId(initialTeacherId);
      setTimetables([]);
    }
  }, [initialTeacherId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Teacher Timetable
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Teacher ID"
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          fullWidth
        />
        <TextField
          label="Academic Year ID (Optional)"
          value={academicYearId}
          onChange={(e) => setAcademicYearId(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={fetchTeacherTimetable}>
          Search
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {timetables.length > 0 ? (
        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell>Day</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Room</TableCell>
                    <TableCell>Section</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timetables.map((timetable) => (
                    <TableRow key={timetable._id}>
                      <TableCell>{timetable.dayOfWeek}</TableCell>
                      <TableCell>
                        {timetable.startTime} - {timetable.endTime}
                      </TableCell>
                      <TableCell>{timetable.class?.name || '-'}</TableCell>
                      <TableCell>{timetable.subject?.name || '-'}</TableCell>
                      <TableCell>{timetable.room || '-'}</TableCell>
                      <TableCell>{timetable.section?.name || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ) : (
        timetables.length === 0 && !loading && teacherId && (
          <Alert severity="info">No timetable entries found for this teacher</Alert>
        )
      )}
    </Box>
  );
};

export default TeacherTimetableView;
