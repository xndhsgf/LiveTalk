
import React from 'react';
import { Search } from 'lucide-react';
import { UserState, Order, AppConfig } from '../types';

interface WalletViewProps {
  user: UserState;
  orders: Order[];
  appConfig: AppConfig;
}

const WalletView: React.FC<WalletViewProps> = ({ user, orders, appConfig }) => {
  const totalSpentUSD = orders.filter(o => o.status === 'completed' && o.type === 'product').reduce((sum, o) => sum + o.priceUSD, 0);
  const totalIncomingUSD = orders.filter(o => o.status === 'completed' && o.type === 'recharge').reduce((sum, o) => sum + o.priceUSD, 0);

  return (
    <div className="p-4 pb-32 animate-in fade-in duration-500 bg-transparent min-h-screen rtl" dir="rtl">
      <div className="mb-4">
         <h2 className="text-xl font-black text-white text-right drop-shadow-md">المحفظة (USD)</h2>
      </div>

      <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar py-2">
        <div className="bg-[#4ade80]/90 backdrop-blur-sm min-w-[140px] flex-1 p-4 rounded-2xl text-white shadow-md border border-white/10">
           <div className="flex items-center justify-center gap-1 mb-1">
             <img src="https://flagcdn.com/w20/us.png" className="w-4 h-3 object-contain rounded-sm" alt="US" />
             <span className="text-lg font-black">${user.balanceUSD.toLocaleString()}</span>
           </div>
           <p className="text-[10px] font-black text-center uppercase">رصيدك الحالي</p>
        </div>
        <div className="bg-[#f43f5e]/90 backdrop-blur-sm min-w-[140px] flex-1 p-4 rounded-2xl text-white shadow-md border border-white/10">
           <div className="flex items-center justify-center gap-1 mb-1">
             <img src="https://flagcdn.com/w20/us.png" className="w-4 h-3 object-contain rounded-sm" alt="US" />
             <span className="text-lg font-black">${totalSpentUSD.toLocaleString()}</span>
           </div>
           <p className="text-[10px] font-black text-center uppercase">إجمالي مشتريات</p>
        </div>
        <div className="bg-[#a855f7]/90 backdrop-blur-sm min-w-[140px] flex-1 p-4 rounded-2xl text-white shadow-md border border-white/10">
           <div className="flex items-center justify-center gap-1 mb-1">
             <img src="https://flagcdn.com/w20/us.png" className="w-4 h-3 object-contain rounded-sm" alt="US" />
             <span className="text-lg font-black">${totalIncomingUSD.toLocaleString()}</span>
           </div>
           <p className="text-[10px] font-black text-center uppercase">إجمالي الشحن</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-black text-white text-right text-sm px-2 drop-shadow-sm">العمليات الأخيرة</h3>
        {orders.length > 0 ? (
          orders.slice(0, 10).map(order => (
            <div key={order.id} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-between">
               <div className="text-left">
                  <p className={`font-black text-xs ${order.type === 'recharge' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {order.type === 'recharge' ? '+' : '-'}${order.priceUSD.toFixed(2)}
                  </p>
                  <p className="text-[9px] text-white/40 font-bold uppercase">{order.status}</p>
               </div>
               <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-xs text-white">{order.productName}</p>
                    <p className="text-[9px] text-white/30 font-bold">{order.date}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${order.type === 'recharge' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {order.type === 'recharge' ? '+' : '-'}
                  </div>
               </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 opacity-40">
            <p className="font-bold text-white/50">لا توجد عمليات حالية</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletView;
