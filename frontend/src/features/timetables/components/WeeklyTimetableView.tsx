import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
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

interface WeeklyTimetableProps {
  classId?: string;
}

const WeeklyTimetableView: React.FC<WeeklyTimetableProps> = ({ classId }) => {
  const [timetable, setTimetable] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState(classId || '');
  const [academicYearId, setAcademicYearId] = useState('');

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  useEffect(() => {
    if (selectedClassId) {
      fetchWeeklyTimetable();
    }
  }, [selectedClassId, academicYearId]);

  const fetchWeeklyTimetable = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (academicYearId) params.academicYear = academicYearId;

      const response = await timetableAPI.getWeeklyTimetable(selectedClassId, params);
      setTimetable(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedClassId) {
    return (
      <Box sx={{ padding: 2 }}>
        <TextField
          fullWidth
          label="Select Class"
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          placeholder="Enter class ID"
        />
      </Box>
    );
  }

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
        Weekly Timetable
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Class ID"
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          fullWidth
        />
        <TextField
          label="Academic Year ID (Optional)"
          value={academicYearId}
          onChange={(e) => setAcademicYearId(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={fetchWeeklyTimetable}>
          Refresh
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {timetable && (
        <Box>
          {days.map((day) => (
            <Card key={day} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  {day}
                </Typography>

                {timetable[day] && timetable[day].length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                          <TableCell>Time</TableCell>
                          <TableCell>Teacher</TableCell>
                          <TableCell>Subject</TableCell>
                          <TableCell>Room</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {timetable[day].map((slot: any) => (
                          <TableRow key={slot._id}>
                            <TableCell>
                              {slot.startTime} - {slot.endTime}
                            </TableCell>
                            <TableCell>
                              {slot.teacher?.firstName} {slot.teacher?.lastName}
                            </TableCell>
                            <TableCell>{slot.subject?.name}</TableCell>
                            <TableCell>{slot.room || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No classes scheduled
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default WeeklyTimetableView;
