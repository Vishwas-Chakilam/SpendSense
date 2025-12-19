
import { Transaction, UserProfile, Badge, Account } from '../types';
import { BADGES } from '../constants';

const KEYS = {
  TRANSACTIONS: 'spendsense_expenses', // Keeping old key for backward compatibility
  USER: 'spendsense_user',
};

export const getTransactions = (): Transaction[] => {
  const data = localStorage.getItem(KEYS.TRANSACTIONS);
  if (!data) return [];
  
  const parsed = JSON.parse(data);
  // Migration: Ensure all items have a type. Default to 'expense' for old data.
  return parsed.map((item: any) => ({
    ...item,
    type: item.type || 'expense',
    accountId: item.accountId || undefined // Ensure accountId is optional
  }));
};

export const saveTransaction = (transaction: Transaction): Transaction[] => {
  const current = getTransactions();
  const updated = [transaction, ...current];
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(updated));
  
  // Update Streak Logic
  updateUserStreak();
  
  // Check Badges after streak update
  checkBadges(updated);
  return updated;
};

const updateUserStreak = () => {
  const user = getUser();
  if (!user) return;

  const today = new Date().toDateString();
  const lastDate = user.lastTransactionDate ? new Date(user.lastTransactionDate).toDateString() : null;

  if (lastDate === today) {
    // Already logged today, do nothing to streak
    return; 
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  let newStreak = user.currentStreak;

  if (lastDate === yesterday.toDateString()) {
    // Logged yesterday, increment streak
    newStreak += 1;
  } else {
    // Missed a day (or first time), reset streak to 1 (today counts)
    newStreak = 1;
  }

  const updatedUser: UserProfile = {
    ...user,
    lastTransactionDate: new Date().toISOString(),
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, user.longestStreak),
    // Give points for continuing streak
    points: user.points + (newStreak > 1 ? 10 : 5) 
  };
  
  saveUser(updatedUser);
};

export const deleteTransaction = (id: string): Transaction[] => {
  const current = getTransactions();
  const updated = current.filter(e => e.id !== id);
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(updated));
  return updated;
};

export const getUser = (): UserProfile | null => {
  const data = localStorage.getItem(KEYS.USER);
  if (!data) return null;
  
  const parsed = JSON.parse(data);
  
  // Create default accounts if none exist
  let accounts = parsed.accounts;
  if (!accounts || accounts.length === 0) {
    accounts = [
      { id: 'default-cash', name: 'Cash', type: 'cash' as const, color: '#10b981' },
      { id: 'default-bank', name: 'Bank Account', type: 'bank' as const, color: '#3b82f6' }
    ];
    // Save the updated user with default accounts
    const updatedUser = {
      ...parsed,
      accounts
    };
    localStorage.setItem(KEYS.USER, JSON.stringify(updatedUser));
  }
  
  // Migration: Add new gamification fields, currency, budget, and tour status if missing
  return {
    ...parsed,
    currency: parsed.currency || 'USD',
    currentStreak: parsed.currentStreak || 0,
    longestStreak: parsed.longestStreak || 0,
    lastTransactionDate: parsed.lastTransactionDate || null,
    budget: parsed.budget || { amount: 0, period: 'monthly', categoryLimits: {} },
    accounts: accounts,
    // If hasCompletedTour is undefined (existing user), default to true so they don't see the tour
    hasCompletedTour: parsed.hasCompletedTour ?? true,
  };
};

export const saveUser = (user: UserProfile) => {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
};

export const checkBadges = (transactions: Transaction[]) => {
  const user = getUser();
  if (!user) return;

  const earnedBadgeIds = new Set(user.badges);
  let newBadgesEarned = false;
  let pointsToAdd = 0;

  BADGES.forEach(badge => {
    if (!earnedBadgeIds.has(badge.id) && badge.condition(transactions, user)) {
      earnedBadgeIds.add(badge.id);
      newBadgesEarned = true;
      pointsToAdd += 100; // 100 points per badge
    }
  });

  if (newBadgesEarned) {
    saveUser({
      ...user,
      badges: Array.from(earnedBadgeIds),
      points: user.points + pointsToAdd
    });
  }
};

// Backup & Restore Functions
export interface BackupData {
  user: UserProfile;
  transactions: Transaction[];
  version: string;
  exportDate: string;
}

export const exportBackup = (): BackupData => {
  const user = getUser();
  const transactions = getTransactions();
  
  if (!user) {
    throw new Error('No user data found');
  }

  return {
    user,
    transactions,
    version: '1.0',
    exportDate: new Date().toISOString()
  };
};

export const importBackup = (backupData: BackupData): void => {
  // Validate backup data structure
  if (!backupData.user || !backupData.transactions) {
    throw new Error('Invalid backup file format');
  }

  // Validate user structure
  if (!backupData.user.name || !backupData.user.currency) {
    throw new Error('Invalid user data in backup file');
  }

  // Clear existing data
  localStorage.removeItem(KEYS.TRANSACTIONS);
  localStorage.removeItem(KEYS.USER);

  // Restore transactions
  if (Array.isArray(backupData.transactions) && backupData.transactions.length > 0) {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(backupData.transactions));
  }

  // Restore user profile
  localStorage.setItem(KEYS.USER, JSON.stringify(backupData.user));
};
