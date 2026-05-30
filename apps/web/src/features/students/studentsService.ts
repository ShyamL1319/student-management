import { apiRequest } from '../../services/api';
import { PaginatedStudents, Student, StudentFormValues, StudentStatus } from './types';

export interface StudentListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: StudentStatus | '';
}

export function listStudents(params: StudentListParams): Promise<PaginatedStudents> {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });

  return apiRequest<PaginatedStudents>(`/students?${query.toString()}`);
}

export function createStudent(values: StudentFormValues): Promise<Student> {
  return apiRequest<Student>('/students', {
    method: 'POST',
    body: JSON.stringify(values),
  });
}

export function updateStudent(id: string, values: StudentFormValues): Promise<Student> {
  return apiRequest<Student>(`/students/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  });
}

export function deleteStudent(id: string): Promise<{ id: string }> {
  return apiRequest<{ id: string }>(`/students/${id}`, { method: 'DELETE' });
}
