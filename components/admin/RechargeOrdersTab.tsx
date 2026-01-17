
import React, { useState } from 'react';
import { CreditCard, User, Check, Trash2, Image as ImageIcon, ExternalLink, MessageSquare, DollarSign, Fingerprint } from 'lucide-react';
import { Order, UserState } from '../../types';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface RechargeOrdersTabProps {
  orders: Order[];
  allUsers: UserState[];
  onUpdateOrder: (orderId: string, status: 'completed' | 'rejected', reply: string) => void;
}

const RechargeOrdersTab: React.FC<RechargeOrdersTabProps> = ({ orders, allUsers, onUpdateOrder }) => {
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const rechargeOrders = orders.filter(o => o.type === 'recharge');

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الإيداع نهائياً من السجلات؟')) {
      try {
        await deleteDoc(doc(db, "orders", orderId));
        alert('تم حذف السجل بنجاح ✅');
      } catch (error) {
        alert('حدث خطأ أثناء الحذف');
      }
    }
  };

  if (rechargeOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-40">
        <CreditCard size={48} className="mb-4 text-slate-300" />
        <p className="font-black text-slate-400">لا توجد طلبات إيداع حالياً</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {rechargeOrders.map((o) => {
        const siteUser = allUsers.find(u => u.email?.toLowerCase().trim() === o.userId?.toLowerCase().trim());
        
        return (
          <div key={o.id} className="bg-white p-5 rounded-[2.5rem] shadow-md border border-slate-100 space-y-4 relative overflow-hidden">
            
            {/* زر الحذف العلوي */}
            <div className="flex justify-center -mt-2 mb-2">
              <button 
                onClick={() => handleDeleteOrder(o.id)}
                className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 active:scale-90 transition-all hover:bg-red-600"
                title="حذف الطلب"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* رأس الطلب: المبلغ والحالة */}
            <div className="flex justify-between items-start border-b border-slate-50 pb-4">
              <div className="text-right">
                <h4 className="font-black text-base text-slate-800 flex items-center gap-2">
                   <DollarSign size={16} className="text-emerald-500" /> طلب إيداع رصيد
                </h4>
                <p className="text-[10px] text-slate-400 font-bold">{o.date ? new Date(o.date).toLocaleString('ar-EG') : 'تاريخ غير معروف'}</p>
              </div>
              <div className="text-left flex flex-col items-end">
                <span className="text-xl font-black text-emerald-600">${(o.priceUSD || 0).toFixed(2)}</span>
                <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full mt-1 ${o.status === 'completed' ? 'bg-green-100 text-green-600' : o.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                  {o.status === 'completed' ? 'مقبول' : o.status === 'rejected' ? 'مرفوض' : 'قيد التدقيق'}
                </span>
              </div>
            </div>

            {/* بطاقة تعريف المستخدم في المنصة (مطلوب) */}
            <div className="bg-indigo-50/50 rounded-3xl p-4 border border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-sm bg-white">
                  <img src={siteUser?.profilePic || 'https://picsum.photos/seed/user/100'} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">صاحب الحساب بالمنصة</p>
                  <h5 className="font-black text-sm text-slate-900 leading-none">{siteUser?.name || 'مستخدم غير معروف'}</h5>
                  <div className="flex items-center gap-1 mt-1 text-indigo-600">
                    <Fingerprint size={12} />
                    <span className="text-xs font-black tracking-widest">{siteUser?.id || '---'}</span>
                  </div>
                </div>
              </div>
              <div className="text-left">
                <span className="bg-indigo-600 text-white text-[8px] font-black px-2 py-1 rounded-lg">VIP {siteUser?.vip || 1}</span>
              </div>
            </div>

            {/* بيانات التحويل المدخلة */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
               <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-indigo-600">{o.playerId || 'غير محدد'}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase">اسم المرسل (من البنك)</p>
               </div>
            </div>

            {/* صورة التحويل */}
            {o.screenshot ? (
              <div className="relative group/img">
                <div className="w-full h-56 rounded-[2rem] overflow-hidden border-2 border-slate-100 shadow-inner bg-slate-50 cursor-pointer" onClick={() => setSelectedImg(o.screenshot!)}>
                   <img src={o.screenshot} alt="Screenshot" className="w-full h-full object-contain" />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                      <ExternalLink className="text-white" size={24} />
                      <span className="text-white text-xs font-black mr-2">اضغط للتكبير</span>
                   </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-20 bg-red-50 rounded-3xl border border-dashed border-red-200 flex items-center justify-center text-red-400 gap-2">
                 <ImageIcon size={20} />
                 <span className="text-xs font-black">لم يتم رفع صورة إثبات</span>
              </div>
            )}

            {/* الرد والتحكم */}
            {o.status === 'pending' && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase px-2 flex items-center gap-1">
                    <MessageSquare size={12} /> رسالة إدارية للعميل
                  </label>
                  <input 
                    type="text"
                    value={replies[o.id] || ''}
                    onChange={(e) => setReplies({...replies, [o.id]: e.target.value})}
                    placeholder="مثال: تم قبول الإيداع فوراً ✅"
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-right font-bold text-slate-700 outline-none focus:border-yellow-400 text-xs shadow-inner"
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => onUpdateOrder(o.id, 'completed', replies[o.id] || 'تم قبول الإيداع وإضافة الرصيد ✅')}
                    className="flex-1 h-14 bg-emerald-500 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Check size={16}/> قبول الرصيد
                  </button>
                  <button 
                    onClick={() => {
                      const reason = prompt('سبب رفض الإيداع:');
                      if(reason) onUpdateOrder(o.id, 'rejected', reason);
                    }}
                    className="flex-1 h-14 bg-red-500 text-white rounded-2xl font-black text-xs shadow-lg shadow-red-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16}/> رفض الطلب
                  </button>
                </div>
              </div>
            )}

            {/* نافذة تكبير الصورة */}
            {selectedImg && (
              <div className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setSelectedImg(null)}>
                 <img src={selectedImg} className="max-w-full max-h-[95dvh] object-contain rounded-xl shadow-2xl" alt="Zoomed" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RechargeOrdersTab;
