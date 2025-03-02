
import axios from '../lib/axios';
import { DietPlan, DietPlanFormData, DietPlanFilters, DietPlanDuplicateData } from '../types/dietPlan';

export const getDietPlans = async (filters: DietPlanFilters = {}) => {
  const response = await axios.get<DietPlan[]>('/diet-plans', { params: filters });
  return response.data;
};

export const getDietPlanById = async (id: number) => {
  const response = await axios.get<DietPlan>(`/diet-plans/${id}`);
  return response.data;
};

export const createDietPlan = async (data: DietPlanFormData) => {
  const response = await axios.post<DietPlan>('/diet-plans', data);
  return response.data;
};

export const updateDietPlan = async (id: number, data: Partial<DietPlanFormData>) => {
  const response = await axios.put<DietPlan>(`/diet-plans/${id}`, data);
  return response.data;
};

export const deleteDietPlan = async (id: number) => {
  const response = await axios.delete<{ success: boolean }>(`/diet-plans/${id}`);
  return response.data;
};

export const getDietPlanMealPlans = async (dietPlanId: number) => {
  const response = await axios.get(`/diet-plans/${dietPlanId}/meal-plans`);
  return response.data;
};

export const duplicateDietPlan = async (id: number, data: DietPlanDuplicateData) => {
  const response = await axios.post<DietPlan>(`/diet-plans/${id}/duplicate`, data);
  return response.data;
};
