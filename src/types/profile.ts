
export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
export type DietType = 'standard' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo' | 'mediterranean';

export interface ClientProfile {
  id: number;
  user_id: number;
  age: number;
  gender: Gender;
  height: number; // in cm
  current_weight: number; // in kg
  target_weight: number; // in kg
  activity_level: ActivityLevel;
  diet_type: DietType;
  health_conditions: string[];
  allergies: string[];
  recovery_needs: string[];
  meal_preferences: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateProfileData {
  age: number;
  gender: Gender;
  height: number;
  current_weight: number;
  target_weight: number;
  activity_level: ActivityLevel;
  diet_type: DietType;
  health_conditions: string[];
  allergies: string[];
  recovery_needs: string[];
  meal_preferences: string[];
}

export interface UpdateProfileData {
  age?: number;
  gender?: Gender;
  height?: number;
  current_weight?: number;
  target_weight?: number;
  activity_level?: ActivityLevel;
  diet_type?: DietType;
  health_conditions?: string[];
  allergies?: string[];
  recovery_needs?: string[];
  meal_preferences?: string[];
}
