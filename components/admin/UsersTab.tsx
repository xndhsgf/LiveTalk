
import React, { useState } from 'react';
import { UserX, Wallet, UserCheck, Trash2, RotateCcw, Search, ShieldAlert, Mail, X, PlusCircle, DollarSign, ShieldCheck, Star, Plus, Minus, Edit3 } from 'lucide-react';
import { UserState } from '../../types';

interface UsersTabProps {
  allUsers: UserState[];
  updateAnyUser: (email: string, data: any) => Promise<void>;
  deleteAnyUser: (email: string) => Promise<void>;
}

const UsersTab: React.FC<UsersTabProps> = ({ allUsers, updateAnyUser, deleteAnyUser }) => {
  const [search, setSearch] = useState('');
  const [rechargeModal, setRechargeModal] = useState<{ isOpen: boolean; user: UserState | null }>({
    isOpen: false,
    user: null
  });
  const [rechargeAmount, setRechargeAmount] = useState('');

  const filtered = allUsers.filter(u => 
    (u.name?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (u.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (u.id || '').includes(search)
  );

  const handleBlock = async (user: UserState) => {
    if (user.email === 'admin@royal.com') {
      alert('لا يمكن حظر حساب المدير العام الرئيسي!');
      return;
    }
    const action = user.isBlocked ? 'إلغاء حظر' : 'حظر';
    if (confirm(`هل أنت متأكد من ${action} المستخدم ${user.name}؟`)) {
      await updateAnyUser(user.email, { isBlocked: !user.isBlocked });
      alert(`تم ${action} الحساب بنجاح ✅`);
    }
  };

  const handleUpdateID = async (user: UserState) => {
    const newID = prompt(`تعديل ID المستخدم: ${user.name}`, user.id);
    if (newID === null) return;
    
    const cleanID = newID.trim();
    if (!cleanID) {
      alert("الـ ID لا يمكن أن يكون فارغاً");
      return;
    }

    // التحقق إذا كان الـ ID مستخدماً بالفعل من قبل شخص آخر
    const isIdTaken = allUsers.some(u => u.id === cleanID && u.email !== user.email);
    if (isIdTaken) {
      alert("⚠️ هذا الـ ID مستخدم بالفعل من قبل عضو آخر! يرجى اختيار معرف فريد.");
      return;
    }

    try {
      await updateAnyUser(user.email, { id: cleanID });
      alert('تم تحديث الـ ID بنجاح ✅');
    } catch (error) {
      alert('حدث خطأ أثناء تحديث الـ ID');
    }
  };

  const handleUpdateVIP = async (user: UserState, increment: boolean) => {
    const currentVIP = user.vip || 1;
    const newVIP = increment ? currentVIP + 1 : Math.max(1, currentVIP - 1);
    
    if (newVIP === currentVIP) return;

    try {
      await updateAnyUser(user.email, { vip: newVIP });
    } catch (error) {
      alert('حدث خطأ أثناء تحديث VIP');
    }
  };

  const handleDelete = async (user: UserState) => {
    if (user.email === 'admin@royal.com') {
      alert('⚠️ خطر: لا يمكن حذف حساب المدير العام الرئيسي نهائياً.');
      return;
    }
    if (confirm(`⚠️ تحذير: هل أنت متأكد من حذف حساب ${user.name} نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      await deleteAnyUser(user.email);
      alert('تم حذف الحساب نهائياً ✅');
    }
  };

  const handleResetBalance = async (user: UserState) => {
    if (confirm(`هل أنت متأكد من تصفير رصيد ${user.name}؟ سيصبح رصيده $0.00`)) {
      await updateAnyUser(user.email, { balanceUSD: 0 });
      alert('تم تصفير الرصيد بنجاح ✅');
    }
  };

  const executeRecharge = async () => {
    if (!rechargeModal.user || !rechargeAmount || isNaN(parseFloat(rechargeAmount))) {
      alert('يرجى إدخال مبلغ صحيح');
      return;
    }

    const amount = parseFloat(rechargeAmount);
    const newBalance = (rechargeModal.user.balanceUSD || 0) + amount;
    
    try {
      await updateAnyUser(rechargeModal.user.email, { balanceUSD: newBalance });
      alert(`تم إضافة $${amount} لرصيد ${rechargeModal.user.name} بنجاح ✅`);
      setRechargeModal({ isOpen: false, user: null });
      setRechargeAmount('');
    } catch (error) {
      alert('حدث خطأ أثناء الشحن');
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* شريط البحث */}
      <div className="relative group">
        <input 
          type="text" 
          placeholder="ابحث عن عضو (اسم، بريد، ID)..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="w-full h-16 bg-white border border-slate-200 rounded-[2rem] px-6 pr-14 text-right font-bold outline-none focus:border-yellow-400 focus:shadow-lg focus:shadow-yellow-400/10 transition-all shadow-sm" 
        />
        <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-yellow-500 transition-colors" size={24} />
      </div>

      <div className="space-y-4">
        {filtered.length > 0 ? filtered.map(u => (
          <div key={u.email} className={`bg-white p-5 rounded-[2.5rem] shadow-sm border ${u.isBlocked ? 'border-red-100 bg-red-50/20' : u.email === 'admin@royal.com' ? 'border-amber-200 shadow-md' : 'border-slate-100'} transition-all hover:shadow-md relative`}>
            
            {u.email === 'admin@royal.com' && (
              <div className="absolute top-4 left-4 text-amber-500 animate-pulse">
                <ShieldCheck size={20} />
              </div>
            )}

            {/* معلومات العضو */}
            <div className="flex items-center justify-between mb-5 border-b border-slate-50 pb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={u.profilePic || 'https://picsum.photos/seed/user/200'} 
                    className={`w-14 h-14 rounded-2xl object-cover border-2 ${u.isBlocked ? 'border-red-400' : u.email === 'admin@royal.com' ? 'border-amber-400 shadow-lg shadow-amber-200/50' : 'border-slate-100 shadow-sm'}`} 
                    alt={u.name} 
                  />
                  {u.isBlocked && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-lg">
                      <ShieldAlert size={12} />
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm text-slate-800">{u.name}</h4>
                    <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-lg group/id border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-black">ID: {u.id}</span>
                      <button 
                        onClick={() => handleUpdateID(u)}
                        className="p-1 hover:text-indigo-500 transition-colors text-slate-400"
                        title="تعديل ID المستخدم"
                      >
                        <Edit3 size={11} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 mt-1">
                    <Mail size={10} />
                    <span className="text-[10px] font-bold">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                     <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-100">
                        <Star size={10} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-[10px] font-black text-yellow-700">VIP {u.vip || 1}</span>
                     </div>
                     <div className="flex gap-1">
                        <button onClick={() => handleUpdateVIP(u, true)} className="p-1 bg-slate-100 rounded-md hover:bg-yellow-400 hover:text-white transition-colors"><Plus size={10}/></button>
                        <button onClick={() => handleUpdateVIP(u, false)} className="p-1 bg-slate-100 rounded-md hover:bg-red-400 hover:text-white transition-colors"><Minus size={10}/></button>
                     </div>
                  </div>
                </div>
              </div>
              <div className="text-left bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">الرصيد</p>
                <span className="text-lg font-black text-emerald-600">${(u.balanceUSD || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* أزرار التحكم */}
            <div className="grid grid-cols-4 gap-2">
              <button 
                onClick={() => setRechargeModal({ isOpen: true, user: u })}
                className="flex flex-col items-center justify-center gap-1 py-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 active:scale-90 transition-all border border-emerald-100"
              >
                <Wallet size={18} />
                <span className="text-[9px] font-black uppercase">شحن</span>
              </button>

              <button 
                onClick={() => handleResetBalance(u)}
                disabled={u.email === 'admin@royal.com'}
                className={`flex flex-col items-center justify-center gap-1 py-3 bg-amber-50 text-amber-600 rounded-2xl hover:bg-amber-100 active:scale-90 transition-all border border-amber-100 ${u.email === 'admin@royal.com' ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
              >
                <RotateCcw size={18} />
                <span className="text-[9px] font-black uppercase">تصفير</span>
              </button>

              <button 
                onClick={() => handleBlock(u)}
                disabled={u.email === 'admin@royal.com'}
                className={`flex flex-col items-center justify-center gap-1 py-3 rounded-2xl active:scale-90 transition-all border ${u.email === 'admin@royal.com' ? 'bg-slate-50 text-slate-200 border-slate-100 cursor-not-allowed' : (u.isBlocked ? 'bg-slate-900 text-yellow-400 border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-100')}`}
              >
                {u.isBlocked ? <UserCheck size={18} /> : <UserX size={18} />}
                <span className="text-[9px] font-black uppercase">{u.isBlocked ? 'فك حظر' : 'حظر'}</span>
              </button>

              <button 
                onClick={() => handleDelete(u)}
                disabled={u.email === 'admin@royal.com'}
                className={`flex flex-col items-center justify-center gap-1 py-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 active:scale-90 transition-all border border-red-100 ${u.email === 'admin@royal.com' ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
              >
                <Trash2 size={18} />
                <span className="text-[9px] font-black uppercase">حذف</span>
              </button>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <Search size={48} className="mb-4 text-slate-300" />
            <p className="font-black text-slate-400">لا توجد نتائج بحث</p>
          </div>
        )}
      </div>

      {/* نافذة شحن الرصيد (Recharge Modal) */}
      {rechargeModal.isOpen && rechargeModal.user && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setRechargeModal({ isOpen: false, user: null })} />
          
          <div className="relative w-full max-w-[400px] bg-white rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <button onClick={() => setRechargeModal({ isOpen: false, user: null })} className="p-2 bg-slate-100 text-slate-400 rounded-xl">
                  <X size={20} />
                </button>
                <div className="text-right">
                   <h3 className="text-slate-800 font-black text-lg">شحن رصيد مستخدم</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">إضافة دولارات إلى المحفظة</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-3xl p-4 flex items-center justify-between mb-8 border border-slate-100">
                 <div className="flex items-center gap-3">
                    <img src={rechargeModal.user.profilePic} className="w-10 h-10 rounded-xl object-cover" alt="" />
                    <div className="text-right">
                       <p className="font-black text-xs text-slate-800">{rechargeModal.user.name}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase">الرصيد الحالي: ${rechargeModal.user.balanceUSD.toFixed(2)}</p>
                    </div>
                 </div>
                 <Wallet className="text-yellow-500" size={24} />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[5, 10, 50, 100].map(amt => (
                    <button 
                      key={amt}
                      onClick={() => setRechargeAmount(amt.toString())}
                      className="py-2 bg-slate-100 rounded-xl text-xs font-black text-slate-600 hover:bg-yellow-400 hover:text-slate-900 transition-colors"
                    >
                      +${amt}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-4">أدخل المبلغ يدوياً ($)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-16 bg-slate-50 rounded-2xl px-6 text-center font-black text-emerald-600 border-2 border-slate-100 outline-none focus:border-yellow-400 transition-all text-2xl"
                    />
                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                   <button 
                    onClick={executeRecharge}
                    className="flex-1 h-16 bg-slate-900 text-yellow-400 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                   >
                    <PlusCircle size={20}/> تأكيد الإضافة
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
