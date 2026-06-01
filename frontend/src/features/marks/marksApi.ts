const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export async function createMark(payload: any) {
  const res = await fetch(`${API_BASE}/marks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function fetchMarks(query = '') {
  const res = await fetch(`${API_BASE}/marks${query}`);
  return res.json();
}

export async function fetchStudentResult(studentId: string) {
  const res = await fetch(`${API_BASE}/marks/student/${studentId}/result`);
  return res.json();
}

export async function fetchExamRank(examId: string) {
  const res = await fetch(`${API_BASE}/marks/exam/${examId}/rank`);
  return res.json();
}
