
import React, { useState } from 'react';
import { Save, Camera, Palette, Trash2, Megaphone, Plus, List, Type, ShieldAlert, Image as ImageIcon, Layout, Lock, Users } from 'lucide-react';
import { AppConfig } from '../../types';
import { db } from '../../lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

interface SettingsTabProps {
  appConfig: AppConfig;
  setAppConfig: (cfg: AppConfig) => Promise<void>;
  onDeleteAllOrders?: () => Promise<void>;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ appConfig, setAppConfig, onDeleteAllOrders }) => {
  const [temp, setTemp] = useState<AppConfig>({...appConfig});
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingUsers, setIsDeletingUsers] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'backgroundUrl' | 'loginBackgroundUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTemp({ ...temp, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addAnnouncement = () => {
    if (!newAnnouncement.trim()) return;
    const currentList = temp.announcements || [];
    setTemp({ ...temp, announcements: [...currentList, newAnnouncement.trim()] });
    setNewAnnouncement('');
  };

  const removeAnnouncement = (index: number) => {
    const currentList = temp.announcements || [];
    setTemp({ ...temp, announcements: currentList.filter((_, i) => i !== index) });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setAppConfig(temp);
      alert('تم حفظ كافة التغييرات بنجاح ✅');
    } catch (e) {
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAllUsers = async () => {
    if (!confirm('⚠️ تحذير شديد: هل أنت متأكد من حذف جميع حسابات الأعضاء من قاعدة البيانات؟ لا يمكن التراجع عن هذا الإجراء وسيتم استثناء حساب المدير العام فقط.')) {
      return;
    }

    const password = prompt('يرجى إدخال كلمة "CONFIRM" لتأكيد الحذف النهائي:');
    if (password !== 'CONFIRM') {
      alert('فشل التأكيد، لم يتم حذف أي حساب.');
      return;
    }

    setIsDeletingUsers(true);
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      let deletedCount = 0;
      
      for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data();
        // استثناء حساب المدير العام الرئيسي
        if (userData.email !== 'admin@royal.com') {
          await deleteDoc(doc(db, "users", userDoc.id));
          deletedCount++;
        }
      }
      
      alert(`تم حذف ${deletedCount} حساب بنجاح ✅`);
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء محاولة حذف الحسابات');
    } finally {
      setIsDeletingUsers(false);
    }
  };

  const ColorInput = ({ label, color, onChange }: { label: string, color: string, onChange: (val: string) => void }) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
      <div className="flex items-center gap-3">
        <input 
          type="color" 
          value={color} 
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent"
        />
        <span className="text-xs font-black text-slate-700">{label}</span>
      </div>
      <span className="text-[10px] font-mono text-slate-400 uppercase">{color}</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-24 text-right" dir="rtl">
      
      {/* إدارة الإعلانات المتحركة */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-md border border-slate-100 space-y-6">
        <h3 className="font-black text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4">
          <Megaphone size={18} className="text-yellow-500" /> إدارة شريط الإعلانات المتحرك
        </h3>
        
        <div className="space-y-4">
           <div className="flex gap-2">
              <button 
                onClick={addAnnouncement}
                className="w-12 h-14 bg-yellow-400 text-slate-900 rounded-2xl flex items-center justify-center shadow-lg active:scale-90"
              >
                 <Plus size={20} />
              </button>
              <input 
                type="text" 
                placeholder="أضف رسالة إعلانية جديدة هنا..." 
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
                className="flex-1 h-14 bg-slate-50 rounded-2xl px-4 font-bold text-slate-800 border-2 border-slate-100 outline-none focus:border-yellow-400 text-xs"
              />
           </div>

           <div className="space-y-2">
              {(temp.announcements || []).map((msg, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                   <button onClick={() => removeAnnouncement(idx)} className="text-red-500 p-1">
                      <Trash2 size={16} />
                   </button>
                   <p className="text-[11px] font-bold text-slate-600 flex-1 px-3 truncate">{msg}</p>
                   <List size={14} className="text-slate-300" />
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* هوية الموقع والصور */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-md border border-slate-100 space-y-6">
        <h3 className="font-black text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4">
          <Type size={18} className="text-indigo-500" /> هوية الموقع
        </h3>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase mr-2">اسم التطبيق الرسمي</label>
            <input 
              type="text" 
              value={temp.appName} 
              onChange={(e) => setTemp({...temp, appName: e.target.value})} 
              className="w-full h-14 bg-slate-50 rounded-2xl px-6 font-black text-slate-800 border-2 border-slate-100 outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2 text-right">
            <label className="text-[10px] font-black text-slate-400 uppercase mr-2 block">لوجو الموقع الرسمي</label>
            <label className="relative block w-full h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden cursor-pointer hover:border-indigo-400 transition-all">
              {temp.logoUrl ? (
                <img src={temp.logoUrl} className="w-full h-full object-contain p-4" alt="logo" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <Camera size={24} className="text-slate-300 mb-2" />
                  <span className="text-[10px] font-black text-slate-400">اللوجو</span>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logoUrl')} />
            </label>
          </div>
        </div>
      </div>

      {/* إدارة الخلفيات */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-md border border-slate-100 space-y-6">
        <h3 className="font-black text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4">
          <ImageIcon size={18} className="text-blue-500" /> إدارة خلفيات المنصة
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1">
              <Lock size={12} className="text-slate-400" /> خلفية صفحة الدخول (الخارجية)
            </label>
            <label className="relative block w-full h-40 bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden cursor-pointer hover:border-blue-400 transition-all group">
              {temp.loginBackgroundUrl ? (
                <img src={temp.loginBackgroundUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-white/40 gap-2">
                  <ImageIcon size={24} />
                  <span className="text-[10px] font-black uppercase">ارفع خلفية الدخول</span>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'loginBackgroundUrl')} />
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1">
              <Layout size={12} className="text-slate-400" /> خلفية الموقع (الداخلية)
            </label>
            <label className="relative block w-full h-40 bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden cursor-pointer hover:border-blue-400 transition-all group">
              {temp.backgroundUrl ? (
                <img src={temp.backgroundUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-white/40 gap-2">
                  <ImageIcon size={24} />
                  <span className="text-[10px] font-black uppercase">ارفع خلفية الموقع</span>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'backgroundUrl')} />
            </label>
          </div>
        </div>
        <p className="text-[9px] text-slate-400 font-bold text-center bg-slate-50 p-2 rounded-xl border border-slate-100">ملاحظة: هذه الصور هي التي تظهر كخلفية ثابتة لجميع المستخدمين.</p>
      </div>

      {/* تخصيص الألوان */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-md border border-slate-100 space-y-6">
        <h3 className="font-black text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4">
          <Palette size={18} className="text-pink-500" /> تخصيص ألوان المنصة
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <ColorInput label="اللون الأساسي (أزرار، خلفيات)" color={temp.themeColors.primary} onChange={(val) => setTemp({...temp, themeColors: {...temp.themeColors, primary: val}})} />
          <ColorInput label="لون الخلفية العامة" color={temp.themeColors.background} onChange={(val) => setTemp({...temp, themeColors: {...temp.themeColors, background: val}})} />
          <ColorInput label="لون النصوص" color={temp.themeColors.text} onChange={(val) => setTemp({...temp, themeColors: {...temp.themeColors, text: val}})} />
        </div>
      </div>

      {/* منطقة العمليات الخطيرة */}
      <div className="bg-red-50 p-6 rounded-[2.5rem] border border-red-100 space-y-4">
        <h3 className="font-black text-red-600 flex items-center gap-2 text-sm">
          <ShieldAlert size={18} /> منطقة العمليات الحساسة
        </h3>
        <p className="text-[10px] font-bold text-red-400 pr-2">تحذير: هذه الإجراءات لا يمكن التراجع عنها بعد التنفيذ.</p>
        
        <div className="space-y-3">
          <button 
            onClick={onDeleteAllOrders} 
            className="w-full h-14 bg-white text-red-600 rounded-2xl font-black text-xs border border-red-200 shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Trash2 size={16} /> حذف كافة طلبات المتجر نهائياً
          </button>

          <button 
            onClick={handleDeleteAllUsers}
            disabled={isDeletingUsers}
            className="w-full h-14 bg-white text-red-800 rounded-2xl font-black text-xs border border-red-300 shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            {isDeletingUsers ? (
              <div className="w-5 h-5 border-2 border-red-800/30 border-t-red-800 rounded-full animate-spin"></div>
            ) : (
              <><Users size={16} /> حذف جميع حسابات الأعضاء نهائياً</>
            )}
          </button>
        </div>
      </div>

      {/* زر الحفظ العائم */}
      <div className="fixed bottom-24 left-6 right-6 z-[120]">
        <button 
          onClick={handleSave} 
          disabled={isSaving} 
          className="w-full h-16 bg-slate-900 text-yellow-400 rounded-[2rem] font-black text-lg shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2 border border-white/10"
        >
          {isSaving ? (
            <div className="w-6 h-6 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
          ) : (
            <><Save size={20} /> حفظ التغييرات النهائية</>
          )}
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;
