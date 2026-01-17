
import React from 'react';
import { Home, Wallet, Bell, ShoppingBag, Search } from 'lucide-react';
import { ViewType } from '../types';

interface BottomNavProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange }) => {
  const tabs = [
    { id: 'search', icon: <Search size={22} />, label: 'بحث' },
    { id: 'orders', icon: <ShoppingBag size={22} />, label: 'طلباتي' }, // تم الربط بصفحة الطلبات كما طلبت
    { id: 'notifications', icon: <Bell size={22} />, label: 'تنبيه' },
    { id: 'wallet', icon: <Wallet size={22} />, label: 'محفظة' },
    { id: 'home', icon: <Home size={22} />, label: 'رئيسية' },
  ];

  return (
    <nav className="w-full relative shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-white/10">
      <div 
        className="h-16 w-full flex items-center justify-around px-2 relative"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {tabs.map((tab) => {
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id as ViewType)}
              className="relative flex flex-col items-center justify-center w-full h-full active:scale-95 transition-transform"
            >
              {isActive ? (
                <div className="absolute -top-7 flex flex-col items-center animate-in slide-in-from-bottom-2">
                   <div className="w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-[#facc15] transition-all">
                      <div style={{ color: 'var(--color-primary)' }}>
                        {tab.icon}
                      </div>
                   </div>
                </div>
              ) : (
                <div className="text-white/70 hover:text-white transition-colors">
                  {tab.icon}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
