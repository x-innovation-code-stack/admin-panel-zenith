
import axios from '../lib/axios';
import { ClientProfile, CreateProfileData, UpdateProfileData } from '../types/profile';

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

const profileService = {
  getUserProfile: async (userId: number): Promise<UserProfile> => {
    const response = await axios.get<UserProfile>(`/users/${userId}/profile`);
    return response.data;
  },

  updateUserProfile: async (userId: number, data: UserProfileFormData): Promise<UserProfile> => {
    const response = await axios.put<UserProfile>(`/users/${userId}/profile`, data);
    return response.data;
  },

  getClientProfile: async (userId: number): Promise<ClientProfile> => {
    const response = await axios.get<ClientProfile>(`/users/${userId}/client-profile`);
    return response.data;
  },

  createOrUpdateClientProfile: async (userId: number, data: CreateProfileData): Promise<ClientProfile> => {
    const response = await axios.post<ClientProfile>(`/users/${userId}/client-profile`, data);
    return response.data;
  },

  updateClientProfile: async (userId: number, data: UpdateProfileData): Promise<ClientProfile> => {
    const response = await axios.put<ClientProfile>(`/users/${userId}/client-profile`, data);
    return response.data;
  }
};

export default profileService;
