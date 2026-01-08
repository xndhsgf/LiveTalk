
import React, { useState, useEffect } from 'react';
/* Added Crown to the lucide-react imports to fix the error on line 72 */
import { Plus, Gift as GiftIcon, Edit3, Trash2, Wand2, X, Upload, RefreshCw, AlertCircle, Video, Clock, Image as ImageIcon, Maximize, PlayCircle, Settings2, Save, Layers, Link as LinkIcon, Sparkles, Zap, Star, Trophy, Flame, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, GiftAnimationType, GiftDisplaySize } from '../../types';
import { db } from '../../services/firebase';
import { doc, getDoc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';

interface AdminGiftsProps {
  gifts: Gift[];
  onSaveGift: (gift: Gift, isDelete?: boolean) => Promise<void>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void, w: number, h: number) => void;
}

const AdminGifts: React.FC<AdminGiftsProps> = ({ gifts, onSaveGift, handleFileUpload }) => {
  const [editingGift, setEditingGift] = useState<Partial<Gift> | null>(null);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [isUploadingContent, setIsUploadingContent] = useState(false);
  
  const [categoryLabels, setCategoryLabels] = useState({
    popular: 'شائع', exclusive: 'حصري', lucky: 'الحظ', celebrity: 'مشاهير', trend: 'ترند'
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'appSettings', 'gift_settings'), (snap) => {
      if (snap.exists() && snap.data().categoryLabels) setCategoryLabels(snap.data().categoryLabels);
    });
    return () => unsub();
  }, []);

  const isVideoUrl = (url: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg|mov|m4v)$/i) || url.includes('video') || url.includes('base64:video');
  };

  const handleFinalSave = async () => {
    if (!editingGift?.name || !editingGift?.icon) {
      alert('يرجى إكمال الاسم ووضع رابط المحتوى أو رفعه أولاً');
      return;
    }
    await onSaveGift({ 
      ...editingGift, 
      id: editingGift.id || 'gift_' + Date.now(),
      duration: Number(editingGift.duration) || 5,
      cost: Number(editingGift.cost) || 0,
      isLucky: editingGift.category === 'lucky'
    } as Gift);
    setEditingGift(null);
  };

  const animationTypes: { id: GiftAnimationType; label: string; icon: any }[] = [
    { id: 'pop', label: 'ظهور عادي', icon: Zap },
    { id: 'full-screen', label: 'ملء الشاشة', icon: Maximize },
    { id: 'fly', label: 'طيران', icon: Sparkles },
    { id: 'bounce', label: 'قفز', icon: PlayCircle },
    { id: 'shake', label: 'اهتزاز', icon: RefreshCw },
    { id: 'glow', label: 'توهج', icon: Star }
  ];

  const displaySizes: { id: GiftDisplaySize; label: string }[] = [
    { id: 'small', label: 'صغير' },
    { id: 'medium', label: 'متوسط' },
    { id: 'large', label: 'كبير' },
    { id: 'full', label: 'كامل' },
    { id: 'max', label: 'أقصى حجم' }
  ];

  const categories: { id: Gift['category']; label: string; icon: any }[] = [
    { id: 'popular', label: 'شائع', icon: Flame },
    { id: 'exclusive', label: 'حصري', icon: Star },
    { id: 'lucky', label: 'هدايا الحظ', icon: Trophy },
    { id: 'celebrity', label: 'مشاهير', icon: Crown },
    { id: 'trend', label: 'ترند', icon: Zap }
  ];

  return (
    <div className="space-y-10 text-right font-cairo" dir="rtl">
      <div className="flex flex-col md:flex-row items-center justify-between bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl gap-6">
        <div>
           <h3 className="text-2xl font-black text-white flex items-center gap-3">
              <div className="p-3 bg-pink-600 rounded-2xl shadow-lg shadow-pink-900/40"><GiftIcon className="text-white" /></div>
              مستودع الهدايا والأنميشن ({gifts.length})
           </h3>
           <p className="text-slate-500 text-xs font-bold mt-2 pr-1">تحكم في أسعار الهدايا، أنواع الأنميشن، وتصنيفات الحظ والمشاهير.</p>
        </div>
        <button 
          onClick={() => setEditingGift({ id: 'gift_' + Date.now(), name: '', icon: '', catalogIcon: '', cost: 10, animationType: 'pop', category: 'popular', duration: 5, displaySize: 'medium' })} 
          className="px-10 py-5 bg-gradient-to-r from-pink-600 to-purple-700 text-white rounded-[1.5rem] font-black text-xs shadow-xl active:scale-95 flex items-center gap-3 transition-all"
        >
          <Plus size={20} strokeWidth={3} /> إضافة هدية جديدة
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {gifts.map(gift => (
          <motion.div whileHover={{ y: -5 }} key={gift.id} className="bg-slate-900 border border-white/5 p-4 rounded-[2rem] flex flex-col items-center gap-3 group relative overflow-hidden shadow-xl">
            <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button onClick={() => setEditingGift(gift)} className="p-2 bg-blue-600 rounded-xl text-white shadow-lg"><Edit3 size={12}/></button>
              <button onClick={() => { if(confirm('حذف الهدية؟')) onSaveGift(gift, true) }} className="p-2 bg-red-600 rounded-xl text-white shadow-lg"><Trash2 size={12}/></button>
            </div>
            <div className="w-16 h-16 flex items-center justify-center bg-black/40 rounded-2xl p-2">
               <img src={gift.catalogIcon || gift.icon} className="w-full h-full object-contain" />
            </div>
            <div className="text-center">
              <span className="text-xs font-black text-white truncate block w-24">{gift.name}</span>
              <span className="text-[10px] text-yellow-500 font-bold block mt-1">🪙 {gift.cost.toLocaleString()}</span>
              <span className="text-[8px] bg-white/5 text-slate-400 px-2 py-0.5 rounded-full mt-2 block">{gift.category === 'lucky' ? '🎁 حظ' : gift.category === 'celebrity' ? '👑 مشاهير' : '💎 عادي'}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {editingGift && (
          <div className="fixed inset-0 z-[3005] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0f172a] border border-white/10 rounded-[3.5rem] w-full max-w-4xl p-8 md:p-12 shadow-2xl overflow-y-auto max-h-[92vh] custom-scrollbar">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-white flex items-center gap-3"><Wand2 className="text-pink-500" /> إعدادات الهدية المتطورة</h3>
                <button onClick={() => setEditingGift(null)} className="p-3 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={24}/></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  {/* الأيقونة والمحتوى */}
                  <div className="bg-black/20 p-6 rounded-[2.5rem] border border-white/5 space-y-6">
                    <div className="space-y-4">
                       <label className="text-[11px] font-black text-slate-400 uppercase pr-2">أيقونة القائمة (Thumbnail)</label>
                       <div className="flex items-center gap-4">
                          <div className="w-20 h-20 bg-slate-800 rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden relative group">
                             {editingGift.catalogIcon ? <img src={editingGift.catalogIcon} className="w-[80%] h-[80%] object-contain" /> : <ImageIcon className="text-slate-700" size={24} />}
                             <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                                <Upload size={20} className="text-white" />
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => { setIsUploadingIcon(true); handleFileUpload(e, (url) => { setEditingGift({...editingGift, catalogIcon: url}); setIsUploadingIcon(false); }, 200, 200); }} />
                             </label>
                          </div>
                          <input type="text" value={editingGift.catalogIcon || ''} onChange={e => setEditingGift({...editingGift, catalogIcon: e.target.value})} placeholder="أو رابط أيقونة مباشر..." className="flex-1 bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-[10px] text-blue-400 outline-none" />
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[11px] font-black text-slate-400 uppercase pr-2">ملف الأنميشن (GIF / MP4 / WEBP)</label>
                       <div className="relative aspect-video bg-slate-800 rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden group">
                          {editingGift.icon ? (
                             isVideoUrl(editingGift.icon) ? (
                                <video src={editingGift.icon} autoPlay loop muted playsInline className="w-full h-full object-contain" />
                             ) : (
                                <img src={editingGift.icon} className="w-full h-full object-contain" />
                             )
                          ) : <Video className="text-slate-700" size={32} />}
                          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all">
                             {isUploadingContent ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div> : <><Upload size={24} className="text-white" /><span className="text-[10px] text-white mt-1">رفع الملف</span></>}
                             <input type="file" accept="*" className="hidden" onChange={(e) => { setIsUploadingContent(true); handleFileUpload(e, (url) => { setEditingGift({...editingGift, icon: url}); setIsUploadingContent(false); }, 800, 800); }} />
                          </label>
                       </div>
                       <input type="text" value={editingGift.icon || ''} onChange={e => setEditingGift({...editingGift, icon: e.target.value})} placeholder="رابط الأنميشن المباشر..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-[10px] text-emerald-400 outline-none" />
                    </div>
                  </div>

                  {/* بيانات الهدية */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 pr-2">اسم الهدية</label>
                        <input type="text" value={editingGift.name} onChange={e => setEditingGift({...editingGift, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-sm" placeholder="مثلاً: صاروخ..." />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 pr-2">السعر (كوينز)</label>
                        <input type="number" value={editingGift.cost} onChange={e => setEditingGift({...editingGift, cost: parseInt(e.target.value) || 0})} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-yellow-500 text-sm font-black" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 pr-2">مدة العرض (ثواني)</label>
                        <input type="number" value={editingGift.duration} onChange={e => setEditingGift({...editingGift, duration: parseInt(e.target.value) || 5})} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-sm" />
                     </div>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* تصنيف الهدية */}
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase pr-2">تصنيف الهدية (Category)</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                       {categories.map(cat => (
                          <button 
                            key={cat.id} 
                            onClick={() => setEditingGift({...editingGift, category: cat.id})}
                            className={`p-4 rounded-[1.5rem] border flex flex-col items-center gap-2 transition-all ${editingGift.category === cat.id ? 'bg-pink-600 border-pink-400 text-white shadow-lg scale-105' : 'bg-black/40 border-white/5 text-slate-500'}`}
                          >
                             <cat.icon size={20} />
                             <span className="text-[10px] font-black">{cat.label}</span>
                          </button>
                       ))}
                    </div>
                  </div>

                  {/* نوع الأنميشن */}
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase pr-2">نوع تأثير العرض (Animation Type)</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                       {animationTypes.map(anim => (
                          <button 
                            key={anim.id} 
                            onClick={() => setEditingGift({...editingGift, animationType: anim.id})}
                            className={`p-4 rounded-[1.5rem] border flex flex-col items-center gap-2 transition-all ${editingGift.animationType === anim.id ? 'bg-blue-600 border-blue-400 text-white shadow-lg scale-105' : 'bg-black/40 border-white/5 text-slate-500'}`}
                          >
                             <anim.icon size={20} />
                             <span className="text-[10px] font-black">{anim.label}</span>
                          </button>
                       ))}
                    </div>
                  </div>

                  {/* حجم العرض */}
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase pr-2">حجم الظهور داخل الغرفة (Display Size)</label>
                    <div className="flex flex-wrap gap-2">
                       {displaySizes.map(size => (
                          <button 
                            key={size.id} 
                            onClick={() => setEditingGift({...editingGift, displaySize: size.id})}
                            className={`px-5 py-3 rounded-xl border text-[10px] font-black transition-all ${editingGift.displaySize === size.id ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg' : 'bg-black/40 border-white/5 text-slate-500'}`}
                          >
                             {size.label}
                          </button>
                       ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex gap-4">
                 <button onClick={handleFinalSave} className="flex-1 py-6 bg-gradient-to-r from-pink-600 to-purple-700 text-white font-black rounded-[2.5rem] shadow-xl active:scale-95 transition-all text-lg flex items-center justify-center gap-4">
                    <Save size={26} /> حفظ الهدية ونشرها
                 </button>
                 <button onClick={() => setEditingGift(null)} className="px-10 py-6 bg-white/5 text-slate-400 font-black rounded-[2.5rem] border border-white/10 hover:bg-white/10">إلغاء</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminGifts;
