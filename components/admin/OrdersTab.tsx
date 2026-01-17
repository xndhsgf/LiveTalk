
import React, { useState } from 'react';
import { ShoppingCart, User, Copy, Check, Trash2, Clock, MessageSquare } from 'lucide-react';
import { Order, UserState } from '../../types';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface OrdersTabProps {
  orders: Order[];
  allUsers: UserState[];
  onUpdateOrder: (orderId: string, status: 'completed' | 'rejected', reply: string) => void;
}

const OrdersTab: React.FC<OrdersTabProps> = ({ orders, allUsers, onUpdateOrder }) => {
  const [replies, setReplies] = useState<Record<string, string>>({});

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert('تم نسخ الـ ID بنجاح ✅');
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطلب نهائياً من السجلات؟')) {
      try {
        await deleteDoc(doc(db, "orders", orderId));
        alert('تم حذف الطلب بنجاح ✅');
      } catch (error) {
        alert('حدث خطأ أثناء الحذف');
      }
    }
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-40">
        <ShoppingCart size={48} className="mb-4 text-slate-300" />
        <p className="font-black text-slate-400">لا توجد طلبات حالياً</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((o) => {
        const siteUser = allUsers.find(u => u.email?.toLowerCase().trim() === o.userId?.toLowerCase().trim());
        
        return (
          <div key={o.id} className="bg-white p-5 rounded-[2.5rem] shadow-md border border-slate-100 space-y-4 animate-in slide-in-from-bottom-2 relative overflow-hidden group">
            
            {/* زر الحذف العلوي - مكان النقطة الحمراء */}
            <div className="flex justify-center -mt-2 mb-2">
              <button 
                onClick={() => handleDeleteOrder(o.id)}
                className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 active:scale-90 transition-all hover:bg-red-600"
                title="حذف الطلب نهائياً"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* رأس الطلب */}
            <div className="flex justify-between items-start border-b border-slate-50 pb-4">
              <div className="text-right">
                <h4 className="font-black text-base text-slate-800">{o.productName || 'طلب شحن'}</h4>
                <p className="text-[10px] text-slate-400 font-bold">{o.date ? new Date(o.date).toLocaleString('ar-EG') : 'تاريخ غير معروف'}</p>
              </div>
              <div className="text-left flex flex-col items-end">
                <span className="text-lg font-black text-emerald-600">${(o.priceUSD || 0).toFixed(2)}</span>
                <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full mt-1 ${o.status === 'completed' ? 'bg-green-100 text-green-600' : o.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                  {o.status === 'completed' ? 'مكتمل' : o.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                </span>
              </div>
            </div>

            {/* بيانات العميل في الموقع */}
            <div className="bg-slate-50 rounded-3xl p-4 flex items-center justify-between border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                  <User size={20} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">صاحب الحساب</p>
                  <h5 className="font-black text-xs text-slate-800">
                    {siteUser?.name || 'غير متوفر'} <span className="text-indigo-500 mr-1">#{siteUser?.id || '---'}</span>
                  </h5>
                </div>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase">الكمية المطلوبة</p>
                <span className="text-sm font-black text-indigo-600">{(o.coinsAmount || 0).toLocaleString()} كوينز</span>
              </div>
            </div>

            {/* بيانات الشحن (آي دي اللاعب) */}
            {o.playerId && (
              <div className="bg-slate-900 text-white rounded-3xl p-4 flex items-center justify-between shadow-lg">
                <div className="text-right">
                  <p className="text-[9px] font-black text-yellow-400 uppercase tracking-widest mb-1">آي دي اللاعب للشحن (Game ID)</p>
                  <span className="text-xl font-black tracking-wider">{o.playerId}</span>
                </div>
                <button 
                  onClick={() => handleCopy(o.playerId || '')}
                  className="p-3 bg-white/10 hover:bg-white/30 rounded-2xl active:scale-90 transition-all text-yellow-400"
                >
                  <Copy size={20} />
                </button>
              </div>
            )}

            {/* الرد والتحكم الإداري */}
            {o.status === 'pending' && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase px-2 flex items-center gap-1">
                    <MessageSquare size={12} /> اكتب رسالة رد للعميل
                  </label>
                  <textarea 
                    value={replies[o.id] || ''}
                    onChange={(e) => setReplies({...replies, [o.id]: e.target.value})}
                    placeholder="مثال: تم الشحن بنجاح ✅"
                    className="w-full h-20 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-right font-bold text-slate-700 outline-none focus:border-yellow-400 resize-none transition-all text-xs"
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => onUpdateOrder(o.id, 'completed', replies[o.id] || 'تم تنفيذ طلبك بنجاح ✅')}
                    className="flex-1 h-12 bg-emerald-500 text-white rounded-xl font-black text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Check size={16}/> تأكيد وشحن
                  </button>
                  <button 
                    onClick={() => {
                      const reason = prompt('سبب الرفض:');
                      if(reason) onUpdateOrder(o.id, 'rejected', reason);
                    }}
                    className="flex-1 h-12 bg-red-500 text-white rounded-xl font-black text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16}/> رفض الطلب
                  </button>
                </div>
              </div>
            )}

            {o.adminReply && o.status !== 'pending' && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">الرد المرسل للعميل:</p>
                <p className="text-xs font-bold text-slate-600">{o.adminReply}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrdersTab;
