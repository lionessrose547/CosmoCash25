
export interface Roommate {
  id: string;
  name: string;
  avatarUrl: string;
}

export enum ExpenseTag {
  Personal = 'Personal',
  Shared = 'Shared',
}

export interface Contribution {
  roommateId: string;
  amount: number;
  paid: boolean;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  tag: ExpenseTag;
  dueDate: string;
  isRecurring: boolean;
  contributions: Contribution[];
}

export interface WishlistItem {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  contributors: { roommateId: string; amount: number }[];
}

export interface ChatMessage {
    id: string;
    roommateId: string;
    message: string;
    timestamp: string;
}

export type View = 'dashboard' | 'expenses' | 'wishlist' | 'insights' | 'roommates';
