import React, { useState, useRef } from 'react';
import saveAs from 'file-saver';
import { UserProfile, Transaction, BudgetPeriod, Account } from '../types';
import { BADGES, AVATAR_LIST, CURRENCIES, EXPENSE_CATEGORIES } from '../constants';
import { Icons } from '../components/Icons';
import { exportToPDF, exportToExcel } from '../services/exportService';
import { exportBackup, importBackup, BackupData } from '../services/storageService';

interface Props {
  user: UserProfile;
  expenses: Transaction[]; 
  onUpdateUser: (user: UserProfile) => void;
}

const Profile: React.FC<Props> = ({ user, expenses: transactions, onUpdateUser }) => {
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState<Account['type']>('bank');
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChangeAvatar = (emoji: string) => {
    const updated = { ...user, avatar: emoji };
    onUpdateUser(updated);
  };

  const handleChangeCurrency = (code: string) => {
      const updated = { ...user, currency: code };
      onUpdateUser(updated);
  };

  const handleUpdateBudget = (field: keyof UserProfile['budget'], value: any) => {
    const updatedUser = {
      ...user,
      budget: {
        ...user.budget,
        [field]: value
      }
    };
    onUpdateUser(updatedUser);
  };

  const handleUpdateCategoryLimit = (category: string, value: number) => {
     const newLimits = { ...user.budget.categoryLimits };
     if (value > 0) {
       newLimits[category] = value;
     } else {
       delete newLimits[category];
     }
     
     onUpdateUser({
       ...user,
       budget: {
         ...user.budget,
         categoryLimits: newLimits
       }
     });
  };

  const handleAddAccount = () => {
    if (!newAccountName.trim()) return;
    
    const accounts = user.accounts || [];
    const newAccount: Account = {
      id: crypto.randomUUID(),
      name: newAccountName.trim(),
      type: newAccountType,
      color: newAccountType === 'cash' ? '#10b981' : newAccountType === 'bank' ? '#3b82f6' : newAccountType === 'credit' ? '#f59e0b' : '#8b5cf6'
    };
    
    onUpdateUser({
      ...user,
      accounts: [...accounts, newAccount]
    });
    
    setNewAccountName('');
    setIsAddingAccount(false);
  };

  const handleDeleteAccount = (accountId: string) => {
    const accounts = user.accounts || [];
    if (accounts.length <= 1) {
      alert('You need at least one account.');
      return;
    }
    
    // Check if account has transactions
    const hasTransactions = transactions.some(t => t.accountId === accountId);
    if (hasTransactions) {
      if (!confirm('This account has transactions. Deleting it will remove the account association from those transactions. Continue?')) {
        return;
      }
    }
    
    onUpdateUser({
      ...user,
      accounts: accounts.filter(a => a.id !== accountId)
    });
  };

  const handleEditAccount = (accountId: string, newName: string) => {
    const accounts = user.accounts || [];
    onUpdateUser({
      ...user,
      accounts: accounts.map(a => a.id === accountId ? { ...a, name: newName.trim() } : a)
    });
    setEditingAccountId(null);
  };

  const getAccountTypeIcon = (type: Account['type']) => {
    switch (type) {
      case 'cash': return '💵';
      case 'bank': return '🏦';
      case 'credit': return '💳';
      default: return '📊';
    }
  };

  const accounts = user.accounts || [];

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 animate-fade-in pb-24">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Profile</h1>

      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        <div className="text-5xl sm:text-6xl relative flex-shrink-0">
            {user.avatar}
            <div className="absolute -bottom-1 -right-1 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white">
                Lvl {Math.floor(user.points / 100) + 1}
            </div>
        </div>
        <div className="flex-1 text-center sm:text-left w-full">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">{user.name}</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Joined {new Date(user.joinedDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</p>
          <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full text-xs font-bold">
                🏆 {user.points} Pts
            </span>
            <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs font-bold">
                🔥 {user.currentStreak} Day Streak
            </span>
          </div>
        </div>
      </div>

      {/* Budgeting Goals */}
      <div>
        <h3 className="font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg">
           <Icons.Target className="w-5 h-5 text-brand-500 flex-shrink-0" />
           Budgeting Goals
        </h3>
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 space-y-4">
           <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Overall Budget Limit</label>
              <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="number" 
                    value={user.budget.amount > 0 ? user.budget.amount : ''} 
                    onChange={(e) => {
                      const value = e.target.value;
                      handleUpdateBudget('amount', value === '' ? 0 : parseFloat(value) || 0);
                    }}
                    placeholder="Set Limit"
                    min="0"
                    step="0.01"
                    className="flex-1 px-4 py-3 sm:py-2 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-500 text-base sm:text-sm"
                  />
                  <select 
                    value={user.budget.period || 'weekly'}
                    onChange={(e) => handleUpdateBudget('period', e.target.value)}
                    className="px-4 py-3 sm:py-2 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-500 font-medium text-sm sm:text-sm w-full sm:w-auto"
                  >
                    <option value="weekly">Week</option>
                    <option value="monthly">Month</option>
                    <option value="yearly">Year</option>
                  </select>
              </div>
           </div>

           <div className="pt-2">
               <label className="block text-sm font-medium text-gray-500 mb-3">Category Limits (Optional)</label>
               <div className="space-y-2.5 sm:space-y-3">
                   {EXPENSE_CATEGORIES.map(cat => (
                       <div key={cat} className="flex items-center justify-between gap-3 sm:gap-4">
                           <span className="text-xs sm:text-sm text-slate-700 font-medium flex-shrink-0 min-w-[80px] sm:min-w-[100px]">{cat}</span>
                           <input 
                             type="number"
                             placeholder="No Limit"
                             value={user.budget.categoryLimits[cat] || ''}
                             onChange={(e) => handleUpdateCategoryLimit(cat, parseFloat(e.target.value))}
                             className="flex-1 px-3 py-2.5 sm:py-2 text-right bg-gray-50 rounded-lg text-sm border-none outline-none focus:ring-1 focus:ring-brand-500"
                           />
                       </div>
                   ))}
               </div>
           </div>
        </div>
      </div>

      {/* Account Management */}
      <div>
        <h3 className="font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg">
          <Icons.Wallet className="w-5 h-5 text-brand-500 flex-shrink-0" />
          Accounts
        </h3>
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 space-y-2.5 sm:space-y-3">
          {accounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between p-3 sm:p-3 bg-gray-50 rounded-xl">
              {editingAccountId === account.id ? (
                <div className="flex items-center gap-2 flex-1 w-full">
                  <span className="text-xl flex-shrink-0">{getAccountTypeIcon(account.type)}</span>
                  <input
                    type="text"
                    defaultValue={account.name}
                    onBlur={(e) => handleEditAccount(account.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleEditAccount(account.id, e.currentTarget.value);
                      } else if (e.key === 'Escape') {
                        setEditingAccountId(null);
                      }
                    }}
                    autoFocus
                    className="flex-1 px-3 py-2 bg-white rounded-lg border-none outline-none focus:ring-2 focus:ring-brand-500 text-sm min-w-0"
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xl flex-shrink-0">{getAccountTypeIcon(account.type)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 text-sm truncate">{account.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{account.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={() => setEditingAccountId(account.id)}
                      className="p-2 sm:p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors touch-manipulation"
                      aria-label="Edit account"
                    >
                      <Icons.Edit className="w-4 h-4 sm:w-4 sm:h-4" />
                    </button>
                    {accounts.length > 1 && (
                      <button
                        onClick={() => handleDeleteAccount(account.id)}
                        className="p-2 sm:p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
                        aria-label="Delete account"
                      >
                        <Icons.Trash className="w-4 h-4 sm:w-4 sm:h-4" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
          
          {isAddingAccount ? (
            <div className="p-3 sm:p-3 bg-brand-50 rounded-xl space-y-2.5 sm:space-y-2 border border-brand-200">
              <input
                type="text"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                placeholder="Account name"
                className="w-full px-3 py-3 sm:py-2 bg-white rounded-lg border-none outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                autoFocus
              />
              <select
                value={newAccountType}
                onChange={(e) => setNewAccountType(e.target.value as Account['type'])}
                className="w-full px-3 py-3 sm:py-2 bg-white rounded-lg border-none outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              >
                <option value="bank">Bank Account</option>
                <option value="cash">Cash</option>
                <option value="credit">Credit Card</option>
                <option value="other">Other</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleAddAccount}
                  disabled={!newAccountName.trim()}
                  className="flex-1 py-3 sm:py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50 active:scale-95 transition-transform touch-manipulation"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAddingAccount(false);
                    setNewAccountName('');
                  }}
                  className="flex-1 py-3 sm:py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold active:scale-95 transition-transform touch-manipulation"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingAccount(true)}
              className="w-full py-3.5 sm:py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors border border-dashed border-gray-300 touch-manipulation"
            >
              <Icons.Plus className="w-4 h-4" />
              Add Account
            </button>
          )}
        </div>
      </div>

      {/* Settings */}
      <div>
          <h3 className="font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg">
            <Icons.Settings className="w-5 h-5 text-brand-500 flex-shrink-0" />
            Settings
          </h3>
          <div className="bg-white p-4 sm:p-4 rounded-2xl shadow-sm border border-gray-100">
              <label className="block text-sm font-medium text-gray-500 mb-3">Currency</label>
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5 sm:gap-2">
                  {CURRENCIES.map(c => (
                      <button 
                        key={c.code}
                        onClick={() => handleChangeCurrency(c.code)}
                        className={`flex flex-col items-center justify-center p-3.5 sm:p-3 rounded-xl border transition-all touch-manipulation min-h-[64px] sm:min-h-[auto] ${
                            user.currency === c.code 
                                ? 'border-brand-500 bg-brand-50 text-brand-700' 
                                : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                          <span className="text-lg sm:text-lg font-bold">{c.symbol}</span>
                          <span className="text-[10px] sm:text-[10px] font-medium mt-0.5">{c.code}</span>
                      </button>
                  ))}
              </div>
          </div>
      </div>

      {/* Export Data */}
      <div>
        <h3 className="font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg">
          <Icons.Download className="w-5 h-5 flex-shrink-0" />
          Export Data
        </h3>
        
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100">
           <div className="grid grid-cols-2 gap-3 sm:gap-4">
               <button 
                 onClick={() => exportToPDF(transactions, user)}
                 disabled={transactions.length === 0}
                 className="flex flex-col items-center justify-center py-5 sm:py-6 px-3 sm:px-4 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl sm:rounded-2xl transition-all border border-transparent hover:border-red-100 group disabled:opacity-50 touch-manipulation min-h-[100px] sm:min-h-[auto]"
               >
                 <div className="mb-2 sm:mb-3 text-red-500 bg-white p-2.5 sm:p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15h6"/><path d="M9 19h6"/><path d="M9 11h6"/></svg>
                 </div>
                 <span className="font-bold text-xs sm:text-sm">Export PDF</span>
               </button>

               <button 
                 onClick={() => exportToExcel(transactions, user)}
                 disabled={transactions.length === 0}
                 className="flex flex-col items-center justify-center py-5 sm:py-6 px-3 sm:px-4 bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-600 rounded-xl sm:rounded-2xl transition-all border border-transparent hover:border-green-100 group disabled:opacity-50 touch-manipulation min-h-[100px] sm:min-h-[auto]"
               >
                 <div className="mb-2 sm:mb-3 text-green-500 bg-white p-2.5 sm:p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                 </div>
                 <span className="font-bold text-xs sm:text-sm">Export Excel</span>
               </button>
           </div>
           <p className="text-center text-xs text-gray-400 mt-4">
             {transactions.length} transactions will be exported
           </p>
        </div>
      </div>

      {/* Backup & Restore */}
      <div>
        <h3 className="font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg">
          <Icons.Database className="w-5 h-5 text-brand-500 flex-shrink-0" />
          Backup & Restore
        </h3>
        
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Download Backup */}
            <button 
              onClick={() => {
                try {
                  const backup = exportBackup();
                  const jsonString = JSON.stringify(backup, null, 2);
                  const blob = new Blob([jsonString], { type: 'application/json' });
                  const fileName = `spendsense-backup-${new Date().toISOString().split('T')[0]}.json`;
                  saveAs(blob, fileName);
                  alert('Backup downloaded successfully!');
                } catch (error) {
                  alert('Failed to create backup: ' + (error instanceof Error ? error.message : 'Unknown error'));
                }
              }}
              className="flex flex-col items-center justify-center py-5 sm:py-6 px-3 sm:px-4 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl sm:rounded-2xl transition-all border border-transparent hover:border-blue-100 group touch-manipulation min-h-[100px] sm:min-h-[auto]"
            >
              <div className="mb-2 sm:mb-3 text-blue-500 bg-white p-2.5 sm:p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                <Icons.Download className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="font-bold text-xs sm:text-sm">Download Backup</span>
              <span className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">JSON</span>
            </button>

            {/* Import Backup */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center py-5 sm:py-6 px-3 sm:px-4 bg-gray-50 hover:bg-purple-50 text-gray-600 hover:text-purple-600 rounded-xl sm:rounded-2xl transition-all border border-transparent hover:border-purple-100 group touch-manipulation min-h-[100px] sm:min-h-[auto]"
            >
              <div className="mb-2 sm:mb-3 text-purple-500 bg-white p-2.5 sm:p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                <Icons.Upload className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="font-bold text-xs sm:text-sm">Import Backup</span>
              <span className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">JSON</span>
            </button>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onload = (event) => {
                try {
                  const jsonContent = event.target?.result as string;
                  const backupData: BackupData = JSON.parse(jsonContent);
                  
                  // Validate backup structure
                  if (!backupData.user || !backupData.transactions) {
                    throw new Error('Invalid backup file format');
                  }

                  // Confirm before importing
                  if (confirm('This will replace all your current data. Are you sure you want to continue?')) {
                    importBackup(backupData);
                    
                    // Reload the page to reflect changes
                    window.location.reload();
                  }
                } catch (error) {
                  alert('Failed to import backup: ' + (error instanceof Error ? error.message : 'Invalid JSON file'));
                }
              };
              reader.readAsText(file);
              
              // Reset file input
              e.target.value = '';
            }}
          />
          
          <p className="text-center text-xs text-gray-400 mt-4">
            Backup includes all transactions and profile data
          </p>
        </div>
      </div>

      {/* Avatar Collection */}
      <div>
         <h3 className="font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg flex-wrap">
            <Icons.Avatar className="w-5 h-5 text-brand-500 flex-shrink-0" />
            <span>Avatar Collection</span>
            <span className="text-[10px] sm:text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">Unlock with points</span>
         </h3>
         <div className="grid grid-cols-4 sm:grid-cols-4 gap-2.5 sm:gap-3">
             {AVATAR_LIST.map(item => {
                 let isUnlocked = false;
                 if (item.isDefault) isUnlocked = true;
                 else if (item.unlockCondition?.type === 'points' && user.points >= (item.unlockCondition.value as number)) isUnlocked = true;
                 else if (item.unlockCondition?.type === 'badge' && user.badges.includes(item.unlockCondition.value as string)) isUnlocked = true;

                 const isCurrent = user.avatar === item.emoji;

                 return (
                     <button
                        key={item.id}
                        disabled={!isUnlocked}
                        onClick={() => handleChangeAvatar(item.emoji)}
                        className={`relative aspect-square rounded-xl sm:rounded-2xl flex flex-col items-center justify-center border-2 transition-all touch-manipulation ${
                            isCurrent ? 'border-brand-500 bg-brand-50' : 
                            isUnlocked ? 'border-transparent bg-white shadow-sm hover:bg-gray-50' : 
                            'border-transparent bg-gray-100 opacity-60'
                        }`}
                     >
                        <span className="text-2xl sm:text-3xl mb-0.5 sm:mb-1">{item.emoji}</span>
                        {!isUnlocked && (
                            <div className="absolute inset-0 bg-gray-100/50 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
                                <Icons.Lock className="w-5 h-5 text-gray-400" />
                            </div>
                        )}
                        {!isUnlocked && item.unlockCondition?.type === 'points' && (
                             <span className="absolute bottom-1 text-[8px] font-bold text-gray-500 bg-white/80 px-1 rounded">
                                {item.unlockCondition.value}pts
                             </span>
                        )}
                     </button>
                 );
             })}
         </div>
      </div>

      {/* Badges */}
      <div>
        <h3 className="font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg">
          <Icons.Trophy className="w-5 h-5 text-brand-500 flex-shrink-0" />
          Achievements
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
          {BADGES.map(badge => {
            const isUnlocked = user.badges.includes(badge.id);
            return (
              <div 
                key={badge.id}
                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${
                  isUnlocked 
                    ? 'bg-white border-brand-200 shadow-sm' 
                    : 'bg-gray-50 border-gray-100 opacity-60 grayscale'
                }`}
              >
                <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">{badge.icon}</div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-800">{badge.name}</h4>
                <p className="text-[10px] sm:text-xs text-gray-500 leading-tight mt-0.5 sm:mt-1">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Developer Card */}
      <div>
        <h3 className="font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg">
          <Icons.Developer className="w-5 h-5 text-brand-500 flex-shrink-0" />
          Developer
        </h3>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            
            <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-2xl mb-3 border border-white/10 shadow-inner">
                    👨‍💻
                </div>
                <h4 className="text-lg font-bold">Vishwas Chakilam</h4>
                <p className="text-slate-400 text-xs mb-5">Building digital experiences.</p>
                
                <div className="flex gap-3 sm:gap-4 justify-center">
                    <a href="https://linkedin.com/in/vishwas-chakilam" target="_blank" rel="noopener noreferrer" className="p-2.5 sm:p-2.5 bg-white/10 rounded-full hover:bg-white/20 hover:scale-110 transition-all text-white/90 touch-manipulation">
                        <Icons.Linkedin className="w-5 h-5" />
                    </a>
                    <a href="https://github.com/vishwas-chakilam" target="_blank" rel="noopener noreferrer" className="p-2.5 sm:p-2.5 bg-white/10 rounded-full hover:bg-white/20 hover:scale-110 transition-all text-white/90 touch-manipulation">
                        <Icons.Github className="w-5 h-5" />
                    </a>
                    <a href="mailto:work.vishwas1@gmail.com" className="p-2.5 sm:p-2.5 bg-white/10 rounded-full hover:bg-white/20 hover:scale-110 transition-all text-white/90 touch-manipulation">
                        <Icons.Mail className="w-5 h-5" />
                    </a>
                    <a href="https://leetcode.com/u/Vishwas-1/" target="_blank" rel="noopener noreferrer" className="p-2.5 sm:p-2.5 bg-white/10 rounded-full hover:bg-white/20 hover:scale-110 transition-all text-white/90 touch-manipulation">
                        <Icons.Code className="w-5 h-5" />
                    </a>
                </div>
            </div>
        </div>
      </div>

      <div className="space-y-3 pt-4">
        <button 
          onClick={() => {
             if(confirm("Are you sure? This will clear all data.")) {
                localStorage.clear();
                window.location.reload();
             }
          }}
          className="w-full py-3.5 sm:py-4 bg-red-50 text-red-600 rounded-xl sm:rounded-2xl font-semibold active:bg-red-100 transition-colors touch-manipulation"
        >
          Reset App Data
        </button>
      </div>
      
      <div className="text-center text-[10px] sm:text-xs text-gray-300 pt-6 sm:pt-8">
        Spendsense v1.5 • Gamified Finance
      </div>
    </div>
  );
};

export default Profile;