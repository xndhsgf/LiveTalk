
import React, { useState } from 'react';
import { Search, UserCircle, Upload, Link as LinkIcon, Save, Image as ImageIcon, Camera, Trash2, CheckCircle2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../../types';

interface AdminProfilesProps {
  users: User[];
  onUpdateUser: (userId: string, data: Partial<User>) => Promise<void>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void, w: number, h: number) => void;
}

const AdminProfiles: React.FC<AdminProfilesProps> = ({ users, onUpdateUser, handleFileUpload }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editType, setEditType] = useState<'avatar' | 'cover'>('avatar');
  const [inputUrl, setInputUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const filteredUsers = searchQuery.trim() === '' ? [] : users.filter(u => 
    u.customId?.toString() === searchQuery || u.id === searchQuery || u.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const handleApplyChange = async (url: string) => {
    if (!selectedUser || !url) return;
    try {
      await onUpdateUser(selectedUser.id, { [editType]: url });
      alert(`تم تحديث ${editType === 'avatar' ? 'الصورة الشخصية' : 'الغلاف'} بنجاح ✅`);
      setInputUrl('');
      // تحديث البيانات محلياً للمعاينة
      setSelectedUser({ ...selectedUser, [editType]: url });
    } catch (e) {
      alert('فشل التحديث');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUploading(true);
    const dimensions = editType === 'avatar' ? [300, 300] : [800, 400];
    handleFileUpload(e, (url) => {
      handleApplyChange(url);
      setIsUploading(false);
    }, dimensions[0], dimensions[1]);
  };

  return (
    <div className="space-y-8 text-right font-cairo" dir="rtl">
      {/* Header */}
      <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-2xl font-black text-white flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/40"><UserCircle className="text-white" /></div>
            مركز الهويات والبروفايلات
          </h3>
          <p className="text-slate-500 text-xs font-bold mt-2 pr-1">تحكم كامل في صور المستخدمين (الرفع المباشر أو الروابط الخارجية).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* البحث والاختيار */}
        <div className="space-y-6">
           <div className="bg-black/20 p-6 rounded-[2.5rem] border border-white/5 space-y-4">
              <label className="text-xs font-black text-slate-400 pr-2 uppercase tracking-widest">ابحث عن المستخدم:</label>
              <div className="relative">
                 <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pr-14 text-white outline-none focus:border-blue-500/50" 
                   placeholder="ادخل الآيدي أو الاسم..."
                 />
              </div>

              <AnimatePresence>
                 {filteredUsers.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-950 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                       {filteredUsers.map(u => (
                          <button key={u.id} onClick={() => { setSelectedUser(u); setSearchQuery(''); }} className="w-full p-4 flex items-center gap-4 hover:bg-white/5 border-b border-white/5 last:border-0 text-right transition-colors">
                             <img src={u.avatar} className="w-10 h-10 rounded-xl object-cover" />
                             <div className="flex-1">
                                <span className="font-bold text-white text-sm block">{u.name}</span>
                                <span className="text-[10px] text-slate-500">ID: {u.customId || u.id}</span>
                             </div>
                             <ChevronLeft size={16} className="text-slate-700" />
                          </button>
                       ))}
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>

           {selectedUser && (
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900/60 p-8 rounded-[3rem] border border-white/5 space-y-6 shadow-xl">
                <div className="flex flex-col items-center text-center gap-4">
                   <div className="relative">
                      <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl">
                         <img src={selectedUser.avatar} className="w-full h-full rounded-full object-cover border-4 border-[#0f172a]" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-xl shadow-lg border border-white/20"><Camera size={16}/></div>
                   </div>
                   <div>
                      <h4 className="text-lg font-black text-white">{selectedUser.name}</h4>
                      <p className="text-xs text-slate-500">ID: {selectedUser.customId || selectedUser.id}</p>
                   </div>
                </div>

                <div className="flex bg-black/40 p-1.5 rounded-2xl gap-2">
                   <button onClick={() => setEditType('avatar')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${editType === 'avatar' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>الصورة الشخصية</button>
                   <button onClick={() => setEditType('cover')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${editType === 'cover' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>غلاف الحساب</button>
                </div>
             </motion.div>
           )}
        </div>

        {/* أدوات الرفع */}
        <div className="flex flex-col gap-6">
          {selectedUser ? (
            <div className="bg-slate-900/60 p-8 rounded-[3rem] border border-white/5 space-y-8 shadow-xl flex-1">
               <div className="space-y-4">
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                     <Upload size={18} className="text-emerald-500" /> خيار الرفع من الجهاز
                  </h4>
                  <label className={`w-full h-32 bg-black/40 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                     {isUploading ? (
                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                     ) : (
                       <>
                         <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform"><Upload size={24} className="text-slate-400" /></div>
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">اضغط لاختيار ملف</span>
                       </>
                     )}
                     <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
               </div>

               <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                  <div className="relative flex justify-center"><span className="bg-[#0f172a] px-4 text-[10px] font-black text-slate-700 uppercase">أو استخدام رابط</span></div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                     <LinkIcon size={18} className="text-blue-500" /> وضع رابط الصورة المباشر
                  </h4>
                  <div className="flex gap-3">
                     <div className="relative flex-1">
                        <input 
                          type="text" 
                          value={inputUrl}
                          onChange={(e) => setInputUrl(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 pr-12 text-blue-400 font-bold text-xs outline-none focus:border-blue-500/50" 
                          placeholder="https://example.com/image.png"
                        />
                        <LinkIcon size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" />
                     </div>
                     <button 
                       onClick={() => handleApplyChange(inputUrl)}
                       className="px-8 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all"
                     >
                        حفظ
                     </button>
                  </div>
                  <p className="text-[9px] text-slate-600 font-bold pr-2">تأكد أن الرابط ينتهي بـ .png أو .jpg لضمان العرض الصحيح.</p>
               </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-black/20 rounded-[3rem] border border-white/5 border-dashed opacity-30">
               <UserCircle size={64} className="text-slate-700 mb-4" />
               <p className="font-bold text-slate-500">اختر مستخدماً لبدء التحكم بهويته</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfiles;

const ChevronLeft = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m15 18-6-6 6-6"/></svg>
);
