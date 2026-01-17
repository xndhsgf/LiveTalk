
import React from 'react';
import { 
  Home, Wallet, ShoppingBag, CreditCard, LogOut, ChevronLeft, Heart, User, ShieldCheck, PlusCircle, Settings, MessageCircle, Fingerprint
} from 'lucide-react';
import { ViewType, UserState, AppConfig } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  setView: (view: ViewType) => void;
  user: UserState;
  setUser: React.Dispatch<React.SetStateAction<UserState>>;
  appConfig: AppConfig;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, setView, user, setUser, appConfig, onLogout }) => {
  const menuItems = [
    { id: 'home', label: 'الرئيسية', icon: <Home size={18} />, color: 'text-green-500' },
    { id: 'recharge', label: 'إضافة رصيد', icon: <CreditCard size={18} />, color: 'text-blue-400' },
    // تم إزالة سلة المشتريات من هنا بناءً على طلب العميل
    { id: 'wallet', label: 'محفظتي', icon: <Wallet size={18} />, color: 'text-yellow-500' },
    { id: 'orders', label: 'طلباتي', icon: <ShoppingBag size={18} />, color: 'text-red-400' },
    { id: 'protection', label: 'الحماية', icon: <ShieldCheck size={18} />, color: 'text-green-400' },
  ];

  if (user.isAdmin) {
    menuItems.push({ id: 'admin', label: 'لوحة التحكم', icon: <Settings size={18} />, color: 'text-indigo-600' });
  }

  const handleWhatsApp = () => {
    if (appConfig.whatsappNumber) {
      const cleanNumber = appConfig.whatsappNumber.replace(/\+/g, '').replace(/\s/g, '');
      window.open(`https://wa.me/${cleanNumber}`, '_blank');
    } else {
      alert('لم يتم تحديد رقم واتساب');
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] transition-opacity backdrop-blur-sm" onClick={onClose} />
      )}
      
      <div className={`fixed top-0 right-0 h-full w-[85%] max-w-[310px] bg-white/95 backdrop-blur-md z-[110] transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto shadow-2xl no-scrollbar`}>
        {/* Header Section - Micro Compact */}
        <div className="p-2 flex flex-col items-center">
           <div className="w-full flex justify-between items-center mb-0 px-1">
             <div className="w-6 h-6 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 p-0.5 shadow-sm">
                <img src={appConfig.logoUrl} alt="App Logo" className="w-full h-full object-contain" />
             </div>
             <button onClick={onClose} className="w-6 h-6 flex items-center justify-center bg-slate-50 rounded-full text-slate-400">
               <ChevronLeft size={16} />
             </button>
           </div>
           
           <div onClick={() => { setView('profile_edit'); onClose(); }} className="flex flex-col items-center cursor-pointer group w-full">
             <div className="relative mb-1 mt-1">
               <div className="w-12 h-12 rounded-full border-[2px] border-yellow-400 overflow-hidden p-0.5 bg-white shadow-md">
                  <img src={user.profilePic} alt="User" className="w-full h-full object-cover rounded-full" />
               </div>
               <div className="absolute bottom-0 right-0 bg-yellow-400 p-0.5 rounded-full border border-white text-slate-900 shadow-sm">
                  <User size={6} fill="currentColor" />
               </div>
             </div>

             <div className="bg-slate-50 px-2 py-0.5 rounded-full flex items-center gap-1 mb-1 border border-slate-100 shadow-sm">
                <span className="text-yellow-500 text-[6px]">★</span>
                <span className="text-[7px] font-black text-slate-600 uppercase">VIP {user.vip}</span>
             </div>

             <h3 className="font-black text-slate-900 text-sm mb-1 text-center px-4 leading-tight">{user.name}</h3>

             {/* Account ID Badge - Micro Slim */}
             <div className="bg-[#0c0f17] text-white py-1 px-3 rounded-lg shadow-md w-[110px] relative overflow-hidden active:scale-95 transition-all">
                <div className="flex flex-col items-center">
                  <span className="text-[5px] font-black text-yellow-400 uppercase tracking-widest mb-0">ID</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-black tracking-widest">{user.id}</span>
                    <div className="bg-yellow-400 text-[#0c0f17] p-0.5 rounded-md">
                      <Fingerprint size={8} />
                    </div>
                  </div>
                </div>
             </div>
           </div>

           {/* Balance Section - Micro Slim */}
           <div className="flex flex-col items-center mt-2 mb-2">
              <div className="flex items-center gap-1">
                <span className="text-[#00c98b] font-black text-lg tracking-tighter drop-shadow-sm">${user.balanceUSD.toLocaleString()}</span>
                <div className="w-4 h-2.5 bg-white rounded shadow-sm overflow-hidden border border-slate-100 flex items-center justify-center p-0.5">
                   <img src="https://flagcdn.com/w40/us.png" className="w-full h-full object-cover" alt="US" />
                </div>
              </div>
              <p className="text-[5px] font-black text-slate-300 uppercase tracking-widest">Available Balance</p>
           </div>

           {/* Action Buttons - Micro Row */}
           <div className="grid grid-cols-2 gap-2 w-full mb-2 px-1">
              <button 
                onClick={() => { setView('recharge'); onClose(); }}
                className="h-8 bg-[#0c0f17] text-white rounded-lg font-black text-[9px] flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
              >
                <PlusCircle size={10} className="text-yellow-400" /> 
                <span>شحن</span>
              </button>
              <button 
                onClick={handleWhatsApp}
                className="h-8 bg-[#25D366] text-white rounded-lg font-black text-[9px] flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
              >
                <MessageCircle size={10} /> 
                <span>واتساب</span>
              </button>
           </div>

           {/* Secondary Icons - Micro Minimal */}
           <div className="flex justify-between w-full px-6 py-1.5 bg-slate-50/50 rounded-xl border border-slate-100 mb-1">
              <button className="text-slate-300 active:text-red-500 transition-colors"><Heart size={14} /></button>
              <button className="text-slate-800" onClick={() => { setView('cart'); onClose(); }}><ShoppingBag size={14} /></button>
              <button className="text-slate-300 active:text-red-600 transition-colors" onClick={onLogout}><LogOut size={14} /></button>
           </div>
        </div>

        {/* Menu Items - Optimized Spacing */}
        <div className="py-0.5 space-y-0.5">
          {menuItems.map((item, idx) => (
            <button
              key={`${item.id}-${idx}`}
              onClick={() => { setView(item.id as ViewType); onClose(); }}
              className={`w-full flex items-center gap-3 px-6 py-2 hover:bg-slate-50 transition-all flex-row-reverse group`}
            >
              <div className={`${item.color} p-1 bg-slate-50 rounded-lg group-hover:bg-white transition-all`}>{item.icon}</div>
              <span className="flex-1 text-right text-[10px] font-black text-slate-700 group-hover:text-slate-900">{item.label}</span>
            </button>
          ))}
          
          <div className="px-6 mt-2 pb-4">
            <button
              onClick={onLogout}
              className="w-full h-8 flex items-center gap-3 px-4 bg-red-50 text-red-600 rounded-lg font-black text-[9px] border border-red-100/50 active:scale-95 transition-all flex-row-reverse"
            >
              <LogOut size={12} />
              <span className="flex-1 text-right">خروج</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
