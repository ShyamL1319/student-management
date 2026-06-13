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
  OutlinedInput,
  Chip,
} from '@mui/material';
import { parentsApi } from '../api/parents.api';
import { studentsApi } from '../../students/api/students.api';

interface StudentListItem {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
}

interface ParentListItem {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  relationshipType?: string;
  occupation?: string;
  address?: string;
  children?: StudentListItem[];
  isActive?: boolean;
}

interface ParentPayload {
  firstName: string;
  lastName: string;
  email?: string;
  password?: string;
  phone?: string;
  relationshipType?: string;
  occupation?: string;
  address?: string;
  children?: string[];
  isActive?: boolean;
}

export const ParentsPage: FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ParentListItem | null>(null);
  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    relationshipType: '',
    occupation: '',
    address: '',
    children: [] as string[],
    isActive: true,
  });

  const filterParams = { page, limit: 10, search: debouncedSearch || undefined };

  // Fetch Parents
  const { data, isLoading } = useQuery<{ data: ParentListItem[]; total: number }>({
    queryKey: ['parents', filterParams],
    queryFn: () => parentsApi.getParents(filterParams),
  });

  // Fetch Students for association dropdown
  const { data: studentsData } = useQuery<{ data: StudentListItem[] }>({
    queryKey: ['students', { limit: 200 }],
    queryFn: () => studentsApi.getStudents({ limit: 200 }),
  });

  const studentsList = studentsData?.data || [];

  const createMutation = useMutation({
    mutationFn: (payload: ParentPayload) => parentsApi.createParent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      setDialogOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ParentPayload> }) => parentsApi.updateParent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      setEditing(null);
      setDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => parentsApi.deleteParent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parents'] }),
  });

  const openCreateDialog = () => {
    setEditing(null);
    setFormValues({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      relationshipType: '',
      occupation: '',
      address: '',
      children: [],
      isActive: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (parent: ParentListItem) => {
    setEditing(parent);
    setFormValues({
      firstName: parent.firstName || '',
      lastName: parent.lastName || '',
      email: parent.email || '',
      password: '', // do not display password on edit
      phone: parent.phone || '',
      relationshipType: parent.relationshipType || '',
      occupation: parent.occupation || '',
      address: parent.address || '',
      children: (parent.children || []).map((c) => c._id || c.id || ''),
      isActive: !!parent.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload: ParentPayload = {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      email: formValues.email,
      phone: formValues.phone,
      relationshipType: formValues.relationshipType,
      occupation: formValues.occupation,
      address: formValues.address,
      children: formValues.children,
      isActive: formValues.isActive,
    };

    if (editing) {
      await updateMutation.mutateAsync({ id: editing._id || editing.id || '', payload });
    } else {
      payload.password = formValues.password;
      await createMutation.mutateAsync(payload);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>Parents Directory</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField label="Search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} size="small" />
          <Button variant="contained" color="secondary" onClick={openCreateDialog}>Add Parent</Button>
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
                <TableCell>Relationship</TableCell>
                <TableCell>Children</TableCell>
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
                data.data.map((parent: ParentListItem) => (
                  <TableRow key={parent._id || parent.id}>
                    <TableCell>{parent.firstName} {parent.lastName}</TableCell>
                    <TableCell>{parent.email || '—'}</TableCell>
                    <TableCell>{parent.phone || '—'}</TableCell>
                    <TableCell>{parent.relationshipType || '—'}</TableCell>
                    <TableCell>
                      {parent.children && parent.children.length > 0
                        ? parent.children.map((c) => `${c.firstName} ${c.lastName}`).join(', ')
                        : '—'}
                    </TableCell>
                    <TableCell>{parent.isActive ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => openEditDialog(parent)}>Edit</Button>
                      <Button size="small" color="error" onClick={() => deleteMutation.mutate(parent._id || parent.id || '')}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">No parents found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Pagination count={Math.ceil((data?.total || 0) / 10)} page={page} onChange={(_, value) => setPage(value)} color="primary" />
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit Parent Account' : 'Create Parent Account'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, mt: 1 }}>
          <TextField label="First Name" value={formValues.firstName} onChange={(e) => setFormValues({ ...formValues, firstName: e.target.value })} fullWidth />
          <TextField label="Last Name" value={formValues.lastName} onChange={(e) => setFormValues({ ...formValues, lastName: e.target.value })} fullWidth />
          <TextField label="Email" value={formValues.email} onChange={(e) => setFormValues({ ...formValues, email: e.target.value })} fullWidth />
          {!editing && (
            <TextField label="Password" type="password" value={formValues.password} onChange={(e) => setFormValues({ ...formValues, password: e.target.value })} fullWidth />
          )}
          <TextField label="Phone" value={formValues.phone} onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })} fullWidth />
          <TextField label="Relationship designation" placeholder="e.g. Father, Mother, Guardian" value={formValues.relationshipType} onChange={(e) => setFormValues({ ...formValues, relationshipType: e.target.value })} fullWidth />
          <TextField label="Occupation" value={formValues.occupation} onChange={(e) => setFormValues({ ...formValues, occupation: e.target.value })} fullWidth />
          <TextField label="Address" value={formValues.address} onChange={(e) => setFormValues({ ...formValues, address: e.target.value })} fullWidth multiline minRows={2} />
          
          <FormControl fullWidth>
            <InputLabel id="children-label">Associated Children</InputLabel>
            <Select
              labelId="children-label"
              id="children-select"
              multiple
              value={formValues.children}
              onChange={(e) => setFormValues({ ...formValues, children: typeof e.target.value === 'string' ? e.target.value.split(',') : (e.target.value as string[]) })}
              input={<OutlinedInput label="Associated Children" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const studentObj = studentsList.find((s) => (s._id || s.id) === value);
                    return (
                      <Chip
                        key={value}
                        label={studentObj ? `${studentObj.firstName} ${studentObj.lastName}` : value}
                      />
                    );
                  })}
                </Box>
              )}
            >
              {studentsList.map((student) => (
                <MenuItem key={student._id || student.id} value={student._id || student.id}>
                  {student.firstName} {student.lastName} ({student.admissionNumber})
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

