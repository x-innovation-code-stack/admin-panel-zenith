
export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
export type DietType = 'standard' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo' | 'mediterranean';
export type StressSleep = 'low_good' | 'moderate_ok' | 'high_enough' | 'low_poor' | 'high_poor';
export type MealTiming = 'traditional_meals' | 'small_frequent' | 'intermittent_16_8' | 'intermittent_18_6' | 'omad' | 'flexible_pattern';
export type ExerciseRoutine = 'strength' | 'cardio' | 'mix_exercise' | 'yoga' | 'sport' | 'minimal_ex';
export type BodyType = 'ectomorph' | 'mesomorph' | 'endomorph' | 'combination' | 'not_sure';
export type WaterIntake = 'water_lt1' | 'water_1to2' | 'water_2to3' | 'water_gt3' | 'water_unknown';
export type WeightGoal = 'rapid_loss' | 'moderate_loss' | 'slow_loss' | 'maintain' | 'slight_gain' | 'moderate_gain' | 'significant_gain';

export interface ClientProfile {
  id: number;
  user_id: number;
  age: number;
  gender: Gender;
  height: number; // in cm
  current_weight: number; // in kg
  target_weight: number; // in kg
  country: string;
  state: string;
  city: string;
  activity_level: ActivityLevel;
  diet_type: DietType;
  health_conditions: string[];
  health_details?: string | null;
  allergies: string[];
  recovery_needs: string[];
  organ_recovery_details?: string | null;
  medications?: string[] | null;
  medication_details?: string | null;
  meal_preferences: string[];
  cuisine_preferences?: string[] | null;
  food_restrictions?: string[] | null;
  meal_timing?: MealTiming;
  meal_variety?: string | null;
  daily_schedule?: string | null;
  cooking_capability?: string | null;
  exercise_routine?: ExerciseRoutine;
  stress_sleep?: StressSleep;
  goal_timeline?: string | null;
  commitment_level?: string | null;
  additional_requests?: string | null;
  measurement_preference?: string | null;
  weight_goal_type?: string;
  weight_difference?: number;
  activity_level_display?: string;
  diet_type_display?: string;
  meal_timing_display?: string;
  stress_sleep_display?: string;
  primary_goal_display?: string;
  plan_type_display?: string;
  weight_goal?: WeightGoal;
  body_type?: BodyType;
  water_intake?: WaterIntake;
  plan_type?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProfileData {
  age: number;
  gender: Gender;
  height: number;
  current_weight: number;
  target_weight: number;
  country: string;
  state: string;
  city: string;
  activity_level: ActivityLevel;
  diet_type: DietType;
  health_conditions: string[];
  allergies: string[];
  recovery_needs: string[];
  meal_preferences: string[];
  stress_sleep?: StressSleep;
  meal_timing?: MealTiming;
  exercise_routine?: ExerciseRoutine;
  body_type?: BodyType;
  water_intake?: WaterIntake;
  weight_goal?: WeightGoal;
  plan_type?: string;  // Made optional to match with the ClientProfileForm
}

export interface UpdateProfileData {
  age?: number;
  gender?: Gender;
  height?: number;
  current_weight?: number;
  target_weight?: number;
  country?: string;
  state?: string;
  city?: string;
  activity_level?: ActivityLevel;
  diet_type?: DietType;
  health_conditions?: string[];
  allergies?: string[];
  recovery_needs?: string[];
  meal_preferences?: string[];
  stress_sleep?: StressSleep;
  meal_timing?: MealTiming;
  exercise_routine?: ExerciseRoutine;
  body_type?: BodyType;
  water_intake?: WaterIntake;
  weight_goal?: WeightGoal;
  plan_type?: string;
}
