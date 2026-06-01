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
import {
  fetchFeeCollections,
  createFeeCollection,
  recordPayment,
  updateFeeCollection,
} from '../feesApi';

export default function FeeCollectionPage() {
  const [feeCollections, setFeeCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({
    amountPaid: 0,
    paymentMethod: 'CASH',
  });
  const [formData, setFormData] = useState({
    studentId: '',
    feeStructureId: '',
    classId: '',
    academicYearId: '',
    amountDue: 0,
  });

  useEffect(() => {
    loadFeeCollections();
  }, []);

  async function loadFeeCollections() {
    setLoading(true);
    try {
      const data = await fetchFeeCollections();
      setFeeCollections(data || []);
    } catch (error) {
      console.error('Error loading fee collections:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCollection() {
    try {
      await createFeeCollection({
        ...formData,
        amountDue: parseFloat(formData.amountDue.toString()),
        dueDate: new Date(),
      });
      setOpenDialog(false);
      setFormData({
        studentId: '',
        feeStructureId: '',
        classId: '',
        academicYearId: '',
        amountDue: 0,
      });
      loadFeeCollections();
    } catch (error) {
      console.error('Error creating fee collection:', error);
    }
  }

  async function handleRecordPayment() {
    if (!selectedFee) return;
    try {
      await recordPayment(selectedFee._id, paymentData.amountPaid, paymentData.paymentMethod);
      setPaymentDialog(false);
      setSelectedFee(null);
      setPaymentData({ amountPaid: 0, paymentMethod: 'CASH' });
      loadFeeCollections();
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'PARTIAL':
        return 'info';
      case 'OVERDUE':
        return 'error';
      default:
        return 'default';
    }
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <h1>Fee Collections</h1>
        <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
          Add Fee Collection
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Student ID</TableCell>
              <TableCell align="right">Amount Due</TableCell>
              <TableCell align="right">Amount Paid</TableCell>
              <TableCell align="right">Balance</TableCell>
              <TableCell>Due Date</TableCell>
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
            ) : feeCollections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Alert severity="info">No fee collections found</Alert>
                </TableCell>
              </TableRow>
            ) : (
              feeCollections.map((fee) => {
                const balance = fee.amountDue - fee.discount - (fee.amountPaid || 0);
                return (
                  <TableRow key={fee._id}>
                    <TableCell>{fee.studentId}</TableCell>
                    <TableCell align="right">₹{fee.amountDue?.toFixed(2)}</TableCell>
                    <TableCell align="right">₹{(fee.amountPaid || 0).toFixed(2)}</TableCell>
                    <TableCell align="right">₹{Math.max(0, balance).toFixed(2)}</TableCell>
                    <TableCell>{new Date(fee.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip label={fee.status} color={getStatusColor(fee.status) as any} />
                    </TableCell>
                    <TableCell align="center">
                      {fee.status !== 'PAID' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedFee(fee);
                            setPaymentDialog(true);
                          }}
                        >
                          Record Payment
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Fee Collection</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Student ID"
            value={formData.studentId}
            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Amount Due"
            type="number"
            value={formData.amountDue}
            onChange={(e) => setFormData({ ...formData, amountDue: parseFloat(e.target.value) })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateCollection} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Amount to Pay"
            type="number"
            value={paymentData.amountPaid}
            onChange={(e) => setPaymentData({ ...paymentData, amountPaid: parseFloat(e.target.value) })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Payment Method"
            value={paymentData.paymentMethod}
            onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
            margin="normal"
            select
            SelectProps={{ native: true }}
          >
            <option value="CASH">Cash</option>
            <option value="CHEQUE">Cheque</option>
            <option value="ONLINE">Online</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
          <Button onClick={handleRecordPayment} variant="contained" color="primary">
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
