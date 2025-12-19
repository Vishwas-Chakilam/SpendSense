
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { AVATAR_LIST } from '../constants';
import { Icons } from '../components/Icons';

interface Props {
  onComplete: (user: UserProfile) => void;
}

const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  
  // Filter for default avatars
  const defaultAvatars = AVATAR_LIST.filter(a => a.isDefault);
  const [selectedAvatar, setSelectedAvatar] = useState(defaultAvatars[0].emoji);

  const handleNext = () => {
    if (step === 1 && name.trim()) {
      setStep(2);
    } else if (step === 2) {
      onComplete({
        name,
        email: '',
        avatar: selectedAvatar,
        joinedDate: new Date().toISOString(),
        points: 50, // Start with some points
        badges: [],
        currency: 'USD',
        currentStreak: 0,
        longestStreak: 0,
        lastTransactionDate: null,
        budget: {
          amount: 0,
          period: 'monthly',
          categoryLimits: {}
        },
        accounts: [
          { id: 'default-cash', name: 'Cash', type: 'cash', color: '#10b981' },
          { id: 'default-bank', name: 'Bank Account', type: 'bank', color: '#3b82f6' }
        ],
        hasCompletedTour: false // New users get the tour
      });
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-white text-center animate-fade-in max-w-md mx-auto">
      <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mb-6 shadow-brand-100 shadow-xl">
        <Icons.Sparkles className="w-8 h-8" />
      </div>
      
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Spendsense</h1>
      <p className="text-gray-500 mb-12">Master your money with AI.</p>

      {step === 1 && (
        <div className="w-full space-y-6 animate-slide-up">
          <div className="text-left">
            <label className="block text-sm font-medium text-gray-500 mb-2">What should we call you?</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-none text-lg text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              placeholder="Enter your name"
              autoFocus
            />
          </div>
          <button 
            onClick={handleNext}
            disabled={!name.trim()}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg disabled:opacity-50 active:scale-[0.98] transition-all"
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="w-full space-y-6 animate-slide-up">
          <h2 className="text-xl font-semibold text-slate-800">Pick an avatar</h2>
          <div className="grid grid-cols-4 gap-4">
            {defaultAvatars.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedAvatar(item.emoji)}
                className={`text-4xl p-4 rounded-2xl transition-all ${
                  selectedAvatar === item.emoji
                    ? 'bg-brand-100 ring-2 ring-brand-500 scale-110' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {item.emoji}
              </button>
            ))}
          </div>
          <button 
            onClick={handleNext}
            className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-brand-200 active:scale-[0.98] transition-all"
          >
            Get Started
          </button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
