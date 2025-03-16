
import axios from '../lib/axios';
import { ClientProfile, CreateProfileData, UpdateProfileData } from '@/types/profile';

export const getUserProfile = async (userId: number) => {
  const response = await axios.get<UserProfile>(`/users/${userId}/profile`);
  return response.data;
};

export const updateUserProfile = async (userId: number, data: UserProfileFormData) => {
  const response = await axios.put<UserProfile>(`/users/${userId}/profile`, data);
  return response.data;
};

export const getClientProfile = async (userId: number) => {
  const response = await axios.get<ClientProfile>(`/users/${userId}/client-profile`);
  return response.data;
};

export const createOrUpdateClientProfile = async (userId: number, data: CreateProfileData) => {
  const response = await axios.post<ClientProfile>(`/users/${userId}/client-profile`, data);
  return response.data;
};

export const updateClientProfile = async (userId: number, data: UpdateProfileData) => {
  const response = await axios.put<ClientProfile>(`/users/${userId}/client-profile`, data);
  return response.data;
};

export interface UserProfile {
  id: number;
  user_id: number;
  bio?: string;
  height?: number;
  weight?: number;
  birth_date?: string;
  goals?: string[];
  allergies?: string[];
  medications?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface UserProfileFormData {
  bio?: string;
  height?: number;
  weight?: number;
  birth_date?: string;
  goals?: string[];
  allergies?: string[];
  medications?: string[];
}
