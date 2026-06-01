import React, { useState } from 'react';
import { createMark, fetchStudentResult } from './marksApi';

export default function MarksPage() {
  const [studentId, setStudentId] = useState('');
  const [result, setResult] = useState<any>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createMark({ studentId, subjectId: 'sub1', examId: 'ex1', marksObtained: 80, maxMarks: 100 });
    const r = await fetchStudentResult(studentId);
    setResult(r);
  }

  return (
    <div>
      <h2>Marks Entry</h2>
      <form onSubmit={onSubmit}>
        <input placeholder="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
        <button type="submit">Add & Fetch Result</button>
      </form>
      {result && (
        <div>
          <h3>Result</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
