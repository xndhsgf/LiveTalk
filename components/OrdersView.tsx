
import React from 'react';
import { Search, Package, CheckCircle, Clock, XCircle, MessageSquare } from 'lucide-react';
import { Order } from '../types';

interface OrdersViewProps {
  orders: Order[];
}

const OrdersView: React.FC<OrdersViewProps> = ({ orders }) => {
  return (
    <div className="p-4 pb-32 animate-in fade-in duration-500 bg-transparent min-h-screen rtl" dir="rtl">
      <div className="mb-4">
         <h2 className="text-xl font-black text-white text-right drop-shadow-md">طلباتي</h2>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-black/40 backdrop-blur-lg border border-white/10 rounded-[2rem] p-5 shadow-sm space-y-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${order.status === 'completed' ? 'bg-green-500/20 text-green-400' : order.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    <Package size={24} />
                  </div>
                  <div className="text-right">
                    <h4 className="font-black text-sm text-white">{order.productName}</h4>
                    <p className="text-[10px] text-white/60 font-black">{order.date} | #{order.id}</p>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-white font-black text-sm mb-1">${order.priceUSD.toFixed(2)}</div>
                  <div className={`flex items-center gap-1 text-[9px] font-black uppercase ${order.status === 'completed' ? 'text-green-400' : order.status === 'rejected' ? 'text-red-400' : 'text-amber-400'}`}>
                    {order.status === 'completed' ? <CheckCircle size={12} /> : order.status === 'rejected' ? <XCircle size={12} /> : <Clock size={12} />}
                    <span>{order.status === 'completed' ? 'مكتمل' : order.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-3 flex justify-around border border-white/5">
                 {order.playerId && (
                   <div className="text-center">
                      <p className="text-[9px] font-black text-white/50 mb-0.5 uppercase">آي دي اللاعب</p>
                      <p className="text-xs font-black text-white">{order.playerId}</p>
                   </div>
                 )}
                 {order.coinsAmount > 0 && (
                   <div className="text-center">
                      <p className="text-[9px] font-black text-white/50 mb-0.5 uppercase">الكمية المطلوبة</p>
                      <p className="text-xs font-black text-white">{order.coinsAmount.toLocaleString()} كوينز</p>
                   </div>
                 )}
              </div>

              {order.adminReply && (
                <div className="bg-indigo-500/10 backdrop-blur-sm p-4 rounded-2xl border border-indigo-500/20 flex gap-3 items-start">
                   <MessageSquare size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                   <div className="text-right">
                      <p className="text-[10px] font-black text-indigo-400 mb-1 uppercase tracking-wider">رد الإدارة:</p>
                      <p className="text-xs font-black text-white leading-relaxed">{order.adminReply}</p>
                   </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 opacity-40">
          <p className="font-black text-white/50">لا توجد طلبات سابقة</p>
        </div>
      )}
    </div>
  );
};

export default OrdersView;
