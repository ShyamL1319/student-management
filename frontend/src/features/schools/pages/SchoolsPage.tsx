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
import { schoolApi } from '../api/schools.api';

type School = {
  _id?: string;
  id?: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
};

export const SchoolsPage: FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<School | null>(null);
  const [formValues, setFormValues] = useState<School>({
    name: '',
    address: '',
    phone: '',
    email: '',
    isActive: true,
  });

  const filterParams = {
    page,
    limit: 10,
    search: search || undefined,
    isActive: status === 'all' ? undefined : status === 'active',
  };

  const { data, isLoading } = useQuery<{ data: School[]; total: number }>({
    queryKey: ['schools', filterParams],
    queryFn: () => schoolApi.getSchools(filterParams),
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<School, '_id' | 'id'>) => schoolApi.createSchool(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schools'] }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Omit<School, '_id' | 'id'>) => schoolApi.updateSchool(editing?._id || editing?.id || '', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => schoolApi.deleteSchool(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schools'] }),
  });

  const openCreateDialog = () => {
    setEditing(null);
    setFormValues({ name: '', address: '', phone: '', email: '', isActive: true });
    setDialogOpen(true);
  };

  const openEditDialog = (school: School) => {
    setEditing(school);
    setFormValues({
      name: school.name || '',
      address: school.address || '',
      phone: school.phone || '',
      email: school.email || '',
      isActive: !!school.isActive,
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
        <Typography variant="h4">Schools</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            size="small"
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={status}
              onChange={(event) => setStatus(event.target.value as 'all' | 'active' | 'inactive')}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" color="success" onClick={openCreateDialog}>
            Add School
          </Button>
        </Box>
      </Box>

      <Paper>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="schools table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : data?.data?.length ? (
                data.data.map((school: School) => (
                  <TableRow key={school._id || school.id}>
                    <TableCell>{school.name}</TableCell>
                    <TableCell>{school.address}</TableCell>
                    <TableCell>{school.phone}</TableCell>
                    <TableCell>{school.email}</TableCell>
                    <TableCell>{school.isActive ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => openEditDialog(school)}>
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => deleteMutation.mutate(school._id || school.id || '')}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No schools found.
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
        <DialogTitle>{editing ? 'Edit School' : 'Add School'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, mt: 1 }}>
          <TextField
            label="Name"
            value={formValues.name}
            onChange={(event) => setFormValues({ ...formValues, name: event.target.value })}
            fullWidth
          />
          <TextField
            label="Address"
            value={formValues.address}
            onChange={(event) => setFormValues({ ...formValues, address: event.target.value })}
            fullWidth
          />
          <TextField
            label="Phone"
            value={formValues.phone}
            onChange={(event) => setFormValues({ ...formValues, phone: event.target.value })}
            fullWidth
          />
          <TextField
            label="Email"
            value={formValues.email}
            onChange={(event) => setFormValues({ ...formValues, email: event.target.value })}
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
