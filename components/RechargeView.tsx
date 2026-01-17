
import React from 'react';
import { Search } from 'lucide-react';
import { RechargeMethod } from '../types';

interface RechargeViewProps {
  rechargeMethods: RechargeMethod[];
  onSelectMethod: (method: RechargeMethod) => void;
}

const RechargeView: React.FC<RechargeViewProps> = ({ rechargeMethods, onSelectMethod }) => {
  return (
    <div className="p-4 pb-32 animate-in fade-in duration-500 bg-transparent min-h-screen rtl" dir="rtl">
       <div className="mb-6">
         <h2 className="text-xl font-black text-white text-right drop-shadow-md uppercase tracking-tight">طرق شحن الرصيد</h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {rechargeMethods.map((method) => (
          <div 
            key={method.id} 
            onClick={() => onSelectMethod(method)}
            className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg group cursor-pointer active:scale-95 transition-all border border-white/10"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${method.color}`}>
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            </div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-right">
               <div className="w-10 h-10 bg-white rounded-lg p-1.5 shadow-md mb-2">
                  <img src={method.icon} className="w-full h-full object-contain" alt={method.label} />
               </div>
               <span className="text-white text-[9px] font-black leading-tight drop-shadow-sm text-center">
                  {method.label}
               </span>
            </div>
            
            <div className="absolute top-1 left-1 opacity-20">
               <span className="text-white font-black text-[8px]">{method.currencyIcon}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="fixed bottom-24 right-4 z-40">
         <button className="bg-[#facc15] w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-4 border-[#0f172a]">
            <Search size={24} className="text-[#0f172a]" />
         </button>
      </div>
    </div>
  );
};

export default RechargeView;
