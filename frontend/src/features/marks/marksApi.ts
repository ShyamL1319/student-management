import api from '../../api/api';

export async function createMark(payload: any) {
  const res = await api.post('/marks', payload);
  return res.data;
}

export async function fetchMarks(query = '') {
  const res = await api.get(`/marks${query}`);
  return res.data;
}

export async function fetchStudentResult(studentId: string) {
  const res = await api.get(`/marks/student/${studentId}/result`);
  return res.data;
}

export async function fetchExamRank(examId: string) {
  const res = await api.get(`/marks/exam/${examId}/rank`);
  return res.data;
}

