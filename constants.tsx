import { Badge, Category, AvatarItem } from './types';

export const EXPENSE_CATEGORIES: Category[] = [
  'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Others'
];

export const INCOME_CATEGORIES: Category[] = [
  'Salary', 'Freelance', 'Investments', 'Gift', 'Other Income'
];

export const CATEGORY_COLORS: Record<Category, string> = {
  // Expenses
  Food: '#FF6B6B',
  Transport: '#4ECDC4',
  Shopping: '#45B7D1',
  Bills: '#FF9F43',
  Entertainment: '#9B59B6',
  Health: '#2ECC71',
  Education: '#3498DB',
  Others: '#95A5A6',
  // Income
  Salary: '#27ae60',
  Freelance: '#2ecc71',
  Investments: '#1abc9c',
  Gift: '#f1c40f',
  'Other Income': '#16a085'
};

export const CATEGORY_EMOJIS: Record<Category, string> = {
  // Expenses
  Food: '🍔',
  Transport: '🚌',
  Shopping: '🛍️',
  Bills: '🧾',
  Entertainment: '🎬',
  Health: '🏥',
  Education: '🎓',
  Others: '📦',
  // Income
  Salary: '💰',
  Freelance: '💻',
  Investments: '📈',
  Gift: '🎁',
  'Other Income': '💵'
};

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
];

export const AVATAR_LIST: AvatarItem[] = [
  // Defaults
  { id: 'dev', emoji: '🧑‍💻', name: 'Dev', isDefault: true },
  { id: 'artist', emoji: '👩‍🎨', name: 'Artist', isDefault: true },
  { id: 'fox', emoji: '🦊', name: 'Fox', isDefault: true },
  { id: 'panda', emoji: '🐼', name: 'Panda', isDefault: true },
  
  // Unlockable by Points
  { id: 'hero', emoji: '🦸‍♂️', name: 'Hero', unlockCondition: { type: 'points', value: 100 } },
  { id: 'wizard', emoji: '🧙', name: 'Wizard', unlockCondition: { type: 'points', value: 300 } },
  { id: 'tiger', emoji: '🐯', name: 'Tiger', unlockCondition: { type: 'points', value: 500 } },
  { id: 'robot', emoji: '🤖', name: 'Bot', unlockCondition: { type: 'points', value: 1000 } },
  
  // Unlockable by Badges
  { id: 'rich', emoji: '💎', name: 'Tycoon', unlockCondition: { type: 'badge', value: 'big_spender' } },
  { id: 'piggy', emoji: '🐷', name: 'Saver', unlockCondition: { type: 'badge', value: 'saver' } },
  { id: 'fire', emoji: '🔥', name: 'On Fire', unlockCondition: { type: 'badge', value: 'streak_7' } },
];

export const BADGES: Badge[] = [
  {
    id: 'rookie',
    name: 'Rookie Tracker',
    description: 'Tracked your first transaction',
    icon: '🌱',
    condition: (transactions) => transactions.length >= 1,
  },
  {
    id: 'tracker_pro',
    name: 'Tracker Pro',
    description: 'Tracked 50+ transactions',
    icon: '📊',
    condition: (transactions) => transactions.length >= 50,
  },
  {
    id: 'big_spender',
    name: 'Big Ticket',
    description: 'Added a transaction over 500 units',
    icon: '💎',
    condition: (transactions) => transactions.some(e => e.amount > 500),
  },
  {
    id: 'saver',
    name: 'Super Saver',
    description: 'Income exceeds expenses by 20%',
    icon: '🐷',
    condition: (transactions) => {
       const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
       const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
       return income > 0 && (income - expense) > (income * 0.2);
    }
  },
  {
    id: 'streak_3',
    name: 'Heating Up',
    description: 'Log transactions 3 days in a row',
    icon: '🕯️',
    condition: (_, user) => user.currentStreak >= 3,
  },
  {
    id: 'streak_7',
    name: 'On Fire',
    description: 'Log transactions 7 days in a row',
    icon: '🔥',
    condition: (_, user) => user.currentStreak >= 7,
  }
];

export const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const formatCurrency = (amount: number, currencyCode: string = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  } catch (e) {
    // Fallback if currency code is invalid
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
};

export const getCurrencySymbol = (code: string) => {
    return CURRENCIES.find(c => c.code === code)?.symbol || '$';
};