
import React, { useState } from 'react';
import { Search, User, Zap, Save, Trash2, TrendingUp, Package, Users, ShieldCheck } from 'lucide-react';
import { UserState, Product, CustomRate } from '../../types';

interface UserRatesTabProps {
  allUsers: UserState[];
  products: Product[];
  onUpdateUser: (email: string, data: Partial<UserState>) => Promise<void>;
}

const UserRatesTab: React.FC<UserRatesTabProps> = ({ allUsers, products, onUpdateUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserState | null>(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customRateValue, setCustomRateValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // استخراج قائمة كافة المستخدمين الذين لديهم بونص مفعّل
  const usersWithCustomRates = allUsers.filter(u => u.customRates && u.customRates.length > 0);

  const handleSearch = () => {
    const found = allUsers.find(u => 
      u.id === searchTerm.trim() || 
      u.email.toLowerCase() === searchTerm.toLowerCase().trim()
    );
    if (found) {
      setSelectedUser(found);
    } else {
      alert('لم يتم العثور على المستخدم');
    }
  };

  const handleAddOrUpdateRate = async () => {
    if (!selectedUser || !selectedProductId || !customRateValue) {
      alert('يرجى اختيار المنتج وتحديد النسبة الجديدة');
      return;
    }

    setIsSaving(true);
    try {
      const currentRates = selectedUser.customRates || [];
      const existingRateIndex = currentRates.findIndex(r => r.productId === selectedProductId);
      
      let newRates: CustomRate[];
      if (existingRateIndex >= 0) {
        newRates = [...currentRates];
        newRates[existingRateIndex].customUsdToCoinRate = parseFloat(customRateValue);
      } else {
        newRates = [...currentRates, { 
          productId: selectedProductId, 
          customUsdToCoinRate: parseFloat(customRateValue) 
        }];
      }

      await onUpdateUser(selectedUser.email, { customRates: newRates });
      
      setSelectedUser({ ...selectedUser, customRates: newRates });
      setCustomRateValue('');
      alert('تم تحديث نسبة الشحن بنجاح ✅');
    } catch (e) {
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  const removeRate = async (userEmail: string, productId: string) => {
    if (!confirm('هل تريد حذف النسبة المخصصة لهذا المنتج؟')) return;

    const targetUser = allUsers.find(u => u.email === userEmail);
    if (!targetUser) return;

    const newRates = (targetUser.customRates || []).filter(r => r.productId !== productId);
    await onUpdateUser(userEmail, { customRates: newRates });
    
    if (selectedUser?.email === userEmail) {
      setSelectedUser({ ...selectedUser, customRates: newRates });
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 rtl text-right pb-32" dir="rtl">
      
      {/* 1. قسم البحث والإضافة */}
      <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 space-y-6">
        <div className="flex items-center justify-between">
           <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600 shadow-sm">
              <Zap size={28} />
           </div>
           <div className="text-right flex-1 mr-4">
              <h3 className="font-black text-slate-800 text-xl">تعيين بونص خاص</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-1">ارفع نسبة الشحن لمستخدم معين على تطبيق محدد</p>
           </div>
        </div>

        <div className="relative group">
          <input 
            type="text" 
            placeholder="ادخل الـ ID أو البريد الإلكتروني للمستخدم..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full h-16 bg-slate-50 rounded-[1.5rem] px-6 pr-12 text-right font-black border border-slate-100 outline-none focus:border-yellow-400 text-lg shadow-inner" 
          />
          <button 
            onClick={handleSearch}
            className="absolute left-2 top-2 bottom-2 px-6 bg-slate-900 text-yellow-400 rounded-xl font-black text-xs active:scale-95 transition-all"
          >
            اختيار
          </button>
        </div>

        {selectedUser && (
          <div className="animate-in zoom-in-95 duration-300 space-y-6 p-4 bg-slate-50 rounded-[2rem] border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="text-right">
                <h4 className="font-black text-slate-800">{selectedUser.name}</h4>
                <p className="text-[10px] text-slate-400 font-bold">ID: {selectedUser.id}</p>
              </div>
              <img src={selectedUser.profilePic} className="w-12 h-12 rounded-xl object-cover border border-white shadow-sm" alt="" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <select 
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  const prod = products.find(p => p.id === e.target.value);
                  if (prod) setCustomRateValue(prod.usdToCoinRate.toString());
                }}
                className="w-full h-14 bg-white rounded-xl px-4 text-right font-black border border-slate-200 outline-none focus:border-yellow-400"
              >
                <option value="">اختر التطبيق المراد تعديله</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (الأصلي: {p.usdToCoinRate})</option>
                ))}
              </select>

              <div className="relative">
                <input 
                  type="number" 
                  placeholder="النسبة المخصصة الجديدة..." 
                  value={customRateValue}
                  onChange={(e) => setCustomRateValue(e.target.value)}
                  className="w-full h-16 bg-white rounded-xl px-6 text-center font-black text-emerald-600 border border-slate-200 outline-none focus:border-emerald-500 text-xl"
                />
                <TrendingUp size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300" />
              </div>

              <button 
                onClick={handleAddOrUpdateRate}
                disabled={isSaving}
                className="w-full h-16 bg-slate-900 text-yellow-400 rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                {isSaving ? 'جاري الحفظ...' : <><Save size={20} /> حفظ النسبة للمستخدم</>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. قائمة كافة المستخدمين الذين لديهم بونص */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
           <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full">{usersWithCustomRates.length} مستخدم</span>
           <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
             <Users size={18} className="text-emerald-500" /> سجل أصحاب النسب الخاصة
           </h3>
        </div>

        {usersWithCustomRates.length > 0 ? (
          <div className="space-y-4">
            {usersWithCustomRates.map((u) => (
              <div key={u.email} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in slide-in-from-right-4">
                {/* رأس المستخدم */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-50">
                   <div className="flex items-center gap-3">
                      <div className="text-right">
                         <h5 className="font-black text-sm text-slate-800 flex items-center gap-1 justify-end">
                            {u.name} <ShieldCheck size={14} className="text-blue-500" />
                         </h5>
                         <p className="text-[10px] font-bold text-slate-400">#{u.id} | {u.email}</p>
                      </div>
                      <img src={u.profilePic} className="w-12 h-12 rounded-2xl object-cover border border-slate-100" alt="" />
                   </div>
                   <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-xl text-[9px] font-black uppercase">
                      عضو مميز
                   </div>
                </div>

                {/* قائمة تطبيقات البونص لهذا المستخدم */}
                <div className="space-y-2">
                   {u.customRates?.map((rate) => {
                     const product = products.find(p => p.id === rate.productId);
                     return (
                       <div key={rate.productId} className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100 group">
                          <button 
                            onClick={() => removeRate(u.email, rate.productId)}
                            className="p-2 bg-red-50 text-red-500 rounded-xl active:scale-90 transition-all hover:bg-red-500 hover:text-white"
                          >
                             <Trash2 size={16} />
                          </button>
                          
                          <div className="flex items-center gap-3">
                             <div className="text-right">
                                <p className="font-black text-[10px] text-slate-800">{product?.name || 'تطبيق محذوف'}</p>
                                <div className="flex items-center gap-2 mt-1">
                                   <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-lg">النسبة: {rate.customUsdToCoinRate}</span>
                                   <span className="text-[8px] font-bold text-slate-300 line-through">الأصل: {product?.usdToCoinRate}</span>
                                </div>
                             </div>
                             <div className="w-10 h-10 bg-white rounded-xl overflow-hidden border border-slate-100 p-1 flex items-center justify-center">
                                {product?.image ? (
                                  <img src={product.image} className="max-h-full max-w-full object-contain" />
                                ) : (
                                  <Package size={16} className="text-slate-200" />
                                )}
                             </div>
                          </div>
                       </div>
                     );
                   })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-[3rem] border border-dashed border-slate-200">
             <Zap size={48} className="text-slate-200 mb-4" />
             <p className="font-black text-slate-400 text-sm">لا يوجد مستخدمون بنسب خاصة حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRatesTab;
