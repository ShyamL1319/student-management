import { useState } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Box,
  Alert,
  Chip,
  Button,
} from '@mui/material';
import { fetchPendingFees, fetchOutstandingAmount } from '../feesApi';

export default function PendingFeesPage() {
  const [pendingFees, setPendingFees] = useState<any[]>([]);
  const [outstanding, setOutstanding] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState('');

  async function handleSearch() {
    if (!studentId.trim()) {
      alert('Please enter a Student ID');
      return;
    }

    setLoading(true);
    try {
      const [feesData, outstandingData] = await Promise.all([
        fetchPendingFees(studentId),
        fetchOutstandingAmount(studentId),
      ]);
      setPendingFees(feesData || []);
      setOutstanding(outstandingData);
    } catch (error) {
      console.error('Error loading pending fees:', error);
      setPendingFees([]);
      setOutstanding(null);
    } finally {
      setLoading(false);
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
      <h1>Pending Fees</h1>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      {outstanding && (
        <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box>
              <strong>Student ID:</strong> {outstanding.studentId}
            </Box>
            <Box>
              <strong>Outstanding Amount:</strong> <span style={{ fontSize: '1.2em', color: '#d32f2f' }}>
                ₹{outstanding.outstanding.toFixed(2)}
              </span>
            </Box>
            <Box>
              <strong>Pending Count:</strong> {outstanding.count}
            </Box>
          </Box>
        </Paper>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Fee Structure ID</TableCell>
              <TableCell align="right">Amount Due</TableCell>
              <TableCell align="right">Discount</TableCell>
              <TableCell align="right">Amount Paid</TableCell>
              <TableCell align="right">Balance</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : pendingFees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Alert severity="success">
                    {studentId ? 'No pending fees found for this student' : 'Enter a Student ID to search'}
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              pendingFees.map((fee) => {
                const balance = fee.amountDue - fee.discount - (fee.amountPaid || 0);
                return (
                  <TableRow key={fee._id}>
                    <TableCell>{fee.feeStructureId}</TableCell>
                    <TableCell align="right">₹{fee.amountDue?.toFixed(2)}</TableCell>
                    <TableCell align="right">₹{fee.discount?.toFixed(2)}</TableCell>
                    <TableCell align="right">₹{(fee.amountPaid || 0).toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <strong>₹{Math.max(0, balance).toFixed(2)}</strong>
                    </TableCell>
                    <TableCell>{new Date(fee.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip label={fee.status} color={getStatusColor(fee.status) as any} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
