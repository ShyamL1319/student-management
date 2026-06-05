import api from '../../api/api';

export interface Permission {
  _id: string;
  name: string;
  description?: string;
}

export interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

export const roleApi = {
  getRoles: async (): Promise<Role[]> => {
    const response = await api.get('/roles');
    return response.data;
  },

  getRole: async (id: string): Promise<Role> => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  createRole: async (data: Partial<Role>): Promise<Role> => {
    const response = await api.post('/roles', data);
    return response.data;
  },

  updateRole: async (id: string, data: Partial<Role>): Promise<Role> => {
    const response = await api.patch(`/roles/${id}`, data);
    return response.data;
  },

  deleteRole: async (id: string): Promise<void> => {
    await api.delete(`/roles/${id}`);
  },
};
