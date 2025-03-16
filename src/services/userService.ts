
import axios from '../lib/axios';
import { User } from '../types/auth';

export interface UserFilters {
  role?: string[];
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
  roles?: string[]; // Changed from role to roles
}

export interface UpdateUserData extends Omit<CreateUserData, 'email' | 'password'> {
  email?: string;
  password?: string;
}

const cleanFilters = (filters: UserFilters) => {
  return Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== "")
  );
};

const userService = {
  getUsers: async (filters: UserFilters = {}): Promise<UserListResponse> => {
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== "" && v !== undefined)
    );

    console.log("Cleaned Filters before sending request:", cleanedFilters);
    const response = await axios.get('/users', { params: cleanedFilters });
    return response.data;
  },

  getUser: async (id: number): Promise<User> => {
    const response = await axios.get(`/users/${id}`);
    return response.data.data;
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
    console.log("Roles API Response:", response.data);
    
    // Get roles array from response, or empty array if not found
    const rolesArray = Array.isArray(response.data.roles) 
      ? response.data.roles 
      : (Array.isArray(response.data) ? response.data : []);
    
    // Filter out any empty strings
    return rolesArray.filter(role => role && typeof role === 'string' && role.trim() !== '');
  }
};

export default userService;
