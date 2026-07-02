import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal, Transaction, UserSettings } from '../types';

interface AppState {
  goals: Goal[];
  transactions: Transaction[];
  settings: UserSettings;
  
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updatedData: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addTransaction: (transaction: Transaction) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      goals: [],
      transactions: [],
      settings: {
        theme: 'system',
        currencySymbol: '$',
        reminderTime: '9:00 a.m.',
      },

      addGoal: (goal) => set((state) => ({ 
        goals: [...state.goals, goal] 
      })),

      updateGoal: (id, updatedData) => set((state) => ({
        goals: state.goals.map((g) => g.id === id ? { ...g, ...updatedData } : g)
      })),

      deleteGoal: (id) => set((state) => ({ 
        goals: state.goals.filter((g) => g.id !== id),
        transactions: state.transactions.filter((t) => t.goalId !== id)
      })),

      addTransaction: (transaction) => set((state) => {
        const isDeposit = transaction.type === 'deposit';
        
        return {
          transactions: [...state.transactions, transaction],
          goals: state.goals.map((g) => {
            if (g.id === transaction.goalId) {
              return {
                ...g,
                savedAmount: isDeposit 
                  ? g.savedAmount + transaction.amount 
                  : g.savedAmount - transaction.amount
              };
            }
            return g;
          })
        };
      }),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
    }),
    {
      name: 'coinly-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
