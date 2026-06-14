import type { FC } from 'react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Pagination,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { teachersApi } from '../api/teachers.api';

export const TeachersPage: FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formValues, setFormValues] = useState({ name: '', email: '', phone: '', subjects: '', profile: '', isActive: true });

  const debouncedSearch = useDebounce(search, 300);
  const filterParams = { page, limit: 10, search: debouncedSearch || undefined };

  const { data, isLoading } = useQuery({ queryKey: ['teachers', filterParams], queryFn: () => teachersApi.getTeachers(filterParams) });


  const createMutation = useMutation({ mutationFn: (data: any) => teachersApi.createTeacher(data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teachers'] }) });
  const updateMutation = useMutation({ mutationFn: (data: any) => teachersApi.updateTeacher(editing._id || editing.id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['teachers'] }); setEditing(null); } });
  const deleteMutation = useMutation({ mutationFn: (id: string) => teachersApi.deleteTeacher(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teachers'] }) });

  const openCreateDialog = () => {
    setEditing(null);
    setFormValues({ name: '', email: '', phone: '', subjects: '', profile: '', isActive: true });
    setDialogOpen(true);
  };

  const openEditDialog = (teacher: any) => {
    setEditing(teacher);
    setFormValues({
      name: teacher.name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      subjects: (teacher.subjects || []).join(', '),
      profile: teacher.profile || '',
      isActive: !!teacher.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      name: formValues.name,
      email: formValues.email,
      phone: formValues.phone,
      subjects: formValues.subjects.split(',').map((subject) => subject.trim()).filter(Boolean),
      profile: formValues.profile,
      isActive: formValues.isActive,
    };

    if (editing) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }

    setDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4">Teachers</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField label="Search" value={search} onChange={(e) => setSearch(e.target.value)} size="small" />
          <Button variant="contained" color="secondary" onClick={openCreateDialog}>Add Teacher</Button>
        </Box>
      </Box>

      <Paper>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="teachers table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Subjects</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center"><CircularProgress size={24} /></TableCell>
                </TableRow>
              ) : data?.data?.length ? (
                data.data.map((teacher: any) => (
                  <TableRow key={teacher._id || teacher.id}>
                    <TableCell>{teacher.firstName + ' ' + teacher.lastName}</TableCell>
                    <TableCell>{teacher.email || '—'}</TableCell>
                    <TableCell>{teacher.phone || '—'}</TableCell>
                    <TableCell>{(teacher.subjects || []).join(', ') || '—'}</TableCell>
                    <TableCell>{teacher.isActive ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => openEditDialog(teacher)}>Edit</Button>
                      <Button size="small" color="error" onClick={() => deleteMutation.mutate(teacher._id || teacher.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">No teachers found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Pagination count={Math.ceil((data?.total || 0) / 10)} page={page} onChange={(_, value) => setPage(value)} color="primary" />
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
        <DialogTitle>{editing ? 'Edit Teacher' : 'Add Teacher'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, mt: 1 }}>
          <TextField label="Name" value={formValues.name} onChange={(e) => setFormValues({ ...formValues, name: e.target.value })} fullWidth />
          <TextField label="Email" value={formValues.email} onChange={(e) => setFormValues({ ...formValues, email: e.target.value })} fullWidth />
          <TextField label="Phone" value={formValues.phone} onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })} fullWidth />
          <TextField label="Subjects" helperText="Comma-separated" value={formValues.subjects} onChange={(e) => setFormValues({ ...formValues, subjects: e.target.value })} fullWidth />
          <TextField label="Profile" value={formValues.profile} onChange={(e) => setFormValues({ ...formValues, profile: e.target.value })} fullWidth multiline minRows={2} />
          <FormControlLabel control={<Switch checked={formValues.isActive} onChange={(e) => setFormValues({ ...formValues, isActive: e.target.checked })} />} label="Active" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

