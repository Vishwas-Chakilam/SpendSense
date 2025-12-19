import React, { useState, useMemo } from 'react';
import { Transaction, UserProfile } from '../types';
import { formatCurrency, formatDate, CATEGORY_COLORS, CATEGORY_EMOJIS } from '../constants';
import { Icons } from '../components/Icons';

interface Props {
  user: UserProfile;
  expenses: Transaction[];
  onDeleteExpense: (id: string) => void;
}

type FilterType = 'all' | 'income' | 'expense';
type SortType = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

const Transactions: React.FC<Props> = ({ user, expenses: transactions, onDeleteExpense }) => {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('date-desc');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filter by account
    if (selectedAccount !== 'all') {
      filtered = filtered.filter(t => t.accountId === selectedAccount);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortType) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return sorted;
  }, [transactions, filterType, sortType, selectedAccount]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    
    filteredAndSortedTransactions.forEach(transaction => {
      const dateKey = new Date(transaction.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    });

    return groups;
  }, [filteredAndSortedTransactions]);

  const accounts = user.accounts || [];

  const getAccountInfo = (accountId?: string) => {
    if (!accountId) return null;
    const account = accounts.find(a => a.id === accountId);
    if (!account) return null;
    const icon = account.type === 'cash' ? '💵' : account.type === 'bank' ? '🏦' : account.type === 'credit' ? '💳' : '📊';
    return { name: account.name, icon };
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Transactions</h1>
        <div className="text-sm text-gray-500">
          {filteredAndSortedTransactions.length} {filteredAndSortedTransactions.length === 1 ? 'transaction' : 'transactions'}
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Type Filter */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {(['all', 'income', 'expense'] as FilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                filterType === type
                  ? type === 'income' 
                    ? 'bg-green-500 text-white shadow-sm' 
                    : type === 'expense'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'bg-white text-slate-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {type === 'all' ? 'All' : type}
            </button>
          ))}
        </div>

        {/* Account Filter */}
        {accounts.length > 0 && (
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none text-sm"
          >
            <option value="all">All Accounts</option>
            {accounts.map(account => {
              const icon = account.type === 'cash' ? '💵' : account.type === 'bank' ? '🏦' : account.type === 'credit' ? '💳' : '📊';
              return (
                <option key={account.id} value={account.id}>
                  {icon} {account.name}
                </option>
              );
            })}
          </select>
        )}

        {/* Sort */}
        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value as SortType)}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none text-sm"
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Highest Amount</option>
          <option value="amount-asc">Lowest Amount</option>
        </select>
      </div>

      {/* Transactions List */}
      {filteredAndSortedTransactions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-400 mb-2">No transactions found</p>
          <p className="text-xs text-gray-300">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([dateKey, dateTransactions]) => (
            <div key={dateKey}>
              <h3 className="text-sm font-bold text-gray-500 mb-3 sticky top-0 bg-gray-50 py-2 z-10">
                {dateKey}
              </h3>
              <div className="space-y-2">
                {dateTransactions.map((transaction) => {
                  const accountInfo = getAccountInfo(transaction.accountId);
                  return (
                    <div
                      key={transaction.id}
                      className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm flex justify-between items-center group hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                          style={{ backgroundColor: `${CATEGORY_COLORS[transaction.category]}20` }}
                        >
                          {CATEGORY_EMOJIS[transaction.category] || '📦'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-800 truncate">{transaction.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span>{transaction.category}</span>
                            {accountInfo && (
                              <>
                                <span>•</span>
                                <span>{accountInfo.icon} {accountInfo.name}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>{new Date(transaction.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className={`flex items-center ${transaction.type === 'income' ? 'text-green-600' : 'text-slate-800'}`}>
                          {transaction.type === 'income' ? (
                            <Icons.ArrowUpRight className="w-4 h-4 mr-1" />
                          ) : (
                            <Icons.ArrowDownRight className="w-4 h-4 mr-1 text-gray-400" />
                          )}
                          <span className="font-bold text-lg">{formatCurrency(transaction.amount, user.currency)}</span>
                        </div>
                        <button
                          onClick={() => onDeleteExpense(transaction.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-400 hover:bg-red-50 rounded-full"
                        >
                          <Icons.Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Transactions;

