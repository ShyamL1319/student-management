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
} from '@mui/material';
import { parentsApi } from '../api/parents.api';

export const ParentsPage: FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formValues, setFormValues] = useState({ name: '', email: '', phone: '', isActive: true });

  const filterParams = { page, limit: 10, search: search || undefined };

  const { data, isLoading } = useQuery({ queryKey: ['parents', filterParams], queryFn: () => parentsApi.getParents(filterParams) });

  const createMutation = useMutation({ mutationFn: (data: any) => parentsApi.createParent(data), onSuccess: () => queryClient.invalidateQueries(['parents']) });
  const updateMutation = useMutation({ mutationFn: (data: any) => parentsApi.updateParent(editing._id || editing.id, data), onSuccess: () => { queryClient.invalidateQueries(['parents']); setEditing(null); } });
  const deleteMutation = useMutation({ mutationFn: (id: string) => parentsApi.deleteParent(id), onSuccess: () => queryClient.invalidateQueries(['parents']) });

  const openCreateDialog = () => {
    setEditing(null);
    setFormValues({ name: '', email: '', phone: '', isActive: true });
    setDialogOpen(true);
  };

  const openEditDialog = (item: any) => {
    setEditing(item);
    setFormValues({ name: item.name || '', email: item.email || '', phone: item.phone || '', isActive: !!item.isActive });
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
        <Typography variant="h4">Parents</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField label="Search" value={search} onChange={(e) => setSearch(e.target.value)} size="small" />
          <Button variant="contained" color="success" onClick={openCreateDialog}>Add Parent</Button>
        </Box>
      </Box>

      <Paper>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="parents table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center"><CircularProgress size={24} /></TableCell>
                </TableRow>
              ) : data?.data?.length ? (
                data.data.map((item: any) => (
                  <TableRow key={item._id || item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.email || '—'}</TableCell>
                    <TableCell>{item.phone || '—'}</TableCell>
                    <TableCell>{item.isActive ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => openEditDialog(item)}>Edit</Button>
                      <Button size="small" color="error" onClick={() => deleteMutation.mutate(item._id || item.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">No parents found.</TableCell>
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
        <DialogTitle>{editing ? 'Edit Parent' : 'Add Parent'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, mt: 1 }}>
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
