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
import { departmentApi } from '../api/departments.api';
import { schoolApi } from '../../schools/api/schools.api';

export const DepartmentsPage: FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formValues, setFormValues] = useState({ school: '', name: '', isActive: true });

  const { data: schoolsData } = useQuery({
    queryKey: ['schoolsOptions'],
    queryFn: () => schoolApi.getSchools({ limit: 100 }),
  });

  const filterParams = {
    page,
    limit: 10,
    search: search || undefined,
    isActive: status === 'all' ? undefined : status === 'active',
    school: selectedSchool || undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['departments', filterParams],
    queryFn: () => departmentApi.getDepartments(filterParams),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => departmentApi.createDepartment(data),
    onSuccess: () => queryClient.invalidateQueries(['departments']),
  });
  const updateMutation = useMutation({
    mutationFn: (data: any) => departmentApi.updateDepartment(editing.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['departments']);
      setEditing(null);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => departmentApi.deleteDepartment(id),
    onSuccess: () => queryClient.invalidateQueries(['departments']),
  });

  const openCreateDialog = () => {
    setEditing(null);
    setFormValues({ school: '', name: '', isActive: true });
    setDialogOpen(true);
  };

  const openEditDialog = (item: any) => {
    setEditing(item);
    setFormValues({
      school: item.school?._id || item.school || '',
      name: item.name || '',
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
        <Typography variant="h4">Departments</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            size="small"
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>School</InputLabel>
            <Select
              label="School"
              value={selectedSchool}
              onChange={(event) => setSelectedSchool(event.target.value)}
            >
              <MenuItem value="">All Schools</MenuItem>
              {schoolsData?.data?.map((school: any) => (
                <MenuItem key={school._id || school.id} value={school._id || school.id}>
                  {school.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={status}
              onChange={(event) => setStatus(event.target.value as any)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" color="success" onClick={openCreateDialog}>
            Add Department
          </Button>
        </Box>
      </Box>

      <Paper>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="departments table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>School</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : data?.data?.length ? (
                data.data.map((item: any) => (
                  <TableRow key={item._id || item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.school?.name || item.school || 'N/A'}</TableCell>
                    <TableCell>{item.isActive ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => openEditDialog(item)}>
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => deleteMutation.mutate(item._id || item.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No departments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Pagination
          count={Math.ceil((data?.total || 0) / 10)}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
        />
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
        <DialogTitle>{editing ? 'Edit Department' : 'Add Department'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>School</InputLabel>
            <Select
              label="School"
              value={formValues.school}
              onChange={(event) => setFormValues({ ...formValues, school: event.target.value })}
            >
              {schoolsData?.data?.map((school: any) => (
                <MenuItem key={school._id || school.id} value={school._id || school.id}>
                  {school.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Name"
            value={formValues.name}
            onChange={(event) => setFormValues({ ...formValues, name: event.target.value })}
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch
                checked={formValues.isActive}
                onChange={(event) => setFormValues({ ...formValues, isActive: event.target.checked })}
              />
            }
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
