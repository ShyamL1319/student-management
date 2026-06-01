import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
} from '@mui/material';
import { timetableAPI, type ConflictResponse } from '../../../api/timetables/timetableAPI';

const ConflictDetector: React.FC = () => {
  const [result, setResult] = useState<ConflictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    teacher: '',
    class: '',
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '10:00',
  });

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  const handleCheckConflict = async () => {
    if (!formData.teacher || !formData.class) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await timetableAPI.checkConflict(formData);
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to check conflicts');
    } finally {
      setLoading(false);
    }
  };

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
        Conflict Detection
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TextField
              label="Teacher ID"
              value={formData.teacher}
              onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Class ID"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
              fullWidth
              required
            />
            <TextField
              select
              label="Day of Week"
              value={formData.dayOfWeek}
              onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
              fullWidth
            >
              {days.map((day) => (
                <MenuItem key={day} value={day}>
                  {day}
                </MenuItem>
              ))}
            </TextField>
            <Box></Box>
            <TextField
              label="Start Time (HH:mm)"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Time (HH:mm)"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Button variant="contained" color="primary" onClick={handleCheckConflict}>
            Check Conflicts
          </Button>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {result && (
        <Card>
          <CardContent>
            <Box sx={{ mb: 2 }}>
              {result.hasConflict ? (
                <Chip
                  label="⚠️ Conflicts Detected"
                  color="error"
                  variant="outlined"
                  sx={{ fontWeight: 'bold' }}
                />
              ) : (
                <Chip
                  label="✓ No Conflicts"
                  color="success"
                  variant="outlined"
                  sx={{ fontWeight: 'bold' }}
                />
              )}
            </Box>

            {result.hasConflict && result.conflicts.length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Conflicting Entries:
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#ffe0e0' }}>
                      <TableRow>
                        <TableCell>Conflict Type</TableCell>
                        <TableCell>Class</TableCell>
                        <TableCell>Teacher</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Day</TableCell>
                        <TableCell>Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.conflicts.map((conflict, index) => (
                        <TableRow key={index} sx={{ backgroundColor: '#fff5f5' }}>
                          <TableCell>
                            <Chip
                              label={conflict.conflictType}
                              color={
                                conflict.conflictType === 'TEACHER_DOUBLE_BOOKING'
                                  ? 'error'
                                  : 'warning'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{conflict.class}</TableCell>
                          <TableCell>{conflict.teacher}</TableCell>
                          <TableCell>{conflict.subject}</TableCell>
                          <TableCell>{conflict.dayOfWeek}</TableCell>
                          <TableCell>
                            {conflict.startTime} - {conflict.endTime}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ConflictDetector;
