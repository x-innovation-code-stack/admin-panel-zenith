
export interface DietPlan {
  id: number;
  client_id: number;
  client?: {
    id: number;
    name: string;
    email: string;
    status: string;
  };
  created_by?: number;
  creator?: {
    id: number;
    name: string;
    email: string;
    status: string;
  };
  title: string;
  description: string;
  daily_calories: number;
  protein_grams: number;
  carbs_grams: number;
  fats_grams: number;
  macro_percentages?: {
    protein: number;
    carbs: number;
    fats: number;
  };
  status: 'active' | 'inactive' | 'completed';
  start_date: string;
  end_date: string;
  meal_plans?: MealPlan[];
  created_at?: string;
  updated_at?: string;
}

export interface DietPlanFormData {
  client_id: number;
  title: string;
  description: string;
  daily_calories: number;
  protein_grams: number;
  carbs_grams: number;
  fats_grams: number;
  status: 'active' | 'inactive' | 'completed';
  start_date: string;
  end_date: string;
}

export interface DietPlanFilters {
  client_id?: number;
  status?: 'active' | 'inactive' | 'completed';
}

export interface DietPlanDuplicateData {
  new_title: string;
  client_id: number;
  start_date: string;
  end_date: string;
}

export interface MealPlan {
  id: number;
  diet_plan_id: number;
  day_of_week: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  meals: Meal[];
  created_at?: string;
  updated_at?: string;
}

export interface Meal {
  id: number;
  meal_plan_id: number;
  meal_type: string;
  meal_type_display: string;
  title: string;
  description: string;
  calories: number;
  protein_grams: number;
  carbs_grams: number;
  fats_grams: number;
  time_of_day: string;
  recipes?: Recipe[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface Recipe {
  name: string;
  ingredients: string[];
  instructions: string;
}
