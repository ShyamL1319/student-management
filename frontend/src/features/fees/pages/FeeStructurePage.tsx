import React, { useState, useEffect } from 'react';
import {
  Container,
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
  Box,
  Alert,
  Chip,
} from '@mui/material';
import { fetchFeeStructures, createFeeStructure, updateFeeStructure, deactivateFeeStructure } from '../feesApi';

export default function FeeStructurePage() {
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    classId: '',
    academicYearId: '',
    feeName: '',
    amount: 0,
    discount: 0,
    frequency: 'MONTHLY',
    applicability: 'APPLICABLE',
    description: '',
  });

  useEffect(() => {
    loadFeeStructures();
  }, []);

  async function loadFeeStructures() {
    setLoading(true);
    try {
      const data = await fetchFeeStructures();
      setFeeStructures(data || []);
    } catch (error) {
      console.error('Error loading fee structures:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      if (editingId) {
        await updateFeeStructure(editingId, formData);
      } else {
        await createFeeStructure({
          ...formData,
          dueDate: new Date(),
          amount: parseFloat(formData.amount.toString()),
          discount: parseFloat(formData.discount.toString()),
        });
      }
      setOpenDialog(false);
      setFormData({
        classId: '',
        academicYearId: '',
        feeName: '',
        amount: 0,
        discount: 0,
        frequency: 'MONTHLY',
        applicability: 'APPLICABLE',
        description: '',
      });
      setEditingId(null);
      loadFeeStructures();
    } catch (error) {
      console.error('Error saving fee structure:', error);
    }
  }

  async function handleDeactivate(id: string) {
    try {
      await deactivateFeeStructure(id);
      loadFeeStructures();
    } catch (error) {
      console.error('Error deactivating fee structure:', error);
    }
  }

  function handleEdit(structure: any) {
    setFormData(structure);
    setEditingId(structure._id);
    setOpenDialog(true);
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <h1>Fee Structures</h1>
        <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
          Add New Fee Structure
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Fee Name</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Discount</TableCell>
              <TableCell>Frequency</TableCell>
              <TableCell>Applicability</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : feeStructures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Alert severity="info">No fee structures found</Alert>
                </TableCell>
              </TableRow>
            ) : (
              feeStructures.map((structure) => (
                <TableRow key={structure._id}>
                  <TableCell>{structure.feeName}</TableCell>
                  <TableCell align="right">₹{structure.amount?.toFixed(2)}</TableCell>
                  <TableCell align="right">₹{structure.discount?.toFixed(2)}</TableCell>
                  <TableCell>{structure.frequency}</TableCell>
                  <TableCell>{structure.applicability}</TableCell>
                  <TableCell>
                    <Chip label={structure.isActive ? 'Active' : 'Inactive'} color={structure.isActive ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell align="center">
                    <Button size="small" onClick={() => handleEdit(structure)}>
                      Edit
                    </Button>
                    {structure.isActive && (
                      <Button size="small" color="error" onClick={() => handleDeactivate(structure._id)}>
                        Deactivate
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Fee Structure' : 'Add New Fee Structure'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Fee Name"
            value={formData.feeName}
            onChange={(e) => setFormData({ ...formData, feeName: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Discount"
            type="number"
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
