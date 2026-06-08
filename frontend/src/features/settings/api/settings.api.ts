import api from '../../../api/api';

export const settingsApi = {
  getSettings: async () => {
    const response = await api.get('/schools/settings');
    return response.data;
  },
  updateSettings: async (data: any) => {
    const response = await api.patch('/schools/settings', data);
    return response.data;
  },
};
