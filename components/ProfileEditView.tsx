
import React, { useState, useEffect } from 'react';
import { UserState, AppConfig } from '../types';
import { Camera, Save, ArrowRight, Sun, Moon, CheckCircle, User as UserIcon, ShieldCheck, MessageCircle } from 'lucide-react';

interface ProfileEditViewProps {
  user: UserState;
  appConfig: AppConfig;
  setUser: (updatedUser: Partial<UserState>) => Promise<void>;
  onBack: () => void;
}

const compressImage = (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 400;
      const MAX_HEIGHT = 400;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
  });
};

const ProfileEditView: React.FC<ProfileEditViewProps> = ({ user, appConfig, setUser, onBack }) => {
  const [name, setName] = useState(user.name);
  const [pic, setPic] = useState(user.profilePic);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(user.name);
    setPic(user.profilePic);
  }, [user.name, user.profilePic]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert("الاسم لا يمكن أن يكون فارغاً");
      return;
    }
    setIsSaving(true);
    try {
      await setUser({ name: name.trim(), profilePic: pic });
      alert('تم تحديث بياناتك بنجاح! ✅');
      onBack();
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء الحفظ. تأكد من حجم الصورة.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setPic(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWhatsApp = () => {
    if (appConfig.whatsappNumber) {
      const cleanNumber = appConfig.whatsappNumber.replace(/\+/g, '').replace(/\s/g, '');
      window.open(`https://wa.me/${cleanNumber}`, '_blank');
    } else {
      alert('لم يتم تحديد رقم واتساب من قبل الإدارة بعد.');
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-6 pb-48 animate-in fade-in slide-in-from-bottom-4 duration-500 rtl" dir="rtl">
      <div className="flex items-center justify-between mb-10">
        <button onClick={onBack} className="p-2 bg-white/10 backdrop-blur-md rounded-2xl shadow-sm active:scale-90 transition-transform">
          <ArrowRight size={24} className="text-white" />
        </button>
        <h2 className="text-lg font-black text-white">الملف الشخصي</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex flex-col items-center mb-10">
        <div className="relative group">
           <div className="w-32 h-32 rounded-[2.5rem] border-4 border-white/20 shadow-2xl overflow-hidden bg-white/10 backdrop-blur-sm transition-transform group-active:scale-95">
              <img src={pic} className="w-full h-full object-cover" alt="Profile" />
           </div>
           <label className="absolute -bottom-2 -right-2 bg-[#facc15] text-slate-900 p-3 rounded-2xl shadow-xl cursor-pointer hover:scale-110 transition-transform border-4 border-slate-900 active:scale-95">
              <Camera size={22} />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
           </label>
        </div>
        <div className="mt-4 flex items-center gap-2">
           <h3 className="font-black text-white text-xl drop-shadow-md">{name}</h3>
           {user.isVerified && <ShieldCheck size={18} className="text-blue-400" />}
        </div>
        <p className="text-[10px] font-black text-white/50 mt-1 uppercase tracking-widest">معرف الحساب: {user.id}</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10 shadow-sm focus-within:border-[#facc15] transition-colors">
           <label className="block text-[10px] font-black text-white/40 uppercase mb-2 mr-1 text-right">الاسم الكامل</label>
           <div className="flex items-center gap-3 flex-row-reverse">
              <UserIcon size={18} className="text-[#facc15]" />
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full bg-transparent font-black text-white outline-none text-right"
                placeholder="أدخل اسمك هنا..."
              />
           </div>
        </div>

        <div className="bg-black/40 backdrop-blur-md rounded-[2.5rem] p-6 shadow-md border border-white/10">
           <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-400">
                 <MessageCircle size={28} />
              </div>
              <div className="text-right">
                 <h4 className="font-black text-white text-sm">الدعم الفني المباشر</h4>
                 <p className="text-[10px] font-bold text-white/40">نحن هنا لمساعدتك في أي وقت</p>
              </div>
           </div>
           
           <button 
             onClick={handleWhatsApp}
             className="w-full h-14 bg-[#25D366] text-white rounded-2xl font-black text-sm shadow-lg shadow-green-400/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
           >
             تواصل معنا الآن عبر واتساب
           </button>
        </div>
      </div>

      <div className="fixed bottom-24 left-6 right-6 z-40">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full h-16 ${isSaving ? 'bg-slate-400' : 'bg-white text-slate-900'} rounded-[2rem] font-black text-lg shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all`}
        >
          {isSaving ? (
            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <CheckCircle size={22} /> حفظ بيانات الملف
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProfileEditView;
