
import { Transaction, UserProfile, Badge } from '../types';
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
    type: item.type || 'expense'
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
  
  // Migration: Add new gamification fields, currency, budget, and tour status if missing
  return {
    ...parsed,
    currency: parsed.currency || 'USD',
    currentStreak: parsed.currentStreak || 0,
    longestStreak: parsed.longestStreak || 0,
    lastTransactionDate: parsed.lastTransactionDate || null,
    budget: parsed.budget || { amount: 0, period: 'monthly', categoryLimits: {} },
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
