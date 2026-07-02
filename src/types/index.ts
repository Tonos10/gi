export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  icon?: string;
  photoUri?: string | null;
  hasTargetDate?: boolean;
  targetDate?: string;
  hasReminder?: boolean;
  reminderDays?: number[];
  createdAt?: string;
}

export type TransactionType = 'deposit' | 'withdrawal';

export interface Transaction {
  id: string;
  goalId: string;
  amount: number;
  type: TransactionType;
  note?: string;
  date: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  currencySymbol: string;
  reminderTime: string;
}
