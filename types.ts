
export type TransactionType = 'income' | 'expense';

export type Category = 
  // Expense Categories
  | 'Food' 
  | 'Transport' 
  | 'Shopping' 
  | 'Bills' 
  | 'Entertainment' 
  | 'Health' 
  | 'Education'
  | 'Others'
  // Income Categories
  | 'Salary'
  | 'Freelance'
  | 'Investments'
  | 'Gift'
  | 'Other Income';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  title: string;
  date: string; // ISO string
  notes?: string;
}

export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

export interface BudgetConfig {
  amount: number;
  period: BudgetPeriod;
  categoryLimits: Record<string, number>;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string; // The emoji char
  joinedDate: string;
  points: number;
  badges: string[];
  currency: string; // e.g. 'USD', 'EUR', 'INR'
  budget: BudgetConfig;
  
  // Gamification
  currentStreak: number;
  longestStreak: number;
  lastTransactionDate: string | null; // ISO string
  
  // UI State
  hasCompletedTour: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (transactions: Transaction[], user: UserProfile) => boolean;
}

export interface AvatarItem {
  id: string;
  emoji: string;
  name: string;
  isDefault?: boolean;
  unlockCondition?: {
    type: 'points' | 'badge';
    value: number | string; // Points amount or Badge ID
  };
}

export enum View {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  ANALYTICS = 'ANALYTICS',
  PROFILE = 'PROFILE',
}

export interface ReceiptData {
  amount?: number;
  date?: string;
  title?: string;
  category?: Category;
}
