
export interface DietPlan {
  id: number;
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
