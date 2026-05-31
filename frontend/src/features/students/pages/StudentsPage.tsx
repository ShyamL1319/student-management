import type { FC } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';

const dummyStudents = [
  { id: 'S001', name: 'John Doe', grade: '10th', email: 'john.doe@example.com', status: 'Active' },
  { id: 'S002', name: 'Jane Smith', grade: '9th', email: 'jane.smith@example.com', status: 'Active' },
  { id: 'S003', name: 'Michael Johnson', grade: '11th', email: 'michael.j@example.com', status: 'Inactive' },
  { id: 'S004', name: 'Emily Davis', grade: '10th', email: 'emily.d@example.com', status: 'Active' },
  { id: 'S005', name: 'William Brown', grade: '12th', email: 'will.b@example.com', status: 'Active' },
];

export const StudentsPage: FC = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Students</Typography>
        <Button variant="contained" color="primary">Add Student</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="students table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dummyStudents.map((student) => (
              <TableRow key={student.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">{student.id}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.grade}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.status}</TableCell>
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

