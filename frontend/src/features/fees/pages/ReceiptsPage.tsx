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
  TextField,
  Box,
  Alert,
  Chip,
} from '@mui/material';
import { fetchReceipts, cancelReceipt } from '../feesApi';

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState('');

  useEffect(() => {
    loadReceipts();
  }, []);

  async function loadReceipts() {
    setLoading(true);
    try {
      const data = await fetchReceipts(studentId || undefined);
      setReceipts(data || []);
    } catch (error) {
      console.error('Error loading receipts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id: string) {
    try {
      await cancelReceipt(id);
      loadReceipts();
    } catch (error) {
      console.error('Error canceling receipt:', error);
    }
  }

  function handleSearch() {
    loadReceipts();
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <h1>Receipts</h1>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Filter by Student ID (Optional)"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          size="small"
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Receipt Number</TableCell>
              <TableCell>Student ID</TableCell>
              <TableCell align="right">Amount Received</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Payment Date</TableCell>
              <TableCell>Received By</TableCell>
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
            ) : receipts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Alert severity="info">No receipts found</Alert>
                </TableCell>
              </TableRow>
            ) : (
              receipts.map((receipt) => (
                <TableRow key={receipt._id}>
                  <TableCell>
                    <strong>{receipt.receiptNumber}</strong>
                  </TableCell>
                  <TableCell>{receipt.studentId}</TableCell>
                  <TableCell align="right">₹{receipt.amountReceived?.toFixed(2)}</TableCell>
                  <TableCell>{receipt.paymentMethod}</TableCell>
                  <TableCell>{new Date(receipt.paymentDate).toLocaleDateString()}</TableCell>
                  <TableCell>{receipt.receivedBy}</TableCell>
                  <TableCell>
                    <Chip
                      label={receipt.status}
                      color={receipt.status === 'ISSUED' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {receipt.status === 'ISSUED' && (
                      <Button size="small" color="error" onClick={() => handleCancel(receipt._id)}>
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
