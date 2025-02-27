
export interface Gym {
  id: number;
  name: string;
  address: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGymData {
  name: string;
  address: string;
  phone: string;
}

export interface UpdateGymData {
  name?: string;
  address?: string;
  phone?: string;
}

export interface GymUser {
  id: number;
  user_id: number;
  gym_id: number;
  role: GymUserRole;
  status: GymUserStatus;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
}

export type GymUserRole = 'gym_admin' | 'trainer' | 'dietitian' | 'client';
export type GymUserStatus = 'active' | 'inactive';

export interface AddGymUserData {
  user_id: number;
  role: GymUserRole;
  status: GymUserStatus;
}
