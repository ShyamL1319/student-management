import api from '../../api/api';

export const reportsApi = {
  exportReport: async (type: string, format: 'pdf' | 'excel', filters: any = {}) => {
    const params = new URLSearchParams({ type, format, ...filters });
    
    const response = await api.get(`/reports/export?${params.toString()}`, {
      responseType: 'blob',
    });

    // Create a link to download the file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const extension = format === 'excel' ? 'xlsx' : 'pdf';
    link.setAttribute('download', `${type}_report_${Date.now()}.${extension}`);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
