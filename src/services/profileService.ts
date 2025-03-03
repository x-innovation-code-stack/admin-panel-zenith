
import axios from '../lib/axios';

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

export const getUserProfile = async (userId: number) => {
  const response = await axios.get<UserProfile>(`/users/${userId}/profile`);
  return response.data;
};

export const updateUserProfile = async (userId: number, data: UserProfileFormData) => {
  const response = await axios.put<UserProfile>(`/users/${userId}/profile`, data);
  return response.data;
};
