
import axios from '../lib/axios';
import { Gym, CreateGymData, UpdateGymData, GymUser, AddGymUserData } from '../types/gym';

const gymService = {
  // Gym CRUD operations
  getGyms: async (): Promise<Gym[]> => {
    const response = await axios.get('/gyms');
    return response.data;
  },

  getGym: async (id: number): Promise<Gym> => {
    const response = await axios.get(`/gyms/${id}`);
    return response.data;
  },

  createGym: async (data: CreateGymData): Promise<Gym> => {
    const response = await axios.post('/gyms', data);
    return response.data;
  },

  updateGym: async (id: number, data: UpdateGymData): Promise<Gym> => {
    const response = await axios.put(`/gyms/${id}`, data);
    return response.data;
  },

  deleteGym: async (id: number): Promise<void> => {
    await axios.delete(`/gyms/${id}`);
  },

  // Gym user management
  getGymUsers: async (gymId: number, role?: string, status?: string): Promise<GymUser[]> => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (status) params.append('status', status);
    
    const response = await axios.get(`/gyms/${gymId}/users`, { params });
    return response.data;
  },

  addUserToGym: async (gymId: number, data: AddGymUserData): Promise<GymUser> => {
    const response = await axios.post(`/gyms/${gymId}/users`, data);
    return response.data;
  },

  removeUserFromGym: async (gymId: number, userId: number): Promise<void> => {
    await axios.delete(`/gyms/${gymId}/users/${userId}`);
  }
};

export default gymService;
