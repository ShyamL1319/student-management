import React, { useEffect, useState, useCallback } from 'react';
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
  Chip,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Button,
  Grid,
} from '@mui/material';
import { getAuditLogs } from '../auditLogsApi';
import type { AuditLog, AuditLogFilters } from '../auditLogsApi';

const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<AuditLogFilters>({
    action: '',
    status: '',
  });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Remove empty filters
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const data = await getAuditLogs(cleanFilters);
      setLogs(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      // Use a microtask or timeout to avoid synchronous setState during render phase
      // which can trigger cascading renders.
      Promise.resolve().then(() => { if (isMounted) fetchLogs(); });
    }
    return () => { isMounted = false; };
  }, [fetchLogs]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleApplyFilters = () => {
    fetchLogs();
  };

  const handleClearFilters = () => {
    setFilters({ action: '', status: '', entityType: '' });
    // fetchLogs will be called manually or we can call it here
    setTimeout(() => {
      fetchLogs(); // In a real app we'd manage state better or use a ref, but simple is ok here.
    }, 0);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return 'primary';
      case 'LOGOUT':
        return 'default';
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'warning';
      case 'DELETE':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Audit Logs
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              select
              fullWidth
              label="Action"
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              size="small"
            >
              <MenuItem value="">All Actions</MenuItem>
              <MenuItem value="LOGIN">LOGIN</MenuItem>
              <MenuItem value="LOGOUT">LOGOUT</MenuItem>
              <MenuItem value="CREATE">CREATE</MenuItem>
              <MenuItem value="UPDATE">UPDATE</MenuItem>
              <MenuItem value="DELETE">DELETE</MenuItem>
              <MenuItem value="READ">READ</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              select
              fullWidth
              label="Status"
              name="status"
              value={filters.status || ''}
              onChange={handleFilterChange}
              size="small"
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="SUCCESS">SUCCESS</MenuItem>
              <MenuItem value="FAILURE">FAILURE</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              label="Entity Type"
              name="entityType"
              value={filters.entityType || ''}
              onChange={handleFilterChange}
              size="small"
              placeholder="e.g. users, students"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Button variant="contained" color="primary" onClick={handleApplyFilters} sx={{ mr: 1 }}>
              Apply
            </Button>
            <Button variant="outlined" onClick={handleClearFilters}>
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Entity Type</TableCell>
                <TableCell>User</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No audit logs found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell>
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.action}
                        color={getActionColor(log.action) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{log.entityType || '-'}</TableCell>
                    <TableCell>
                      {log.performedBy
                        ? `${log.performedBy.firstName} ${log.performedBy.lastName}`
                        : 'System/Unknown'}
                    </TableCell>
                    <TableCell>{log.ipAddress || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={log.status}
                        color={log.status === 'SUCCESS' ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Box>
  );
};

export default AuditLogsPage;
