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
} from '@mui/material';
import { studentsApi } from '../api/students.api';
import { classesApi } from '../../classes/api/classes.api';
import { sectionApi } from '../../sections/api/sections.api';

export const StudentsPage: FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formValues, setFormValues] = useState({ admissionNumber: '', rollNumber: '', firstName: '', lastName: '', dob: '', gender: '', bloodGroup: '', address: '', email: '', phone: '', parent: '', class: '', section: '', isActive: true });

  const { data: classesData } = useQuery({ queryKey: ['classesOptions'], queryFn: () => classesApi.getClasses({ limit: 200 }) });
  const { data: sectionsData } = useQuery({ queryKey: ['sectionsOptions'], queryFn: () => sectionApi.getSections({ limit: 200 }) });

  const filterParams = { page, limit: 10, search: search || undefined, class: selectedClass || undefined, section: selectedSection || undefined };

  const { data, isLoading } = useQuery({ queryKey: ['students', filterParams], queryFn: () => studentsApi.getStudents(filterParams) });

  const createMutation = useMutation({ mutationFn: (data: any) => studentsApi.createStudent(data), onSuccess: () => queryClient.invalidateQueries(['students']) });
  const updateMutation = useMutation({ mutationFn: (data: any) => studentsApi.updateStudent(editing._id || editing.id, data), onSuccess: () => { queryClient.invalidateQueries(['students']); setEditing(null); } });
  const deleteMutation = useMutation({ mutationFn: (id: string) => studentsApi.deleteStudent(id), onSuccess: () => queryClient.invalidateQueries(['students']) });

  const openCreateDialog = () => {
    setEditing(null);
    setFormValues({ admissionNumber: '', rollNumber: '', firstName: '', lastName: '', dob: '', gender: '', bloodGroup: '', address: '', email: '', phone: '', parent: '', class: '', section: '', isActive: true });
    setDialogOpen(true);
  };

  const openEditDialog = (item: any) => {
    setEditing(item);
    setFormValues({
      admissionNumber: item.admissionNumber || '',
      rollNumber: item.rollNumber || '',
      firstName: item.firstName || '',
      lastName: item.lastName || '',
      dob: item.dob ? item.dob.split('T')[0] : '',
      gender: item.gender || '',
      bloodGroup: item.bloodGroup || '',
      address: item.address || '',
      email: item.email || '',
      phone: item.phone || '',
      parent: item.parent || '',
      class: item.class?._id || item.class || '',
      section: item.section?._id || item.section || '',
      isActive: !!item.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload = { ...formValues };
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
        <Typography variant="h4">Students</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField label="Search" value={search} onChange={(e) => setSearch(e.target.value)} size="small" />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Class</InputLabel>
            <Select label="Class" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              <MenuItem value="">All Classes</MenuItem>
              {classesData?.data?.map((c: any) => <MenuItem key={c._id || c.id} value={c._id || c.id}>{c.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Section</InputLabel>
            <Select label="Section" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
              <MenuItem value="">All Sections</MenuItem>
              {sectionsData?.data?.map((s: any) => <MenuItem key={s._id || s.id} value={s._id || s.id}>{s.name}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="contained" color="success" onClick={openCreateDialog}>Admit Student</Button>
        </Box>
      </Box>

      <Paper>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="students table">
            <TableHead>
              <TableRow>
                <TableCell>Admission#</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Section</TableCell>
                <TableCell>Parent</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center"><CircularProgress size={24} /></TableCell>
                </TableRow>
              ) : data?.data?.length ? (
                data.data.map((item: any) => (
                  <TableRow key={item._id || item.id}>
                    <TableCell>{item.admissionNumber}</TableCell>
                    <TableCell>{`${item.firstName} ${item.lastName || ''}`}</TableCell>
                    <TableCell>{item.class?.name || item.class || '—'}</TableCell>
                    <TableCell>{item.section?.name || item.section || '—'}</TableCell>
                    <TableCell>{item.parent || '—'}</TableCell>
                    <TableCell>{item.isActive ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => openEditDialog(item)}>Edit</Button>
                      <Button size="small" color="error" onClick={() => deleteMutation.mutate(item._id || item.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">No students found.</TableCell>
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
        <DialogTitle>{editing ? 'Edit Student' : 'Admit Student'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, mt: 1 }}>
          <TextField label="Admission Number" value={formValues.admissionNumber} onChange={(e) => setFormValues({ ...formValues, admissionNumber: e.target.value })} fullWidth />
          <TextField label="Roll Number" value={formValues.rollNumber} onChange={(e) => setFormValues({ ...formValues, rollNumber: e.target.value })} fullWidth />
          <TextField label="First Name" value={formValues.firstName} onChange={(e) => setFormValues({ ...formValues, firstName: e.target.value })} fullWidth />
          <TextField label="Last Name" value={formValues.lastName} onChange={(e) => setFormValues({ ...formValues, lastName: e.target.value })} fullWidth />
          <TextField type="date" label="DOB" slotProps={{ inputLabel: { shrink: true } }} value={formValues.dob} onChange={(e) => setFormValues({ ...formValues, dob: e.target.value })} fullWidth />
          <FormControl fullWidth>
            <InputLabel>Gender</InputLabel>
            <Select label="Gender" value={formValues.gender} onChange={(e) => setFormValues({ ...formValues, gender: e.target.value })}>
              <MenuItem value="">—</MenuItem>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Blood Group" value={formValues.bloodGroup} onChange={(e) => setFormValues({ ...formValues, bloodGroup: e.target.value })} fullWidth />
          <TextField label="Address" value={formValues.address} onChange={(e) => setFormValues({ ...formValues, address: e.target.value })} fullWidth />
          <TextField label="Email" value={formValues.email} onChange={(e) => setFormValues({ ...formValues, email: e.target.value })} fullWidth />
          <TextField label="Phone" value={formValues.phone} onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })} fullWidth />
          <TextField label="Parent Name" value={formValues.parent} onChange={(e) => setFormValues({ ...formValues, parent: e.target.value })} fullWidth />
          <FormControl fullWidth>
            <InputLabel>Class</InputLabel>
            <Select label="Class" value={formValues.class} onChange={(e) => setFormValues({ ...formValues, class: e.target.value })}>
              <MenuItem value="">None</MenuItem>
              {classesData?.data?.map((c: any) => <MenuItem key={c._id || c.id} value={c._id || c.id}>{c.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Section</InputLabel>
            <Select label="Section" value={formValues.section} onChange={(e) => setFormValues({ ...formValues, section: e.target.value })}>
              <MenuItem value="">None</MenuItem>
              {sectionsData?.data?.map((s: any) => <MenuItem key={s._id || s.id} value={s._id || s.id}>{s.name}</MenuItem>)}
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

