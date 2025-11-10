import { api } from '@/shared/api';
import type {
  CreateGoalRequest,
  GoalResponse,
  GoalsResponse,
  UpdateGoalRequest,
} from './goals.types';

export const goalsApi = {
  create: async (data: CreateGoalRequest): Promise<GoalResponse> => {
    const response = await api.post<GoalResponse>('/goals', data);
    return response.data;
  },

  getAll: async (activeOnly?: boolean): Promise<GoalsResponse> => {
    const url = activeOnly ? `/goals?activeOnly=${activeOnly}` : '/goals';
    const response = await api.get<GoalsResponse>(url);
    return response.data;
  },

  getById: async (id: number): Promise<GoalResponse> => {
    const response = await api.get<GoalResponse>(`/goals/${id}`);
    return response.data;
  },

  update: async (
    id: number,
    data: UpdateGoalRequest,
  ): Promise<GoalResponse> => {
    const response = await api.put<GoalResponse>(`/goals/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/goals/${id}`);
  },
};
