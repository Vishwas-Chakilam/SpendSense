
import React, { useState, useEffect } from 'react';
import { View, UserProfile, Transaction } from './types';
import { getTransactions, getUser, saveTransaction, saveUser, deleteTransaction } from './services/storageService';
import Layout from './components/Layout';
import Onboarding from './views/Onboarding';
import Dashboard from './views/Dashboard';
import Analytics from './views/Analytics';
import Profile from './views/Profile';
import AddTransactionModal from './components/AddTransactionModal';
import Tour, { Step } from './components/Tour';

const TOUR_STEPS: Step[] = [
  {
    targetId: 'dashboard-balance-card',
    title: 'Financial Overview',
    content: 'This is your command center. See your total balance, income, and expenses at a glance.'
  },
  {
    targetId: 'dashboard-add-btn',
    title: 'Track Expenses',
    content: 'Tap here to add a new transaction. You can manually enter details or scan a receipt with AI!'
  },
  {
    targetId: 'nav-analytics',
    title: 'Smart Insights',
    content: 'Switch to the Insights tab to see visual charts and get AI-powered advice on your spending habits.'
  },
  {
    targetId: 'nav-profile',
    title: 'Gamification & Settings',
    content: 'Visit your profile to set budgets, export data, and unlock new avatars by earning points.'
  }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.ONBOARDING);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial Load
    const loadedUser = getUser();
    const loadedTransactions = getTransactions();
    
    if (loadedUser) {
      setUser(loadedUser);
      setTransactions(loadedTransactions);
      setCurrentView(View.DASHBOARD);
    } else {
      setCurrentView(View.ONBOARDING);
    }
    setLoading(false);
  }, []);

  const handleOnboardingComplete = (newUser: UserProfile) => {
    saveUser(newUser);
    setUser(newUser);
    setCurrentView(View.DASHBOARD);
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    saveUser(updatedUser);
    setUser(updatedUser);
  };

  const handleAddTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
    };
    const updated = saveTransaction(newTransaction);
    setTransactions(updated);
    
    // Refresh user to get badges updates
    const updatedUser = getUser();
    if (updatedUser) setUser(updatedUser);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = deleteTransaction(id);
    setTransactions(updated);
  };

  const handleTourFinish = () => {
    if (user) {
        const updatedUser = { ...user, hasCompletedTour: true };
        handleUpdateUser(updatedUser);
    }
  };

  if (loading) return null;

  if (currentView === View.ONBOARDING) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <>
      <Layout currentView={currentView} onChangeView={setCurrentView}>
        {currentView === View.DASHBOARD && user && (
          <Dashboard 
            user={user} 
            expenses={transactions} 
            onAddClick={() => setIsModalOpen(true)}
            onDeleteExpense={handleDeleteTransaction}
          />
        )}
        {currentView === View.ANALYTICS && user && (
          <Analytics 
            expenses={transactions} 
            currency={user.currency}
          />
        )}
        {currentView === View.PROFILE && user && (
          <Profile 
            user={user} 
            expenses={transactions} 
            onUpdateUser={handleUpdateUser}
          />
        )}
      </Layout>
      
      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddTransaction}
        currency={user?.currency || 'USD'}
      />

      {/* UI Tour */}
      <Tour 
        run={!!user && !user.hasCompletedTour && currentView === View.DASHBOARD}
        steps={TOUR_STEPS}
        onFinish={handleTourFinish}
      />
    </>
  );
};

export default App;
