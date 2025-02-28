
import axios from '../lib/axios';
import { ClientProfile, CreateProfileData, UpdateProfileData } from '../types/profile';

const profileService = {
  // Get client profile
  getClientProfile: async (userId: number): Promise<ClientProfile | null> => {
    try {
      const response = await axios.get(`/users/${userId}/profile`);
      return response.data;
    } catch (error: any) {
      // If profile not found (404), return null instead of throwing
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Create or update client profile
  createOrUpdateClientProfile: async (
    userId: number,
    data: CreateProfileData
  ): Promise<ClientProfile> => {
    const response = await axios.post(`/users/${userId}/profile`, data);
    return response.data;
  },

  // Update client profile
  updateClientProfile: async (
    userId: number,
    data: UpdateProfileData
  ): Promise<ClientProfile> => {
    const response = await axios.put(`/users/${userId}/profile`, data);
    return response.data;
  },
};

export default profileService;
