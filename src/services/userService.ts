
import axios from '../lib/axios';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  whatsapp_phone?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  whatsapp_phone?: string;
  status: 'active' | 'inactive';
}

export const getUsers = async () => {
  const response = await axios.get<User[]>('/users');
  return response.data;
};

export const getUserById = async (id: number) => {
  const response = await axios.get<User>(`/users/${id}`);
  return response.data;
};

export const createUser = async (data: UserFormData) => {
  const response = await axios.post<User>('/users', data);
  return response.data;
};

export const updateUser = async (id: number, data: Partial<UserFormData>) => {
  const response = await axios.put<User>(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await axios.delete<{ success: boolean }>(`/users/${id}`);
  return response.data;
};
