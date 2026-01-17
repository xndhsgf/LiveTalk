
import React from 'react';
import { BarChart3, Users, ShoppingCart, TrendingUp } from 'lucide-react';

interface StatsTabProps {
  totalUsers: number;
  totalOrders: number;
}

const StatsTab: React.FC<StatsTabProps> = ({ totalUsers, totalOrders }) => {
  return (
    <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center gap-2">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
          <Users size={24} />
        </div>
        <div>
          <span className="text-2xl font-black text-slate-800">{totalUsers}</span>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">عضو مسجل</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center gap-2">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
          <ShoppingCart size={24} />
        </div>
        <div>
          <span className="text-2xl font-black text-slate-800">{totalOrders}</span>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">إجمالي الطلبات</p>
        </div>
      </div>

      <div className="col-span-2 bg-slate-900 p-6 rounded-[2.5rem] shadow-xl flex items-center justify-between overflow-hidden relative">
         <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl"></div>
         <div className="relative z-10">
            <h3 className="text-white font-black text-sm">أداء المنصة</h3>
            <p className="text-yellow-400 text-[10px] font-bold">النظام يعمل بكفاءة عالية 100%</p>
         </div>
         <TrendingUp className="text-yellow-400 relative z-10" size={32} />
      </div>
    </div>
  );
};

export default StatsTab;
