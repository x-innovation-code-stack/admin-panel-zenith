
import axios from '../lib/axios';
import { User, UserFormData, UserFilters } from '../types/user';

export const getUsers = async (filters: UserFilters = {}) => {
  const response = await axios.get<User[]>('/users', { params: filters });
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
