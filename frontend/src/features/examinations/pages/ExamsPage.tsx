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
  CircularProgress,
  Pagination,
} from '@mui/material';
import { examinationsApi } from '../../../api/examinations/examinationsAPI';

export const ExamsPage: FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', type: '', description: '' });

  const examsQuery = useQuery({
    queryKey: ['exams', page],
    queryFn: () => examinationsApi.getExams({ page, limit }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => examinationsApi.createExam(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exams'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => examinationsApi.updateExam(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exams'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => examinationsApi.deleteExam(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exams'] }),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => examinationsApi.publishExam(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exams'] }),
  });

  const data = examsQuery.data || { data: [], total: 0 };

  const openDialog = (rec?: any) => {
    if (rec) {
      setEditing(rec);
      setForm({ name: rec.name || '', type: rec.type || '', description: rec.description || '' });
    } else {
      setEditing(null);
      setForm({ name: '', type: '', description: '' });
    }
    setDialogOpen(true);
  };

  const close = () => setDialogOpen(false);

  const save = () => {
    if (editing) updateMutation.mutate({ id: editing._id, data: form });
    else createMutation.mutate(form);
    setDialogOpen(false);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Examinations
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Button variant="contained" onClick={() => openDialog()}>
          Create Exam
        </Button>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Published</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {examsQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : data.data.length ? (
                data.data.map((e: any) => (
                  <TableRow key={e._id}>
                    <TableCell>{e.name}</TableCell>
                    <TableCell>{e.type}</TableCell>
                    <TableCell>{e.isPublished ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => openDialog(e)} sx={{ mr: 1 }}>
                        Edit
                      </Button>
                      <Button size="small" onClick={() => publishMutation.mutate(e._id)} sx={{ mr: 1 }}>
                        Publish
                      </Button>
                      <Button size="small" color="error" onClick={() => deleteMutation.mutate(e._id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No exams found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Pagination count={Math.ceil((data.total || 0) / limit)} page={page} onChange={(_, v) => setPage(v)} />
      </Box>

      <Dialog open={dialogOpen} onClose={close} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit Exam' : 'Create Exam'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Type"
            fullWidth
            value={form.type}
            onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={form.description}
            onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Cancel</Button>
          <Button variant="contained" onClick={save}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
