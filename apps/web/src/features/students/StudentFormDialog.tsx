import { FormEvent, useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
} from '@mui/material';
import { Student, StudentFormValues } from './types';

const emptyForm: StudentFormValues = {
  name: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: 'male',
  address: '',
  grade: '',
  section: '',
  enrollmentDate: '',
  guardian: {
    name: '',
    phone: '',
    relationship: '',
  },
  status: 'active',
};

interface StudentFormDialogProps {
  open: boolean;
  student: Student | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: StudentFormValues) => Promise<void>;
}

export function StudentFormDialog({
  open,
  student,
  isSubmitting,
  onClose,
  onSubmit,
}: StudentFormDialogProps) {
  const [values, setValues] = useState<StudentFormValues>(emptyForm);

  useEffect(() => {
    setValues(
      student
        ? {
            ...student,
            dateOfBirth: student.dateOfBirth.slice(0, 10),
            enrollmentDate: student.enrollmentDate.slice(0, 10),
          }
        : emptyForm,
    );
  }, [student, open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(values);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{student ? 'Edit student' : 'Add student'}</DialogTitle>
      <DialogContent>
        <Grid component="form" container spacing={2} sx={{ mt: 0 }} id="student-form" onSubmit={handleSubmit}>
          <Grid item xs={12} md={6}>
            <TextField label="Name" required fullWidth value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="Email" type="email" required fullWidth value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Phone" required fullWidth value={values.phone} onChange={(event) => setValues({ ...values, phone: event.target.value })} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Date of birth" type="date" required fullWidth InputLabelProps={{ shrink: true }} value={values.dateOfBirth} onChange={(event) => setValues({ ...values, dateOfBirth: event.target.value })} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Gender" select required fullWidth value={values.gender} onChange={(event) => setValues({ ...values, gender: event.target.value as StudentFormValues['gender'] })}>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField label="Address" required fullWidth value={values.address} onChange={(event) => setValues({ ...values, address: event.target.value })} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Grade" required fullWidth value={values.grade} onChange={(event) => setValues({ ...values, grade: event.target.value })} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Section" required fullWidth value={values.section} onChange={(event) => setValues({ ...values, section: event.target.value })} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Enrollment date" type="date" required fullWidth InputLabelProps={{ shrink: true }} value={values.enrollmentDate} onChange={(event) => setValues({ ...values, enrollmentDate: event.target.value })} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Guardian name" required fullWidth value={values.guardian.name} onChange={(event) => setValues({ ...values, guardian: { ...values.guardian, name: event.target.value } })} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Guardian phone" required fullWidth value={values.guardian.phone} onChange={(event) => setValues({ ...values, guardian: { ...values.guardian, phone: event.target.value } })} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Relationship" required fullWidth value={values.guardian.relationship} onChange={(event) => setValues({ ...values, guardian: { ...values.guardian, relationship: event.target.value } })} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Status" select required fullWidth value={values.status} onChange={(event) => setValues({ ...values, status: event.target.value as StudentFormValues['status'] })}>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="graduated">Graduated</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="student-form" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
