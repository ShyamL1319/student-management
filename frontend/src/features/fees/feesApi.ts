const API_BASE_URL = import.meta.env.VITE_API_URL;
export async function createFeeStructure(data: any) {
  const response = await fetch(`${API_BASE_URL}/fee-structures`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function fetchFeeStructures(classId?: string, academicYearId?: string) {
  let url = `${API_BASE_URL}/fee-structures`;
  if (classId) {
    url = `${API_BASE_URL}/fee-structures/class/${classId}`;
  }
  const response = await fetch(url, {
    method: 'GET',
  });
  return response.json();
}

export async function updateFeeStructure(id: string, data: any) {
  const response = await fetch(`${API_BASE_URL}/fee-structures/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deactivateFeeStructure(id: string) {
  const response = await fetch(`${API_BASE_URL}/fee-structures/${id}/deactivate`, {
    method: 'PUT',
  });
  return response.json();
}

export async function deleteFeeStructure(id: string) {
  const response = await fetch(`${API_BASE_URL}/fee-structures/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}

// Fee Collection APIs
export async function createFeeCollection(data: any) {
  const response = await fetch(`${API_BASE_URL}/fee-collections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function fetchFeeCollections(studentId?: string, classId?: string, status?: string) {
  let url = `${API_BASE_URL}/fee-collections`;
  if (studentId) {
    url = `${API_BASE_URL}/fee-collections/student/${studentId}`;
  } else if (classId) {
    url = `${API_BASE_URL}/fee-collections/class/${classId}`;
  }
  const response = await fetch(url, {
    method: 'GET',
  });
  return response.json();
}

export async function fetchPendingFees(studentId: string) {
  const response = await fetch(`${API_BASE_URL}/fee-collections/student/${studentId}/pending`, {
    method: 'GET',
  });
  return response.json();
}

export async function fetchOutstandingAmount(studentId: string) {
  const response = await fetch(`${API_BASE_URL}/fee-collections/student/${studentId}/outstanding`, {
    method: 'GET',
  });
  return response.json();
}

export async function recordPayment(
  feeCollectionId: string,
  amountPaid: number,
  paymentMethod: string,
) {
  const response = await fetch(`${API_BASE_URL}/fee-collections/${feeCollectionId}/payment`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amountPaid, paymentMethod }),
  });
  return response.json();
}

export async function updateFeeCollection(id: string, data: any) {
  const response = await fetch(`${API_BASE_URL}/fee-collections/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteFeeCollection(id: string) {
  const response = await fetch(`${API_BASE_URL}/fee-collections/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}

// Receipt APIs
export async function createReceipt(data: any) {
  const response = await fetch(`${API_BASE_URL}/receipts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function fetchReceipts(studentId?: string) {
  let url = `${API_BASE_URL}/receipts`;
  if (studentId) {
    url = `${API_BASE_URL}/receipts/student/${studentId}`;
  }
  const response = await fetch(url, {
    method: 'GET',
  });
  return response.json();
}

export async function fetchReceiptByNumber(receiptNumber: string) {
  const response = await fetch(`${API_BASE_URL}/receipts/number/${receiptNumber}`, {
    method: 'GET',
  });
  return response.json();
}

export async function cancelReceipt(id: string) {
  const response = await fetch(`${API_BASE_URL}/receipts/${id}/cancel`, {
    method: 'PUT',
  });
  return response.json();
}

export async function deleteReceipt(id: string) {
  const response = await fetch(`${API_BASE_URL}/receipts/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}

// Invoice APIs
export async function createInvoice(data: any) {
  const response = await fetch(`${API_BASE_URL}/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function fetchInvoices(studentId?: string, classId?: string) {
  let url = `${API_BASE_URL}/invoices`;
  if (studentId) {
    url = `${API_BASE_URL}/invoices/student/${studentId}`;
  } else if (classId) {
    url = `${API_BASE_URL}/invoices/class/${classId}`;
  }
  const response = await fetch(url, {
    method: 'GET',
  });
  return response.json();
}

export async function fetchOverdueInvoices() {
  const response = await fetch(`${API_BASE_URL}/invoices/overdue`, {
    method: 'GET',
  });
  return response.json();
}

export async function recordInvoicePayment(invoiceId: string, amountPaid: number) {
  const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/payment`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amountPaid }),
  });
  return response.json();
}

export async function updateInvoice(id: string, data: any) {
  const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function cancelInvoice(id: string) {
  const response = await fetch(`${API_BASE_URL}/invoices/${id}/cancel`, {
    method: 'PUT',
  });
  return response.json();
}

export async function deleteInvoice(id: string) {
  const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}

// Report APIs
export async function fetchCollectionReport(classId?: string, academicYearId?: string) {
  let url = `${API_BASE_URL}/fees/reports/collection`;
  const params = [];
  if (classId) params.push(`classId=${classId}`);
  if (academicYearId) params.push(`academicYearId=${academicYearId}`);
  if (params.length > 0) url += '?' + params.join('&');

  const response = await fetch(url, { method: 'GET' });
  return response.json();
}

export async function fetchOutstandingFeesReport(academicYearId?: string) {
  let url = `${API_BASE_URL}/fees/reports/outstanding`;
  if (academicYearId) url += `?academicYearId=${academicYearId}`;

  const response = await fetch(url, { method: 'GET' });
  return response.json();
}

export async function fetchReceiptReport(startDate?: Date, endDate?: Date) {
  let url = `${API_BASE_URL}/fees/reports/receipts`;
  const params = [];
  if (startDate) params.push(`startDate=${startDate.toISOString()}`);
  if (endDate) params.push(`endDate=${endDate.toISOString()}`);
  if (params.length > 0) url += '?' + params.join('&');

  const response = await fetch(url, { method: 'GET' });
  return response.json();
}

export async function fetchInvoiceReport(classId?: string, academicYearId?: string) {
  let url = `${API_BASE_URL}/fees/reports/invoices`;
  const params = [];
  if (classId) params.push(`classId=${classId}`);
  if (academicYearId) params.push(`academicYearId=${academicYearId}`);
  if (params.length > 0) url += '?' + params.join('&');

  const response = await fetch(url, { method: 'GET' });
  return response.json();
}

export async function fetchMonthlyReport(academicYearId?: string) {
  let url = `${API_BASE_URL}/fees/reports/monthly`;
  if (academicYearId) url += `?academicYearId=${academicYearId}`;

  const response = await fetch(url, { method: 'GET' });
  return response.json();
}
