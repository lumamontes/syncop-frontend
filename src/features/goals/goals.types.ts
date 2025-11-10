export type GoalType =
  | 'SAVINGS'
  | 'DEBT_PAYOFF'
  | 'INVESTMENT'
  | 'PURCHASE'
  | 'EMERGENCY_FUND'
  | 'OTHER';
export type ContributionFrequency =
  | 'WEEKLY'
  | 'BIWEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY';

export interface Goal {
  id: number;
  userId: number;
  goalName: string;
  goalType: GoalType;
  targetAmount: number;
  currentAmount: number;
  currencyCode: string;
  targetDate?: string;
  priority: number;
  linkedAccountId?: number;
  autoContribute: boolean;
  contributionAmount?: number;
  contributionFrequency?: ContributionFrequency;
  isAchieved: boolean;
  achievedDate?: string;
  isActive: boolean;
  notes?: string;
  progressPercentage: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGoalRequest {
  goalName: string;
  goalType: GoalType;
  targetAmount: number;
  currentAmount?: number;
  currencyCode?: string;
  targetDate?: string;
  priority?: number;
  linkedAccountId?: number;
  autoContribute?: boolean;
  contributionAmount?: number;
  contributionFrequency?: ContributionFrequency;
  notes?: string;
}

export interface UpdateGoalRequest extends Partial<CreateGoalRequest> {
  isActive?: boolean;
  isAchieved?: boolean;
}

export interface GoalResponse {
  success: boolean;
  data: Goal;
  message?: string;
}

export interface GoalsResponse {
  success: boolean;
  data: Goal[];
  message?: string;
}
