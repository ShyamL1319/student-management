import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../auth/authSlice';
import { createStudent, deleteStudent, listStudents, updateStudent } from './studentsService';
import { PaginatedStudents, Student, StudentFormValues, StudentStatus } from './types';
import { StudentFormDialog } from './StudentFormDialog';

export function StudentsPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [students, setStudents] = useState<PaginatedStudents>({ items: [], total: 0, page: 1, limit: 10 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StudentStatus | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setStudents(await listStudents({ page: 1, limit: 10, search, status }));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load students');
    } finally {
      setIsLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  const handleSubmit = async (values: StudentFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingStudent) {
        await updateStudent(editingStudent._id, values);
        setSuccess('Student updated successfully');
      } else {
        await createStudent(values);
        setSuccess('Student created successfully');
      }
      setDialogOpen(false);
      setEditingStudent(null);
      await loadStudents();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (student: Student) => {
    try {
      await deleteStudent(student._id);
      setSuccess('Student deleted successfully');
      await loadStudents();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete student');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Paper square elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ px: 3, py: 2 }}>
          <Box>
            <Typography variant="h5" component="h1">Students</Typography>
            <Typography variant="body2" color="text.secondary">{user?.name ?? 'User'} · {user?.role ?? 'staff'}</Typography>
          </Box>
          <Button startIcon={<LogoutIcon />} onClick={() => dispatch(logout())}>Sign out</Button>
        </Stack>
      </Paper>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Search" value={search} onChange={(event) => setSearch(event.target.value)} size="small" />
            <TextField label="Status" select value={status} onChange={(event) => setStatus(event.target.value as StudentStatus | '')} size="small" sx={{ minWidth: 150 }}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="graduated">Graduated</MenuItem>
            </TextField>
          </Stack>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingStudent(null); setDialogOpen(true); }}>
            Add student
          </Button>
        </Stack>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Paper elevation={0} sx={{ overflowX: 'auto', border: 1, borderColor: 'divider' }}>
          {isLoading ? (
            <Stack alignItems="center" sx={{ py: 8 }}><CircularProgress /></Stack>
          ) : students.items.length === 0 ? (
            <Stack alignItems="center" spacing={1} sx={{ py: 8 }}>
              <Typography variant="h6">No students found</Typography>
              <Typography color="text.secondary">Create the first student record to get started.</Typography>
            </Stack>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Guardian</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.items.map((student) => (
                  <TableRow key={student._id} hover>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.grade}-{student.section}</TableCell>
                    <TableCell>{student.guardian.name}</TableCell>
                    <TableCell><Chip label={student.status} size="small" /></TableCell>
                    <TableCell align="right">
                      <IconButton aria-label="Edit student" onClick={() => { setEditingStudent(student); setDialogOpen(true); }}><EditIcon /></IconButton>
                      <IconButton aria-label="Delete student" onClick={() => void handleDelete(student)} disabled={user?.role !== 'admin'}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Stack>

      <StudentFormDialog open={dialogOpen} student={editingStudent} isSubmitting={isSubmitting} onClose={() => setDialogOpen(false)} onSubmit={handleSubmit} />
      <Snackbar open={Boolean(success)} autoHideDuration={3000} onClose={() => setSuccess(null)}>
        <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>
      </Snackbar>
    </Box>
  );
}
