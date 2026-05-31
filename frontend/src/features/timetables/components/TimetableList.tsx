/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { timetableAPI, type Timetable } from '../../../api/timetables/timetableAPI';

const TimetableList: React.FC = () => {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Timetable>>({
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '10:00',
  });

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  const fetchTimetables = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await timetableAPI.getAll({ page, limit });
      setTimetables(response.data);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch timetables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) {
        await fetchTimetables();
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [page, limit]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenDialog = (timetable?: Timetable) => {
    if (timetable) {
      setEditingId(timetable._id || null);
      setFormData(timetable);
    } else {
      setEditingId(null);
      setFormData({
        dayOfWeek: 'MONDAY',
        startTime: '09:00',
        endTime: '10:00',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await timetableAPI.update(editingId, formData);
      } else {
        await timetableAPI.create(formData as Timetable);
      }
      fetchTimetables();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save timetable');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this timetable entry?')) {
      try {
        await timetableAPI.delete(id);
        fetchTimetables();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete timetable');
      }
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <h1>Timetable Management</h1>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Add Timetable
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Class</TableCell>
              <TableCell>Teacher</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Day</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {timetables.map((timetable) => (
              <TableRow key={timetable._id}>
                <TableCell>{(timetable as any).class?.name || '-'}</TableCell>
                <TableCell>
                  {(timetable as any).teacher
                    ? `${(timetable as any).teacher.firstName} ${(timetable as any).teacher.lastName}`
                    : '-'}
                </TableCell>
                <TableCell>{(timetable as any).subject?.name || '-'}</TableCell>
                <TableCell>{timetable.dayOfWeek}</TableCell>
                <TableCell>
                  {timetable.startTime} - {timetable.endTime}
                </TableCell>
                <TableCell>{timetable.room || '-'}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog(timetable)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(timetable._id!)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={Math.ceil(total / limit)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Timetable' : 'Add Timetable'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Class ID"
            value={formData.class || ''}
            onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Teacher ID"
            value={formData.teacher || ''}
            onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Subject ID"
            value={formData.subject || ''}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Academic Year ID"
            value={formData.academicYear || ''}
            onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            select
            label="Day of Week"
            value={formData.dayOfWeek || 'MONDAY'}
            onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
            margin="normal"
            required
          >
            {days.map((day) => (
              <MenuItem key={day} value={day}>
                {day}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Start Time (HH:mm)"
            type="time"
            value={formData.startTime || '09:00'}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            margin="normal"
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            fullWidth
            label="End Time (HH:mm)"
            type="time"
            value={formData.endTime || '10:00'}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            margin="normal"
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            fullWidth
            label="Room"
            value={formData.room || ''}
            onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Notes"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimetableList;
