
import React from 'react';
import { Menu, ChevronRight } from 'lucide-react';
import { ViewType, AppConfig } from '../types';

interface HeaderProps {
  onMenuClick: () => void;
  currentView: ViewType;
  onBack: () => void;
  appConfig: AppConfig;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, currentView, onBack, appConfig }) => {
  const isHome = currentView === 'home';

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] w-full max-w-lg mx-auto">
      <div 
        className="h-16 flex items-center justify-between px-4 shadow-lg border-b border-white/10"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <div className="flex items-center gap-3">
          {!isHome && (
            <button 
              onClick={handleBack} 
              className="p-1 hover:bg-white/20 rounded-full transition-all active:scale-90"
            >
              <ChevronRight size={24} className="text-white rotate-0" />
            </button>
          )}
          <div className="w-10 h-10 overflow-hidden rounded-full border border-white/30 shadow-sm bg-white/10">
            <img src={appConfig.logoUrl} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-black text-white text-base tracking-tight uppercase">
            {appConfig.appName}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick} 
            className="text-white hover:opacity-80 transition-all active:scale-95"
          >
            <Menu size={28} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
