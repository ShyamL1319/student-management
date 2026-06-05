import type { FC } from 'react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Checkbox,
  ListItemText,
  OutlinedInput,
} from '@mui/material';
import { subjectsApi } from '../api/subjects.api';
import { coursesApi } from '../../courses/api/courses.api';
import { teachersApi } from '../../teachers/api/teachers.api';

export const SubjectsPage: FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formValues, setFormValues] = useState({ name: '', code: '', course: '', teachers: [] as string[], isActive: true });

  const { data: coursesData } = useQuery({ queryKey: ['coursesOptions'], queryFn: () => coursesApi.getCourses({ limit: 100 }) });
  const { data: teachersData } = useQuery({ queryKey: ['teachersOptions'], queryFn: () => teachersApi.getTeachers({ limit: 100 }) });

  const filterParams = { page, limit: 10, search: search || undefined, course: selectedCourse || undefined };
  const { data, isLoading } = useQuery({ queryKey: ['subjects', filterParams], queryFn: () => subjectsApi.getSubjects(filterParams) });

  const createMutation = useMutation({ mutationFn: (data: any) => subjectsApi.createSubject(data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subjects'] }) });
  const updateMutation = useMutation({ mutationFn: (data: any) => subjectsApi.updateSubject(editing._id || editing.id, data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['subjects'] }); setEditing(null); } });
  const deleteMutation = useMutation({ mutationFn: (id: string) => subjectsApi.deleteSubject(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subjects'] }) });

  const openCreateDialog = () => { setEditing(null); setFormValues({ name: '', code: '', course: '', teachers: [], isActive: true }); setDialogOpen(true); };

  const openEditDialog = (item: any) => {
    setEditing(item);
    setFormValues({ name: item.name || '', code: item.code || '', course: item.course?._id || item.course || '', teachers: (item.teachers || []).map((t: any) => t._id || t.id), isActive: !!item.isActive });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload = { ...formValues };
    if (editing) await updateMutation.mutateAsync(payload);
    else await createMutation.mutateAsync(payload);
    setDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4">Subjects</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField label="Search" value={search} onChange={(e) => setSearch(e.target.value)} size="small" />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Course</InputLabel>
            <Select label="Course" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
              <MenuItem value="">All Courses</MenuItem>
              {coursesData?.data?.map((c: any) => (
                <MenuItem key={c._id || c.id} value={c._id || c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" color="success" onClick={openCreateDialog}>Add Subject</Button>
        </Box>
      </Box>

      <Paper>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="subjects table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Teachers</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} align="center"><CircularProgress size={24} /></TableCell></TableRow>
              ) : data?.data?.length ? (
                data.data.map((item: any) => (
                  <TableRow key={item._id || item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.course?.name || item.course || 'N/A'}</TableCell>
                    <TableCell>{(item.teachers || []).map((t: any) => t.name || t).join(', ') || '—'}</TableCell>
                    <TableCell>{item.isActive ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => openEditDialog(item)}>Edit</Button>
                      <Button size="small" color="error" onClick={() => deleteMutation.mutate(item._id || item.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} align="center">No subjects found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Pagination count={Math.ceil((data?.total || 0) / 10)} page={page} onChange={(_, v) => setPage(v)} color="primary" />
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
        <DialogTitle>{editing ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, mt: 1 }}>
          <TextField label="Name" value={formValues.name} onChange={(e) => setFormValues({ ...formValues, name: e.target.value })} fullWidth />
          <TextField label="Code" value={formValues.code} onChange={(e) => setFormValues({ ...formValues, code: e.target.value })} fullWidth />
          <FormControl fullWidth>
            <InputLabel>Course</InputLabel>
            <Select label="Course" value={formValues.course} onChange={(e) => setFormValues({ ...formValues, course: e.target.value })}>
              {coursesData?.data?.map((c: any) => (
                <MenuItem key={c._id || c.id} value={c._id || c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Teachers</InputLabel>
            <Select
              multiple
              value={formValues.teachers}
              onChange={(e) => setFormValues({ ...formValues, teachers: e.target.value as string[] })}
              input={<OutlinedInput label="Teachers" />}
              renderValue={(selected) => (selected as string[]).map((id) => teachersData?.data?.find((t: any) => t._id === id || t.id === id)?.name || id).join(', ')}
            >
              {teachersData?.data?.map((t: any) => (
                <MenuItem key={t._id || t.id} value={t._id || t.id}>
                  <Checkbox checked={formValues.teachers.indexOf(t._id || t.id) > -1} />
                  <ListItemText primary={t.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
