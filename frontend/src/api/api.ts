import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.psei.school.com:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Inject browser hostname as X-Tenant-ID header dynamically
  if (config.headers) {
    config.headers['X-Tenant-ID'] = window.location.hostname;
  }

  return config;
});

export default api;
