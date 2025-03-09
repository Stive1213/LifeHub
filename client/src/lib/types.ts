// Widget types

export interface WidgetData {
  id: number;
  userId: number;
  type: WidgetType;
  position: number;
  config?: Record<string, any>;
}

export type WidgetType = 
  | 'tasks'
  | 'calendar'
  | 'budget'
  | 'habits'
  | 'journal'
  | 'quickTools'
  | 'contacts'
  | 'documents'
  | 'community';

export interface Task {
  id: number;
  userId: number;
  title: string;
  description?: string;
  dueDate?: Date;
  completed: boolean;
  category?: string;
  priority?: string;
}

export interface Event {
  id: number;
  userId: number;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  color?: string;
}

export interface Transaction {
  id: number;
  userId: number;
  amount: number; // In cents
  description: string;
  category?: string;
  date: Date;
  isIncome: boolean;
}

export interface Habit {
  id: number;
  userId: number;
  name: string;
  description?: string;
  frequency?: string[];
  streak: number;
  completions?: HabitCompletion[];
}

export interface HabitCompletion {
  id: number;
  habitId: number;
  date: Date;
}

export interface Contact {
  id: number;
  userId: number;
  name: string;
  email?: string;
  phone?: string;
  birthday?: Date;
  notes?: string;
  category?: string;
}

export interface Document {
  id: number;
  userId: number;
  name: string;
  path: string;
  type?: string;
  tags?: string[];
  uploadDate: Date;
}

export interface JournalEntry {
  id: number;
  userId: number;
  content: string;
  mood?: string;
  date: Date;
}

export interface CommunityTip {
  id: number;
  userId: number;
  title: string;
  content: string;
  category: string;
  votes: number;
  date: Date;
}

export interface UserProfile {
  id: number;
  username: string;
  displayName?: string;
  email?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: string;
  widgets?: WidgetType[];
  dashboardLayout?: number[];
}
