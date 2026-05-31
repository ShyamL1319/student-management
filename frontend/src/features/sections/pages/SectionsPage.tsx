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
import { sectionApi } from '../api/sections.api';
import { classesApi } from '../../classes/api/classes.api';

export const SectionsPage: FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedClass, setSelectedClass] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formValues, setFormValues] = useState({ classRef: '', name: '', isActive: true });

  const { data: classesData } = useQuery({
    queryKey: ['classesOptions'],
    queryFn: () => classesApi.getClasses({ limit: 100 }),
  });

  const filterParams = {
    page,
    limit: 10,
    search: search || undefined,
    isActive: status === 'all' ? undefined : status === 'active',
    classRef: selectedClass || undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['sections', filterParams],
    queryFn: () => sectionApi.getSections(filterParams),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => sectionApi.createSection(data),
    onSuccess: () => queryClient.invalidateQueries(['sections']),
  });
  const updateMutation = useMutation({
    mutationFn: (data: any) => sectionApi.updateSection(editing.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['sections']);
      setEditing(null);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => sectionApi.deleteSection(id),
    onSuccess: () => queryClient.invalidateQueries(['sections']),
  });

  const openCreateDialog = () => {
    setEditing(null);
    setFormValues({ classRef: '', name: '', isActive: true });
    setDialogOpen(true);
  };

  const openEditDialog = (item: any) => {
    setEditing(item);
    setFormValues({
      classRef: item.classRef?._id || item.classRef || '',
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
        <Typography variant="h4">Sections</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            size="small"
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Class</InputLabel>
            <Select
              label="Class"
              value={selectedClass}
              onChange={(event) => setSelectedClass(event.target.value)}
            >
              <MenuItem value="">All Classes</MenuItem>
              {classesData?.data?.map((cls: any) => (
                <MenuItem key={cls._id || cls.id} value={cls._id || cls.id}>
                  {cls.name}
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
            Add Section
          </Button>
        </Box>
      </Box>

      <Paper>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="sections table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Class</TableCell>
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
                    <TableCell>{item.classRef?.name || item.classRef || 'N/A'}</TableCell>
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
                    No sections found.
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
        <DialogTitle>{editing ? 'Edit Section' : 'Add Section'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Class</InputLabel>
            <Select
              label="Class"
              value={formValues.classRef}
              onChange={(event) => setFormValues({ ...formValues, classRef: event.target.value })}
            >
              {classesData?.data?.map((cls: any) => (
                <MenuItem key={cls._id || cls.id} value={cls._id || cls.id}>
                  {cls.name}
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
