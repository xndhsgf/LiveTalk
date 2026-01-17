
import React, { useState } from 'react';
import { Mail, User, Camera, Lock, Loader2 } from 'lucide-react';
import { UserState } from '../types';
import { SITE_ASSETS } from '../assets';

interface LoginViewProps {
  onLogin: (identifier: string, password: string, userData?: Partial<UserState>, isSignup?: boolean) => Promise<void>;
  appName: string;
  logoUrl: string;
  loginBackgroundUrl?: string;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, appName, logoUrl, loginBackgroundUrl }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgot'>('login');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('مصر 🇪🇬');
  const [profilePic, setProfilePic] = useState(SITE_ASSETS.defaultAvatar);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    
    if (activeTab === 'forgot') {
        alert('يرجى التواصل مع المدير العام عبر واتساب لإعادة تعيين حسابك.');
        setActiveTab('login');
        return;
    }

    const cleanPassword = password.trim();
    
    if (activeTab === 'login' && !identifier.trim()) {
      alert('يرجى إدخال البريد الإلكتروني أو الـ ID');
      return;
    }

    if (activeTab === 'signup') {
      if (!email.includes('@')) { alert('بريد غير صحيح'); return; }
      if (username.length < 3) { alert('الاسم قصير'); return; }
    }

    if (cleanPassword.length < 4) {
      alert('كلمة السر قصيرة جداً');
      return;
    }

    setIsLoading(true);
    try {
      if (activeTab === 'signup') {
        await onLogin(email.toLowerCase().trim(), cleanPassword, {
          name: username,
          profilePic: profilePic,
          country: country,
        }, true);
      } else {
        await onLogin(identifier.toLowerCase().trim(), cleanPassword, undefined, false);
      }
    } catch (error: any) {
      alert(error.message || 'خطأ في الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#0f172a] flex flex-col items-center justify-start overflow-y-auto no-scrollbar py-10 px-6 rtl font-['Cairo'] relative" dir="rtl">
      
      {/* خلفية الدخول الخارجية - الأولوية للمرفوعة من الإدارة */}
      <div className="fixed inset-0 z-0">
        <img 
          src={loginBackgroundUrl || SITE_ASSETS.loginBackground} 
          className="w-full h-full object-cover" 
          alt="background" 
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
      </div>
      
      <div className="w-full max-w-[420px] z-10 my-auto animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 mb-4 relative">
            <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 p-2 bg-black/20 backdrop-blur-md">
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight drop-shadow-xl">{appName}</h1>
          <p className="text-white/80 text-[10px] font-bold uppercase tracking-[0.3em] mt-1 drop-shadow-md">بوابة الدخول العالمية</p>
        </div>

        <div className="flex bg-black/40 backdrop-blur-xl p-1 rounded-2xl mb-6 border border-white/10 w-full shadow-2xl">
          <button 
            disabled={isLoading}
            onClick={() => setActiveTab('signup')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs transition-all ${activeTab === 'signup' ? 'bg-white text-slate-900 shadow-xl' : 'text-white/60 hover:text-white'}`}
          >
            حساب جديد
          </button>
          <button 
            disabled={isLoading}
            onClick={() => setActiveTab('login')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs transition-all ${activeTab === 'login' ? 'bg-white text-slate-900 shadow-xl' : 'text-white/60 hover:text-white'}`}
          >
            دخول
          </button>
        </div>

        <div className="bg-black/40 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl w-full">
          <div className="space-y-4">
            {activeTab === 'signup' ? (
              <>
                <div className="flex flex-col items-center mb-4">
                  <div className="relative">
                    <img src={profilePic} className="w-16 h-16 rounded-2xl border border-white/20 object-cover shadow-lg" />
                    <label className="absolute -bottom-1 -right-1 bg-white p-1 rounded-lg cursor-pointer text-slate-900 shadow-md"><Camera size={12}/><input type="file" className="hidden" onChange={handleImageUpload}/></label>
                  </div>
                </div>
                <div className="relative">
                  <input type="text" placeholder="اسم المستخدم" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full h-14 bg-white/10 border border-white/10 rounded-2xl px-12 text-right text-white text-sm font-bold outline-none placeholder:text-white/40 focus:border-white/30 transition-all" />
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                </div>
                <div className="relative">
                  <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-14 bg-white/10 border border-white/10 rounded-2xl px-12 text-right text-white text-sm font-bold outline-none placeholder:text-white/40 focus:border-white/30 transition-all" />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                </div>
              </>
            ) : (
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="البريد أو الـ ID الخاص بك" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full h-14 bg-white/10 border border-white/10 rounded-2xl px-12 text-right text-white text-sm font-bold outline-none focus:border-white/30 placeholder:text-white/40 transition-all"
                />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              </div>
            )}

            <div className="relative">
              <input 
                type="password" 
                placeholder="كلمة السر" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 bg-white/10 border border-white/10 rounded-2xl px-12 text-right text-white text-sm font-bold outline-none focus:border-white/30 placeholder:text-white/40 transition-all"
              />
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            </div>

            <button 
              disabled={isLoading}
              onClick={handleSubmit}
              className="w-full h-16 bg-white text-slate-900 rounded-2xl font-black text-sm shadow-2xl active:scale-95 transition-all mt-4 flex items-center justify-center gap-3 hover:bg-slate-100"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : (activeTab === 'signup' ? 'إنشاء الحساب' : 'دخول للمتجر')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
