
import React from 'react';
import { Transaction, UserProfile, BudgetPeriod } from '../types';
import { formatCurrency, formatDate, CATEGORY_COLORS, CATEGORY_EMOJIS } from '../constants';
import { Icons } from '../components/Icons';

interface Props {
  user: UserProfile;
  expenses: Transaction[]; 
  onAddClick: () => void;
  onDeleteExpense: (id: string) => void;
}

const Dashboard: React.FC<Props> = ({ user, expenses: transactions, onAddClick, onDeleteExpense }) => {
  // Financial Summary Calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpense;

  // Weekly Challenge Calculation
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  };
  
  const startOfWeek = getStartOfWeek(new Date());
  startOfWeek.setHours(0,0,0,0);
  
  const weeklyTransactionCount = transactions.filter(t => new Date(t.date) >= startOfWeek).length;
  const weeklyGoal = 5;
  const weeklyProgress = Math.min((weeklyTransactionCount / weeklyGoal) * 100, 100);

  // Budget Calculations
  const getBudgetStart = (period: BudgetPeriod) => {
    const now = new Date();
    if (period === 'weekly') {
        return getStartOfWeek(now);
    }
    if (period === 'monthly') {
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    if (period === 'yearly') {
        return new Date(now.getFullYear(), 0, 1);
    }
    return new Date();
  };

  const budgetStart = getBudgetStart(user.budget.period);
  budgetStart.setHours(0,0,0,0);

  const periodExpenses = transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= budgetStart);
  
  const totalPeriodSpent = periodExpenses.reduce((sum, t) => sum + t.amount, 0);
  const budgetProgress = user.budget.amount > 0 ? (totalPeriodSpent / user.budget.amount) * 100 : 0;
  const remainingBudget = Math.max(0, user.budget.amount - totalPeriodSpent);
  
  const isBudgetExceeded = totalPeriodSpent > user.budget.amount;
  const budgetColor = isBudgetExceeded ? 'bg-red-500' : budgetProgress > 80 ? 'bg-orange-500' : 'bg-brand-500';

  // Category specific budget progress
  const categoryBudgets = Object.entries(user.budget.categoryLimits)
    .map(([cat, limit]) => {
        const spent = periodExpenses
            .filter(t => t.category === cat)
            .reduce((sum, t) => sum + t.amount, 0);
        return { category: cat, limit, spent };
    })
    .filter(item => item.spent > 0) // Only show categories with activity
    .sort((a, b) => (b.spent / b.limit) - (a.spent / a.limit)); // Sort by % used

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hello, {user.name}</h1>
          <p className="text-sm text-gray-500">Welcome back!</p>
        </div>
        <div className="flex items-center gap-3">
            {/* Streak Counter */}
            {user.currentStreak > 0 && (
                <div className="flex items-center gap-1 bg-orange-100 text-orange-600 px-3 py-1.5 rounded-full font-bold text-sm animate-pulse">
                    <Icons.Flame className="w-4 h-4 fill-orange-600" />
                    <span>{user.currentStreak}</span>
                </div>
            )}
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm border border-gray-100">
            {user.avatar}
            </div>
        </div>
      </div>

      {/* Main Balance Card */}
      <div id="dashboard-balance-card" className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/10 transition-colors"></div>
        
        <p className="text-slate-400 text-sm font-medium mb-1">Total Balance</p>
        <h2 className="text-4xl font-bold tracking-tight mb-6">{formatCurrency(balance, user.currency)}</h2>
        
        <div className="flex gap-4">
            <div className="bg-white/10 px-4 py-2 rounded-xl flex-1 backdrop-blur-sm">
                <div className="flex items-center gap-1 mb-1 text-green-300">
                    <Icons.ArrowUpRight className="w-3 h-3" />
                    <span className="text-xs font-medium">Income</span>
                </div>
                <p className="font-semibold text-lg">{formatCurrency(totalIncome, user.currency)}</p>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-xl flex-1 backdrop-blur-sm">
                <div className="flex items-center gap-1 mb-1 text-red-300">
                    <Icons.ArrowDownRight className="w-3 h-3" />
                    <span className="text-xs font-medium">Expense</span>
                </div>
                <p className="font-semibold text-lg">{formatCurrency(totalExpense, user.currency)}</p>
            </div>
        </div>
      </div>

      {/* Budget Status Widget */}
      {user.budget.amount > 0 ? (
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h3 className="font-bold text-slate-800 text-sm capitalize">{user.budget.period} Budget</h3>
                    <p className="text-xs text-gray-400">
                        {formatCurrency(totalPeriodSpent, user.currency)} / {formatCurrency(user.budget.amount, user.currency)}
                    </p>
                </div>
                <div className="text-right">
                    <p className={`text-sm font-bold ${remainingBudget === 0 ? 'text-red-500' : 'text-slate-700'}`}>
                        {formatCurrency(remainingBudget, user.currency)}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Left</p>
                </div>
            </div>
            
            {/* Main Budget Bar */}
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ${budgetColor}`}
                    style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                ></div>
            </div>

            {/* Category Warnings */}
            {categoryBudgets.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-gray-50">
                    {categoryBudgets.map(cb => {
                        const pct = (cb.spent / cb.limit) * 100;
                        const isOver = cb.spent > cb.limit;
                        return (
                            <div key={cb.category}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-600 font-medium">{cb.category}</span>
                                    <span className={isOver ? 'text-red-500 font-bold' : 'text-gray-400'}>
                                        {Math.round(pct)}%
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${isOver ? 'bg-red-400' : 'bg-brand-300'}`}
                                        style={{ width: `${Math.min(pct, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      ) : (
          <div className="bg-white p-4 rounded-2xl border border-dashed border-gray-200 text-center">
              <p className="text-sm text-gray-500 mb-2">No budget set. Take control of your spending!</p>
              <button onClick={() => (document.querySelector('nav button:nth-child(3)') as HTMLElement)?.click()} className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-lg">
                  Set a Budget
              </button>
          </div>
      )}

      {/* Weekly Challenge Widget */}
      <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl p-4 text-white shadow-lg flex items-center justify-between">
         <div className="flex-1">
             <div className="flex items-center gap-2 mb-2">
                 <Icons.Target className="w-5 h-5 text-white/80" />
                 <span className="font-bold text-sm uppercase tracking-wide opacity-90">Weekly Quest</span>
             </div>
             <p className="text-sm font-medium mb-3">Log {weeklyGoal} transactions</p>
             <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                 <div 
                    className="h-full bg-white transition-all duration-1000 ease-out" 
                    style={{ width: `${weeklyProgress}%` }}
                 ></div>
             </div>
         </div>
         <div className="ml-4 flex flex-col items-center justify-center min-w-[50px]">
             <span className="text-xl font-bold">{weeklyTransactionCount}/{weeklyGoal}</span>
             {weeklyProgress >= 100 && <span className="text-xs font-bold bg-white text-fuchsia-600 px-2 py-0.5 rounded-full mt-1">DONE</span>}
         </div>
      </div>

      {/* Quick Actions */}
      <button 
        id="dashboard-add-btn"
        onClick={onAddClick}
        className="w-full py-4 bg-brand-500 text-white rounded-2xl flex items-center justify-center gap-2 font-semibold shadow-lg shadow-brand-200 active:scale-[0.98] transition-transform"
      >
        <Icons.Plus className="w-5 h-5" />
        Add Transaction
      </button>

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
          <span className="text-xs text-brand-600 font-medium">View All</span>
        </div>
        
        {transactions.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400">No transactions yet.</p>
            <p className="text-xs text-gray-300 mt-1">Tap the button above to start.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{ backgroundColor: `${CATEGORY_COLORS[t.category]}20` }}
                  >
                    {CATEGORY_EMOJIS[t.category] || '📦'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{t.title}</h4>
                    <p className="text-xs text-gray-400">{formatDate(t.date)} • {t.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center ${t.type === 'income' ? 'text-green-600' : 'text-slate-800'}`}>
                    {t.type === 'income' ? <Icons.ArrowUpRight className="w-4 h-4 mr-1" /> : <Icons.ArrowDownRight className="w-4 h-4 mr-1 text-gray-400" />}
                    <span className="font-bold">{formatCurrency(t.amount, user.currency)}</span>
                  </div>
                  <button 
                    onClick={() => onDeleteExpense(t.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-400 hover:bg-red-50 rounded-full"
                  >
                    <Icons.Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
