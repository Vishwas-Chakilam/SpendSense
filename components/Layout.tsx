
import React from 'react';
import { View } from '../types';
import { Icons } from './Icons';

interface Props {
  currentView: View;
  onChangeView: (view: View) => void;
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ currentView, onChangeView, children }) => {
  return (
    <div className="flex flex-col h-full bg-gray-50 max-w-md mx-auto relative shadow-2xl overflow-hidden">
      {/* Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 no-scrollbar">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav id="main-nav" className="absolute bottom-6 left-4 right-4 bg-white/90 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-2 flex justify-around items-center z-40">
        <NavButton 
          id="nav-home"
          active={currentView === View.DASHBOARD} 
          onClick={() => onChangeView(View.DASHBOARD)} 
          icon={<Icons.Home />} 
          label="Home"
        />
        <NavButton 
          id="nav-transactions"
          active={currentView === View.TRANSACTIONS} 
          onClick={() => onChangeView(View.TRANSACTIONS)} 
          icon={<Icons.List />} 
          label="Transactions"
        />
        <NavButton 
          id="nav-analytics"
          active={currentView === View.ANALYTICS} 
          onClick={() => onChangeView(View.ANALYTICS)} 
          icon={<Icons.Chart />} 
          label="Insights"
        />
        <NavButton 
          id="nav-profile"
          active={currentView === View.PROFILE} 
          onClick={() => onChangeView(View.PROFILE)} 
          icon={<Icons.User />} 
          label="Profile"
        />
      </nav>
    </div>
  );
};

const NavButton = ({ id, active, onClick, icon, label }: { id?: string; active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button 
    id={id}
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 flex-1 ${
      active ? 'text-brand-600 bg-brand-50 scale-105' : 'text-gray-400 hover:text-gray-600'
    }`}
  >
    <div className={`w-5 h-5 mb-1 ${active ? 'stroke-[2.5px]' : 'stroke-[2px]'}`}>
      {icon}
    </div>
    <span className="text-[9px] font-medium">{label}</span>
  </button>
);

export default Layout;
