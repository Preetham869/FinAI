export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: number;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: number; // timestamp
  description: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  amount: number;
  month: string; // YYYY-MM
}

export interface Recommendation {
  id: string;
  title: string;
  message: string;
  reason: string;
  type: 'warning' | 'info' | 'success';
}

export interface AIInsight {
  type: 'trend' | 'prediction' | 'anomaly';
  title: string;
  description: string;
  data?: any;
}
