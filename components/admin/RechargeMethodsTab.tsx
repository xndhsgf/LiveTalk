
import React, { useState } from 'react';
import { PlusCircle, Camera, Trash2, CreditCard, Info, User, DollarSign } from 'lucide-react';
import { RechargeMethod } from '../../types';

interface RechargeMethodsTabProps {
  rechargeMethods: RechargeMethod[];
  setRechargeMethod: (id: string | null, data: any) => Promise<any>;
  deleteRechargeMethod: (id: string) => Promise<void>;
}

const RechargeMethodsTab: React.FC<RechargeMethodsTabProps> = ({ rechargeMethods, setRechargeMethod, deleteRechargeMethod }) => {
  const [newMethod, setNewMethod] = useState({
    label: '',
    icon: '',
    color: 'from-blue-600 to-indigo-700',
    iban: '',
    recipientName: '',
    instructions: '',
    currencyIcon: '💰'
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewMethod({ ...newMethod, icon: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async () => {
    if (!newMethod.label || !newMethod.icon || !newMethod.iban) return alert('يرجى إكمال البيانات الأساسية (الاسم، الأيقونة، الحساب)!');
    await setRechargeMethod(null, newMethod);
    alert('تم إضافة طريقة الشحن بنجاح ✅');
    setNewMethod({
      label: '',
      icon: '',
      color: 'from-blue-600 to-indigo-700',
      iban: '',
      recipientName: '',
      instructions: '',
      currencyIcon: '💰'
    });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* نموذج إضافة طريقة جديدة */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-md border border-slate-100 space-y-4">
        <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
          <PlusCircle size={18} className="text-blue-500" /> إضافة طريقة شحن جديدة
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="w-full h-32 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden group">
            {newMethod.icon ? (
              <img src={newMethod.icon} className="h-full w-full object-contain p-4" />
            ) : (
              <div className="text-center">
                <Camera className="text-slate-300 mx-auto" size={32} />
                <span className="text-[10px] text-slate-400 font-bold block mt-1">أيقونة الطريقة</span>
              </div>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </label>

          <div className="space-y-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="اسم الطريقة (مثال: فودافون كاش)" 
                value={newMethod.label} 
                onChange={(e) => setNewMethod({...newMethod, label: e.target.value})} 
                className="w-full h-12 bg-slate-50 rounded-xl px-4 pr-10 text-right font-bold border border-slate-100 focus:border-blue-400 outline-none" 
              />
              <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            </div>

            <div className="relative">
              <input 
                type="text" 
                placeholder="رقم الحساب / IBAN" 
                value={newMethod.iban} 
                onChange={(e) => setNewMethod({...newMethod, iban: e.target.value})} 
                className="w-full h-12 bg-slate-50 rounded-xl px-4 pr-10 text-right font-bold border border-slate-100 focus:border-blue-400 outline-none" 
              />
              <Info className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="اسم المستلم" 
              value={newMethod.recipientName} 
              onChange={(e) => setNewMethod({...newMethod, recipientName: e.target.value})} 
              className="w-full h-12 bg-slate-50 rounded-xl px-4 pr-10 text-right font-bold border border-slate-100 focus:border-blue-400 outline-none" 
            />
            <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="أيقونة العملة (مثال: 🇪🇬)" 
              value={newMethod.currencyIcon} 
              onChange={(e) => setNewMethod({...newMethod, currencyIcon: e.target.value})} 
              className="w-full h-12 bg-slate-50 rounded-xl px-4 pr-10 text-right font-bold border border-slate-100 focus:border-blue-400 outline-none" 
            />
            <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          </div>
        </div>

        <textarea 
          placeholder="تعليمات الشحن للعميل..." 
          value={newMethod.instructions} 
          onChange={(e) => setNewMethod({...newMethod, instructions: e.target.value})} 
          className="w-full h-24 bg-slate-50 rounded-2xl p-4 text-right font-bold text-xs border border-slate-100 focus:border-blue-400 outline-none resize-none"
        />

        <button onClick={handleAdd} className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 active:scale-95 transition-all">
          إضافة الطريقة
        </button>
      </div>

      {/* عرض الطرق الحالية */}
      <div className="grid grid-cols-2 gap-4">
        {rechargeMethods.map((method) => (
          <div key={method.id} className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm relative group">
            <div className={`w-full h-24 rounded-2xl bg-gradient-to-br ${method.color || 'from-slate-100 to-slate-200'} flex items-center justify-center p-4 mb-3`}>
              <img src={method.icon} className="max-h-full max-w-full object-contain drop-shadow-md" alt={method.label} />
            </div>
            <div className="text-center px-1">
              <p className="font-black text-xs text-slate-800 truncate">{method.label}</p>
              <p className="text-[9px] font-bold text-slate-400 mt-1 truncate">{method.iban}</p>
            </div>
            <button 
              onClick={() => confirm('هل تريد حذف طريقة الشحن هذه؟') && deleteRechargeMethod(method.id)} 
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RechargeMethodsTab;
