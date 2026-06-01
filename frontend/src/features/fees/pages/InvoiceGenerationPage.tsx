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
import { fetchInvoices, fetchOverdueInvoices, createInvoice, recordInvoicePayment, cancelInvoice } from '../feesApi';

export default function InvoiceGenerationPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [filterType, setFilterType] = useState('all');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [formData, setFormData] = useState({
    studentId: '',
    classId: '',
    academicYearId: '',
    feeItems: [],
    totalAmount: 0,
    netAmount: 0,
    notes: '',
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    setLoading(true);
    try {
      let data;
      if (filterType === 'overdue') {
        data = await fetchOverdueInvoices();
      } else {
        data = await fetchInvoices();
      }
      setInvoices(data || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateInvoice() {
    try {
      await createInvoice({
        ...formData,
        totalAmount: parseFloat(formData.totalAmount.toString()),
        netAmount: parseFloat(formData.netAmount.toString()),
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        issuedBy: 'admin',
      });
      setOpenDialog(false);
      setFormData({
        studentId: '',
        classId: '',
        academicYearId: '',
        feeItems: [],
        totalAmount: 0,
        netAmount: 0,
        notes: '',
      });
      loadInvoices();
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  }

  async function handleRecordPayment() {
    if (!selectedInvoice || paymentAmount <= 0) return;
    try {
      await recordInvoicePayment(selectedInvoice._id, paymentAmount);
      setPaymentDialog(false);
      setSelectedInvoice(null);
      setPaymentAmount(0);
      loadInvoices();
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  }

  async function handleCancel(id: string) {
    try {
      await cancelInvoice(id);
      loadInvoices();
    } catch (error) {
      console.error('Error canceling invoice:', error);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'ISSUED':
        return 'info';
      case 'PARTIAL':
        return 'warning';
      case 'OVERDUE':
        return 'error';
      case 'CANCELLED':
        return 'default';
      default:
        return 'default';
    }
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <h1>Invoices</h1>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant={filterType === 'all' ? 'contained' : 'outlined'}
            onClick={() => {
              setFilterType('all');
              loadInvoices();
            }}
          >
            All Invoices
          </Button>
          <Button
            variant={filterType === 'overdue' ? 'contained' : 'outlined'}
            onClick={() => {
              setFilterType('overdue');
              loadInvoices();
            }}
          >
            Overdue
          </Button>
          <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
            Generate Invoice
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Invoice Number</TableCell>
              <TableCell>Student ID</TableCell>
              <TableCell align="right">Total Amount</TableCell>
              <TableCell align="right">Paid Amount</TableCell>
              <TableCell align="right">Pending Amount</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Alert severity="info">No invoices found</Alert>
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice._id}>
                  <TableCell>
                    <strong>{invoice.invoiceNumber}</strong>
                  </TableCell>
                  <TableCell>{invoice.studentId}</TableCell>
                  <TableCell align="right">₹{invoice.totalAmount?.toFixed(2)}</TableCell>
                  <TableCell align="right">₹{(invoice.paidAmount || 0).toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <strong>₹{invoice.pendingAmount?.toFixed(2)}</strong>
                  </TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip label={invoice.status} color={getStatusColor(invoice.status) as any} />
                  </TableCell>
                  <TableCell align="center">
                    {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                      <>
                        <Button
                          size="small"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setPaymentDialog(true);
                          }}
                        >
                          Pay
                        </Button>
                        <Button size="small" color="error" onClick={() => handleCancel(invoice._id)}>
                          Cancel
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Invoice</DialogTitle>
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
            label="Total Amount"
            type="number"
            value={formData.totalAmount}
            onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            margin="normal"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateInvoice} variant="contained" color="primary">
            Generate
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Payment Amount"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(parseFloat(e.target.value))}
            margin="normal"
          />
          {selectedInvoice && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Pending Amount: ₹{selectedInvoice.pendingAmount?.toFixed(2)}
            </Alert>
          )}
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
