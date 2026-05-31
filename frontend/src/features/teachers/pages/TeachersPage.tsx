import type { FC } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';

const dummyTeachers = [
  { id: 'T001', name: 'Alice Williams', subject: 'Mathematics', email: 'alice.w@example.com', phone: '555-0101' },
  { id: 'T002', name: 'Robert Taylor', subject: 'Science', email: 'robert.t@example.com', phone: '555-0102' },
  { id: 'T003', name: 'Mary Clark', subject: 'History', email: 'mary.c@example.com', phone: '555-0103' },
  { id: 'T004', name: 'James Lewis', subject: 'English', email: 'james.l@example.com', phone: '555-0104' },
];

export const TeachersPage: FC = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Teachers</Typography>
        <Button variant="contained" color="secondary">Add Teacher</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="teachers table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dummyTeachers.map((teacher) => (
              <TableRow key={teacher.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">{teacher.id}</TableCell>
                <TableCell>{teacher.name}</TableCell>
                <TableCell>{teacher.subject}</TableCell>
                <TableCell>{teacher.email}</TableCell>
                <TableCell>{teacher.phone}</TableCell>
                <TableCell align="right">
                  <Button size="small" variant="outlined" sx={{ mr: 1 }}>Edit</Button>
                  <Button size="small" color="error">Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

