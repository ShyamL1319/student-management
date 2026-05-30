export type StudentGender = 'female' | 'male' | 'other';
export type StudentStatus = 'active' | 'inactive' | 'graduated';

export interface GuardianInfo {
  name: string;
  phone: string;
  relationship: string;
}

export interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: StudentGender;
  address: string;
  grade: string;
  section: string;
  enrollmentDate: string;
  guardian: GuardianInfo;
  status: StudentStatus;
}

export type StudentFormValues = Omit<Student, '_id'>;

export interface PaginatedStudents {
  items: Student[];
  total: number;
  page: number;
  limit: number;
}
