import type { FC } from 'react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Tabs,
  Tab,
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Pagination,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { attendanceApi } from '../../../api/attendances/attendanceAPI';

const attendeeTypes = ['STUDENT', 'TEACHER', 'STAFF'];
const attendanceStatuses = ['PRESENT', 'ABSENT', 'LEAVE'];

const today = new Date().toISOString().slice(0, 10);
const currentMonth = new Date().toISOString().slice(0, 7);

export const AttendancePage: FC = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filterDate, setFilterDate] = useState(today);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [reportDate, setReportDate] = useState(today);
  const [reportMonth, setReportMonth] = useState(currentMonth);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formValues, setFormValues] = useState({
    attendeeType: 'STUDENT',
    attendeeId: '',
    school: '',
    academicYear: '',
    class: '',
    section: '',
    date: today,
    status: 'PRESENT',
    remarks: '',
  });
  const [error, setError] = useState<string | null>(null);

  const attendanceQuery = useQuery({
    queryKey: ['attendances', page, filterDate, filterType, filterStatus],
    queryFn: () =>
      attendanceApi.getAttendances({
        page,
        limit,
        date: filterDate || undefined,
        attendeeType: filterType || undefined,
        status: filterStatus || undefined,
      }),
  });

  const dailyReportQuery = useQuery({
    queryKey: ['attendance-daily-report', reportDate],
    queryFn: () => attendanceApi.getDailyReport({ date: reportDate }),
  });

  const monthlyReportQuery = useQuery({
    queryKey: ['attendance-monthly-report', reportMonth],
    queryFn: () => {
      const [year, month] = reportMonth.split('-');
      return attendanceApi.getMonthlyReport({ year: Number(year), month: Number(month) });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => attendanceApi.createAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      setDialogOpen(false);
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to save attendance');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => attendanceApi.updateAttendance(editing._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      setDialogOpen(false);
      setEditing(null);
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to update attendance');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => attendanceApi.deleteAttendance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to delete attendance');
    },
  });

  const attendanceData = attendanceQuery.data || { data: [], total: 0 };

  const openDialog = (record?: any) => {
    if (record) {
      setEditing(record);
      setFormValues({
        attendeeType: record.attendeeType || 'STUDENT',
        attendeeId: record.attendeeId || '',
        school: record.school?._id || record.school || '',
        academicYear: record.academicYear?._id || record.academicYear || '',
        class: record.class?._id || record.class || '',
        section: record.section?._id || record.section || '',
        date: record.date?.slice(0, 10) || today,
        status: record.status || 'PRESENT',
        remarks: record.remarks || '',
      });
    } else {
      setEditing(null);
      setFormValues({
        attendeeType: 'STUDENT',
        attendeeId: '',
        school: '',
        academicYear: '',
        class: '',
        section: '',
        date: today,
        status: 'PRESENT',
        remarks: '',
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setError(null);
  };

  const handleSave = async () => {
    const payload = { ...formValues };
    if (editing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Attendance Management
      </Typography>

      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 3 }}>
        <Tab label="Records" />
        <Tab label="Reports" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="Attendance Date"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    label="Type"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">All Types</MenuItem>
                    {attendeeTypes.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    label="Status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    {attendanceStatuses.map((status) => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" onClick={() => queryClient.invalidateQueries({ queryKey: ['attendances'] })}>
                  Refresh
                </Button>
                <Button variant="contained" color="primary" onClick={() => openDialog()}>
                  Mark Attendance
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Attendee</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Section</TableCell>
                    <TableCell>Remarks</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : attendanceData.data.length ? (
                    attendanceData.data.map((record: any) => {
                      const attendeeName =
                        record.attendeeType === 'STUDENT'
                          ? record.student?.firstName
                          : record.attendeeType === 'TEACHER'
                          ? `${record.teacher?.firstName || ''} ${record.teacher?.lastName || ''}`.trim()
                          : `${record.staff?.firstName || ''} ${record.staff?.lastName || ''}`.trim();

                      return (
                        <TableRow key={record._id}>
                          <TableCell>{attendeeName || record.attendeeId}</TableCell>
                          <TableCell>{record.attendeeType}</TableCell>
                          <TableCell>{record.date?.slice(0, 10)}</TableCell>
                          <TableCell>{record.status}</TableCell>
                          <TableCell>{record.class?.name || '-'}</TableCell>
                          <TableCell>{record.section?.name || '-'}</TableCell>
                          <TableCell>{record.remarks || '-'}</TableCell>
                          <TableCell align="right">
                            <Button size="small" onClick={() => openDialog(record)} sx={{ mr: 1 }}>
                              Edit
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => deleteMutation.mutate(record._id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No attendance records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Pagination
              count={Math.ceil((attendanceData.total || 0) / limit)}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Daily Report Date"
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Monthly Report"
                type="month"
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary">
                    Daily Total
                  </Typography>
                  <Typography variant="h4">
                    {dailyReportQuery.data?.totalRecords ?? 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary">
                    Present Today
                  </Typography>
                  <Typography variant="h4">
                    {dailyReportQuery.data?.statusCounts?.PRESENT ?? 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary">
                    Absent Today
                  </Typography>
                  <Typography variant="h4">
                    {dailyReportQuery.data?.statusCounts?.ABSENT ?? 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper sx={{ mb: 3, p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Monthly Attendance Summary
            </Typography>
            {monthlyReportQuery.isLoading ? (
              <CircularProgress />
            ) : (
              <Box>
                <Typography color="textSecondary" sx={{ mb: 2 }}>
                  Records this month: {monthlyReportQuery.data?.totalRecords ?? 0}
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Present</TableCell>
                        <TableCell>Absent</TableCell>
                        <TableCell>Leave</TableCell>
                        <TableCell>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {monthlyReportQuery.data?.dailySummary?.length ? (
                        monthlyReportQuery.data.dailySummary.map((row: any) => (
                          <TableRow key={row.date}>
                            <TableCell>{row.date}</TableCell>
                            <TableCell>{row.present}</TableCell>
                            <TableCell>{row.absent}</TableCell>
                            <TableCell>{row.leave}</TableCell>
                            <TableCell>{row.total}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            No monthly attendance data found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Paper>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit Attendance' : 'Mark Attendance'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Attendee Type</InputLabel>
            <Select
              label="Attendee Type"
              value={formValues.attendeeType}
              onChange={(e) => setFormValues({ ...formValues, attendeeType: e.target.value })}
            >
              {attendeeTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Attendee ID"
            value={formValues.attendeeId}
            onChange={(e) => setFormValues({ ...formValues, attendeeId: e.target.value })}
            fullWidth
          />
          <TextField
            label="Attendance Date"
            type="date"
            value={formValues.date}
            onChange={(e) => setFormValues({ ...formValues, date: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={formValues.status}
              onChange={(e) => setFormValues({ ...formValues, status: e.target.value })}
            >
              {attendanceStatuses.map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Remarks"
            value={formValues.remarks}
            onChange={(e) => setFormValues({ ...formValues, remarks: e.target.value })}
            multiline
            rows={3}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
