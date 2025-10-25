import React, { useState } from 'react';
import { View, Roommate } from '../types';
import { DashboardIcon, ExpensesIcon, WishlistIcon, InsightsIcon, RoommatesIcon, LassoIcon } from './icons/Icons';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
  currentUser: Roommate | null;
  roommates: Roommate[];
  setCurrentUser: (user: Roommate | null) => void;
}

const NavItem: React.FC<{
  label: string;
  viewName: View;
  currentView: View;
  setView: (view: View) => void;
  children: React.ReactNode;
}> = ({ label, viewName, currentView, setView, children }) => {
  const isActive = currentView === viewName;
  return (
    <button
      onClick={() => setView(viewName)}
      className={`flex items-center w-full px-4 py-3 text-left transition-all duration-300 ${
        isActive
          ? 'bg-neon-orange/20 text-neon-orange border-r-4 border-neon-orange'
          : 'text-stardust hover:bg-space-light/50'
      }`}
    >
      {children}
      <span className="ml-4 font-orbitron">{label}</span>
    </button>
  );
};

const Header: React.FC<HeaderProps> = ({ currentView, setView, currentUser, roommates, setCurrentUser }) => {
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSwitchUser = (user: Roommate) => {
    setCurrentUser(user);
    setIsSwitching(false);
  }

  return (
    <header className="bg-space-medium/50 backdrop-blur-sm md:fixed md:w-64 md:h-screen flex flex-col border-r border-space-light/30 z-20">
      <div className="p-6 border-b border-space-light/30 flex items-center justify-center md:justify-start">
        <LassoIcon className="w-8 h-8 text-neon-orange" />
        <h1 className="ml-3 text-2xl font-bold font-orbitron text-stardust">CosmoCash</h1>
      </div>

      <nav className="flex-grow">
        <ul className="flex flex-row justify-around md:flex-col md:mt-6">
          <NavItem label="Dashboard" viewName="dashboard" currentView={currentView} setView={setView}>
            <DashboardIcon className="w-6 h-6" />
          </NavItem>
          <NavItem label="Expenses" viewName="expenses" currentView={currentView} setView={setView}>
            <ExpensesIcon className="w-6 h-6" />
          </NavItem>
          <NavItem label="Wishlist" viewName="wishlist" currentView={currentView} setView={setView}>
            <WishlistIcon className="w-6 h-6" />
          </NavItem>
          <NavItem label="Insights" viewName="insights" currentView={currentView} setView={setView}>
            <InsightsIcon className="w-6 h-6" />
          </NavItem>
          <NavItem label="Roommates" viewName="roommates" currentView={currentView} setView={setView}>
            <RoommatesIcon className="w-6 h-6" />
          </NavItem>
        </ul>
      </nav>

      {currentUser && (
        <div className="p-4 border-t border-space-light/30 mt-auto relative">
            <div className="flex items-center cursor-pointer" onClick={() => setIsSwitching(!isSwitching)}>
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full border-2 border-neon-cyan" />
                <div className="ml-3 flex-grow">
                    <p className="font-bold text-stardust">{currentUser.name}</p>
                    <p className="text-xs text-stardust/70">Tap to switch view</p>
                </div>
                <svg className={`w-5 h-5 text-stardust/70 transition-transform ${isSwitching ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            {isSwitching && (
                <div className="absolute bottom-full mb-2 w-full bg-space-light rounded-md shadow-lg border border-space-light/50">
                    {roommates.map(r => (
                        <button key={r.id} onClick={() => handleSwitchUser(r)} className="flex items-center w-full p-2 hover:bg-space-medium text-left">
                            <img src={r.avatarUrl} alt={r.name} className="w-8 h-8 rounded-full"/>
                            <span className="ml-2 text-sm">{r.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
      )}
    </header>
  );
};

export default Header;