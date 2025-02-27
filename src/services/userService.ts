
import axios from '../lib/axios';
import { User } from '../types/auth';

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
}

export interface UserListResponse {
  data: User[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}

export interface CreateUserData {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  whatsapp_phone?: string;
  status: 'active' | 'inactive' | 'pending';
  role: string;
}

export interface UpdateUserData extends Omit<CreateUserData, 'email' | 'password'> {
  email?: string;
  password?: string;
}

const userService = {
  getUsers: async (filters: UserFilters = {}): Promise<UserListResponse> => {
    const response = await axios.get('/users', { params: filters });
    return response.data;
  },

  getUser: async (id: number): Promise<User> => {
    const response = await axios.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (data: CreateUserData): Promise<User> => {
    const response = await axios.post('/users', data);
    return response.data;
  },

  updateUser: async (id: number, data: UpdateUserData): Promise<User> => {
    const response = await axios.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await axios.delete(`/users/${id}`);
  },

  getRoles: async (): Promise<string[]> => {
    const response = await axios.get('/roles');
    return response.data;
  }
};

export default userService;
