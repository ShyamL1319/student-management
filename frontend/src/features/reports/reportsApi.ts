import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const reportsApi = {
  exportReport: async (type: string, format: 'pdf' | 'excel', filters: any = {}) => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({ type, format, ...filters });
    
    const response = await axios.get(`${API_URL}/reports/export?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
