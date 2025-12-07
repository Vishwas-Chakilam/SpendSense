import React from 'react';
import saveAs from 'file-saver';
import { UserProfile, Transaction, BudgetPeriod } from '../types';
import { BADGES, AVATAR_LIST, CURRENCIES, EXPENSE_CATEGORIES } from '../constants';
import { Icons } from '../components/Icons';
import { exportToPDF, exportToExcel } from '../services/exportService';

interface Props {
  user: UserProfile;
  expenses: Transaction[]; 
  onUpdateUser: (user: UserProfile) => void;
}

const Profile: React.FC<Props> = ({ user, expenses: transactions, onUpdateUser }) => {

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

  return (
    <div className="p-6 space-y-8 animate-fade-in pb-24">
      <h1 className="text-2xl font-bold text-slate-800">Profile</h1>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
        <div className="text-6xl relative">
            {user.avatar}
            <div className="absolute -bottom-1 -right-1 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white">
                Lvl {Math.floor(user.points / 100) + 1}
            </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
          <p className="text-sm text-gray-400">Joined {new Date(user.joinedDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</p>
          <div className="mt-2 flex gap-2">
            <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                🏆 {user.points} Pts
            </span>
            <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                🔥 {user.currentStreak} Day Streak
            </span>
          </div>
        </div>
      </div>

      {/* Budgeting Goals */}
      <div>
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
           <Icons.Target className="w-5 h-5 text-brand-500" />
           Budgeting Goals
        </h3>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
           <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Overall Budget Limit</label>
              <div className="flex gap-2">
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
                    className="flex-1 px-4 py-2 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <select 
                    value={user.budget.period || 'weekly'}
                    onChange={(e) => handleUpdateBudget('period', e.target.value)}
                    className="px-4 py-2 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-500 font-medium text-sm"
                  >
                    <option value="weekly">Week</option>
                    <option value="monthly">Month</option>
                    <option value="yearly">Year</option>
                  </select>
              </div>
           </div>

           <div className="pt-2">
               <label className="block text-sm font-medium text-gray-500 mb-3">Category Limits (Optional)</label>
               <div className="space-y-3">
                   {EXPENSE_CATEGORIES.map(cat => (
                       <div key={cat} className="flex items-center justify-between gap-4">
                           <span className="text-sm text-slate-700 font-medium w-1/3">{cat}</span>
                           <input 
                             type="number"
                             placeholder="No Limit"
                             value={user.budget.categoryLimits[cat] || ''}
                             onChange={(e) => handleUpdateCategoryLimit(cat, parseFloat(e.target.value))}
                             className="w-full px-3 py-2 text-right bg-gray-50 rounded-lg text-sm border-none outline-none focus:ring-1 focus:ring-brand-500"
                           />
                       </div>
                   ))}
               </div>
           </div>
        </div>
      </div>

      {/* Settings */}
      <div>
          <h3 className="font-bold text-slate-800 mb-4">Settings</h3>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <label className="block text-sm font-medium text-gray-500 mb-2">Currency</label>
              <div className="grid grid-cols-3 gap-2">
                  {CURRENCIES.map(c => (
                      <button 
                        key={c.code}
                        onClick={() => handleChangeCurrency(c.code)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                            user.currency === c.code 
                                ? 'border-brand-500 bg-brand-50 text-brand-700' 
                                : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                          <span className="text-lg font-bold">{c.symbol}</span>
                          <span className="text-[10px] font-medium">{c.code}</span>
                      </button>
                  ))}
              </div>
          </div>
      </div>

      {/* Export Data */}
      <div>
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Icons.Download className="w-5 h-5" />
          Export Data
        </h3>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
           <div className="grid grid-cols-2 gap-4">
               <button 
                 onClick={() => exportToPDF(transactions, user)}
                 disabled={transactions.length === 0}
                 className="flex flex-col items-center justify-center py-6 px-4 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-2xl transition-all border border-transparent hover:border-red-100 group disabled:opacity-50"
               >
                 <div className="mb-3 text-red-500 bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15h6"/><path d="M9 19h6"/><path d="M9 11h6"/></svg>
                 </div>
                 <span className="font-bold text-sm">Export PDF</span>
               </button>

               <button 
                 onClick={() => exportToExcel(transactions, user)}
                 disabled={transactions.length === 0}
                 className="flex flex-col items-center justify-center py-6 px-4 bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-600 rounded-2xl transition-all border border-transparent hover:border-green-100 group disabled:opacity-50"
               >
                 <div className="mb-3 text-green-500 bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                 </div>
                 <span className="font-bold text-sm">Export Excel</span>
               </button>
           </div>
           <p className="text-center text-xs text-gray-400 mt-4">
             {transactions.length} transactions will be exported
           </p>
        </div>
      </div>

      {/* Avatar Collection */}
      <div>
         <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            Avatar Collection
            <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">Unlock with points</span>
         </h3>
         <div className="grid grid-cols-4 gap-3">
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
                        className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${
                            isCurrent ? 'border-brand-500 bg-brand-50' : 
                            isUnlocked ? 'border-transparent bg-white shadow-sm hover:bg-gray-50' : 
                            'border-transparent bg-gray-100 opacity-60'
                        }`}
                     >
                        <span className="text-3xl mb-1">{item.emoji}</span>
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
        <h3 className="font-bold text-slate-800 mb-4">Achievements</h3>
        <div className="grid grid-cols-2 gap-4">
          {BADGES.map(badge => {
            const isUnlocked = user.badges.includes(badge.id);
            return (
              <div 
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isUnlocked 
                    ? 'bg-white border-brand-200 shadow-sm' 
                    : 'bg-gray-50 border-gray-100 opacity-60 grayscale'
                }`}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <h4 className="font-bold text-sm text-slate-800">{badge.name}</h4>
                <p className="text-xs text-gray-500 leading-tight mt-1">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Developer Card */}
      <div>
        <h3 className="font-bold text-slate-800 mb-4">Developer</h3>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            
            <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-2xl mb-3 border border-white/10 shadow-inner">
                    👨‍💻
                </div>
                <h4 className="text-lg font-bold">Vishwas Chakilam</h4>
                <p className="text-slate-400 text-xs mb-5">Building digital experiences.</p>
                
                <div className="flex gap-4">
                    <a href="https://linkedin.com/in/vishwas-chakilam" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/10 rounded-full hover:bg-white/20 hover:scale-110 transition-all text-white/90">
                        <Icons.Linkedin className="w-5 h-5" />
                    </a>
                    <a href="https://github.com/vishwas-chakilam" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/10 rounded-full hover:bg-white/20 hover:scale-110 transition-all text-white/90">
                        <Icons.Github className="w-5 h-5" />
                    </a>
                    <a href="mailto:work.vishwas1@gmail.com" className="p-2.5 bg-white/10 rounded-full hover:bg-white/20 hover:scale-110 transition-all text-white/90">
                        <Icons.Mail className="w-5 h-5" />
                    </a>
                    <a href="https://leetcode.com/u/Vishwas-1/" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/10 rounded-full hover:bg-white/20 hover:scale-110 transition-all text-white/90">
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
          className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-semibold active:bg-red-100 transition-colors"
        >
          Reset App Data
        </button>
      </div>
      
      <div className="text-center text-xs text-gray-300 pt-8">
        Spendsense v1.5 • Gamified Finance
      </div>
    </div>
  );
};

export default Profile;