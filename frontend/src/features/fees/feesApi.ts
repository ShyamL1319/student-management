import api from '../../api/api';

export async function createFeeStructure(data: any) {
  const response = await api.post('/fee-structures', data);
  return response.data;
}

export async function fetchFeeStructures(classId?: string, academicYearId?: string) {
  let url = '/fee-structures';
  if (classId) {
    url = `/fee-structures/class/${classId}`;
  }
  const response = await api.get(url);
  return response.data;
}

export async function updateFeeStructure(id: string, data: any) {
  const response = await api.put(`/fee-structures/${id}`, data);
  return response.data;
}

export async function deactivateFeeStructure(id: string) {
  const response = await api.put(`/fee-structures/${id}/deactivate`);
  return response.data;
}

export async function deleteFeeStructure(id: string) {
  const response = await api.delete(`/fee-structures/${id}`);
  return response.data;
}

// Fee Collection APIs
export async function createFeeCollection(data: any) {
  const response = await api.post('/fee-collections', data);
  return response.data;
}

export async function fetchFeeCollections(studentId?: string, classId?: string, status?: string) {
  let url = '/fee-collections';
  if (studentId) {
    url = `/fee-collections/student/${studentId}`;
  } else if (classId) {
    url = `/fee-collections/class/${classId}`;
  }
  const response = await api.get(url, {
    params: status ? { status } : undefined,
  });
  return response.data;
}

export async function fetchPendingFees(studentId: string) {
  const response = await api.get(`/fee-collections/student/${studentId}/pending`);
  return response.data;
}

export async function fetchOutstandingAmount(studentId: string) {
  const response = await api.get(`/fee-collections/student/${studentId}/outstanding`);
  return response.data;
}

export async function recordPayment(
  feeCollectionId: string,
  amountPaid: number,
  paymentMethod: string,
) {
  const response = await api.put(`/fee-collections/${feeCollectionId}/payment`, {
    amountPaid,
    paymentMethod,
  });
  return response.data;
}

export async function updateFeeCollection(id: string, data: any) {
  const response = await api.put(`/fee-collections/${id}`, data);
  return response.data;
}

export async function deleteFeeCollection(id: string) {
  const response = await api.delete(`/fee-collections/${id}`);
  return response.data;
}

// Receipt APIs
export async function createReceipt(data: any) {
  const response = await api.post('/receipts', data);
  return response.data;
}

export async function fetchReceipts(studentId?: string) {
  let url = '/receipts';
  if (studentId) {
    url = `/receipts/student/${studentId}`;
  }
  const response = await api.get(url);
  return response.data;
}

export async function fetchReceiptByNumber(receiptNumber: string) {
  const response = await api.get(`/receipts/number/${receiptNumber}`);
  return response.data;
}

export async function cancelReceipt(id: string) {
  const response = await api.put(`/receipts/${id}/cancel`);
  return response.data;
}

export async function deleteReceipt(id: string) {
  const response = await api.delete(`/receipts/${id}`);
  return response.data;
}

// Invoice APIs
export async function createInvoice(data: any) {
  const response = await api.post('/invoices', data);
  return response.data;
}

export async function fetchInvoices(studentId?: string, classId?: string) {
  let url = '/invoices';
  if (studentId) {
    url = `/invoices/student/${studentId}`;
  } else if (classId) {
    url = `/invoices/class/${classId}`;
  }
  const response = await api.get(url);
  return response.data;
}

export async function fetchOverdueInvoices() {
  const response = await api.get('/invoices/overdue');
  return response.data;
}

export async function recordInvoicePayment(invoiceId: string, amountPaid: number) {
  const response = await api.put(`/invoices/${invoiceId}/payment`, { amountPaid });
  return response.data;
}

export async function updateInvoice(id: string, data: any) {
  const response = await api.put(`/invoices/${id}`, data);
  return response.data;
}

export async function cancelInvoice(id: string) {
  const response = await api.put(`/invoices/${id}/cancel`);
  return response.data;
}

export async function deleteInvoice(id: string) {
  const response = await api.delete(`/invoices/${id}`);
  return response.data;
}

// Report APIs
export async function fetchCollectionReport(classId?: string, academicYearId?: string) {
  const params: any = {};
  if (classId) params.classId = classId;
  if (academicYearId) params.academicYearId = academicYearId;

  const response = await api.get('/fees/reports/collection', { params });
  return response.data;
}

export async function fetchOutstandingFeesReport(academicYearId?: string) {
  const params: any = {};
  if (academicYearId) params.academicYearId = academicYearId;

  const response = await api.get('/fees/reports/outstanding', { params });
  return response.data;
}

export async function fetchReceiptReport(startDate?: Date, endDate?: Date) {
  const params: any = {};
  if (startDate) params.startDate = startDate.toISOString();
  if (endDate) params.endDate = endDate.toISOString();

  const response = await api.get('/fees/reports/receipts', { params });
  return response.data;
}

export async function fetchInvoiceReport(classId?: string, academicYearId?: string) {
  const params: any = {};
  if (classId) params.classId = classId;
  if (academicYearId) params.academicYearId = academicYearId;

  const response = await api.get('/fees/reports/invoices', { params });
  return response.data;
}

export async function fetchMonthlyReport(academicYearId?: string) {
  const params: any = {};
  if (academicYearId) params.academicYearId = academicYearId;

  const response = await api.get('/fees/reports/monthly', { params });
  return response.data;
}

