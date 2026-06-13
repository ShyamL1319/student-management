import api from '../../api/api';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string | { _id: string; name: string };
  roles?: (string | { _id: string; name: string })[];
  phone?: string;
  address?: string;
  avatar?: string;
  createdAt: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

export const usersApi = {
  getUsers: async (params?: { page?: number; limit?: number; search?: string }): Promise<any> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileDto): Promise<User> => {
    const response = await api.patch('/users/profile', data);
    return response.data;
  },

  updateUserRole: async (userId: string, roleId: string): Promise<User> => {
    const response = await api.patch(`/users/${userId}/role`, { roleId });
    return response.data;
  },

  addUserRole: async (userId: string, roleId: string): Promise<User> => {
    const response = await api.post(`/users/${userId}/roles`, { roleId });
    return response.data;
  },

  removeUserRole: async (userId: string, roleId: string): Promise<User> => {
    const response = await api.delete(`/users/${userId}/roles/${roleId}`);
    return response.data;
  },

  replaceUserRoles: async (userId: string, roleIds: string[]): Promise<User> => {
    const response = await api.put(`/users/${userId}/roles`, { roleIds });
    return response.data;
  },
};
