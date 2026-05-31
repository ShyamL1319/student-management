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
import { staffApi } from '../api/staff.api';
import { departmentApi } from '../../departments/api/departments.api';

export const StaffPage: FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formValues, setFormValues] = useState({ department: '', name: '', email: '', phone: '', isActive: true });

  const { data: departmentsData } = useQuery({ queryKey: ['departmentsOptions'], queryFn: () => departmentApi.getDepartments({ limit: 100 }) });

  const filterParams = {
    page,
    limit: 10,
    search: search || undefined,
    department: selectedDepartment || undefined,
  };

  const { data, isLoading } = useQuery({ queryKey: ['staff', filterParams], queryFn: () => staffApi.getStaff(filterParams) });

  const createMutation = useMutation({ mutationFn: (data: any) => staffApi.createStaff(data), onSuccess: () => queryClient.invalidateQueries(['staff']) });
  const updateMutation = useMutation({ mutationFn: (data: any) => staffApi.updateStaff(editing._id || editing.id, data), onSuccess: () => { queryClient.invalidateQueries(['staff']); setEditing(null); } });
  const deleteMutation = useMutation({ mutationFn: (id: string) => staffApi.deleteStaff(id), onSuccess: () => queryClient.invalidateQueries(['staff']) });

  const openCreateDialog = () => {
    setEditing(null);
    setFormValues({ department: '', name: '', email: '', phone: '', isActive: true });
    setDialogOpen(true);
  };

  const openEditDialog = (item: any) => {
    setEditing(item);
    setFormValues({
      department: item.department?._id || item.department || '',
      name: item.name || '',
      email: item.email || '',
      phone: item.phone || '',
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
        <Typography variant="h4">Staff</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField label="Search" value={search} onChange={(e) => setSearch(e.target.value)} size="small" />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Department</InputLabel>
            <Select label="Department" value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
              <MenuItem value="">All Departments</MenuItem>
              {departmentsData?.data?.map((department: any) => (
                <MenuItem key={department._id || department.id} value={department._id || department.id}>{department.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" color="success" onClick={openCreateDialog}>Add Staff</Button>
        </Box>
      </Box>

      <Paper>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="staff table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Department</TableCell>
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
                data.data.map((item: any) => (
                  <TableRow key={item._id || item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.email || '—'}</TableCell>
                    <TableCell>{item.phone || '—'}</TableCell>
                    <TableCell>{item.department?.name || item.department || 'N/A'}</TableCell>
                    <TableCell>{item.isActive ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => openEditDialog(item)}>Edit</Button>
                      <Button size="small" color="error" onClick={() => deleteMutation.mutate(item._id || item.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">No staff found.</TableCell>
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
        <DialogTitle>{editing ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Department</InputLabel>
            <Select label="Department" value={formValues.department} onChange={(e) => setFormValues({ ...formValues, department: e.target.value })}>
              {departmentsData?.data?.map((department: any) => (
                <MenuItem key={department._id || department.id} value={department._id || department.id}>{department.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Name" value={formValues.name} onChange={(e) => setFormValues({ ...formValues, name: e.target.value })} fullWidth />
          <TextField label="Email" value={formValues.email} onChange={(e) => setFormValues({ ...formValues, email: e.target.value })} fullWidth />
          <TextField label="Phone" value={formValues.phone} onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })} fullWidth />
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
