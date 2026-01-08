
import React, { useState, useEffect } from 'react';
import { Plus, Gift as GiftIcon, Edit3, Trash2, Wand2, X, Upload, RefreshCw, AlertCircle, Video, Clock, Image as ImageIcon, Maximize, PlayCircle, Settings2, Save, Layers, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, GiftAnimationType, GiftDisplaySize } from '../../types';
import { db } from '../../services/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

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
    popular: 'شائع', exclusive: 'حصري', lucky: 'الحظ', trend: 'ترند'
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
    if (!editingGift || !editingGift.icon) {
      alert('يرجى وضع رابط المحتوى أو رفعه أولاً');
      return;
    }
    await onSaveGift({ ...editingGift, duration: Number(editingGift.duration) || 5 } as Gift);
    setEditingGift(null);
  };

  return (
    <div className="space-y-10 text-right font-cairo" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black text-white">إدارة الهدايا المتطورة ({gifts.length})</h3>
        <button onClick={() => setEditingGift({ id: 'gift_' + Date.now(), name: '', icon: '', catalogIcon: '', cost: 10, animationType: 'none', category: 'popular', duration: 5, displaySize: 'medium' })} className="px-6 py-3 bg-pink-600 text-white rounded-2xl font-black text-xs flex items-center gap-2 shadow-xl">
          <Plus size={18}/> إضافة هدية جديدة
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {gifts.map(gift => (
          <div key={gift.id} className="bg-slate-950/60 p-4 rounded-[2rem] border border-white/10 flex flex-col items-center gap-2 group relative">
            <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button onClick={() => setEditingGift(gift)} className="p-1.5 bg-blue-600 rounded-lg text-white shadow-lg"><Edit3 size={12}/></button>
              <button onClick={() => { if(confirm('حذف الهدية؟')) onSaveGift(gift, true) }} className="p-1.5 bg-red-600 rounded-lg text-white shadow-lg"><Trash2 size={12}/></button>
            </div>
            <div className="w-16 h-16 flex items-center justify-center mb-1">
               <img src={gift.catalogIcon || gift.icon} className="w-full h-full object-contain" />
            </div>
            <span className="text-xs font-black text-white truncate w-full text-center">{gift.name}</span>
            <span className="text-[10px] text-yellow-500 font-bold">🪙 {gift.cost}</span>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {editingGift && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-xl p-8 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-white flex items-center gap-2"><Wand2 className="text-pink-500" /> إعدادات الهدية</h3>
                <button onClick={() => setEditingGift(null)} className="p-2 text-slate-500 hover:text-white"><X size={24}/></button>
              </div>

              <div className="space-y-8">
                <div className="bg-black/40 p-6 rounded-3xl border border-white/5 space-y-4">
                   <label className="text-[11px] font-black text-slate-500 uppercase">أيقونة القائمة (URL أو رفع)</label>
                   <div className="flex flex-col md:flex-row items-center gap-4">
                      <div className="w-20 h-20 bg-slate-800 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                         {editingGift.catalogIcon ? <img src={editingGift.catalogIcon} className="w-full h-full object-contain" /> : <ImageIcon className="text-slate-700" size={24} />}
                         <label className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                            <Upload size={20} className="text-white" />
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => { setIsUploadingIcon(true); handleFileUpload(e, (url) => { setEditingGift({...editingGift, catalogIcon: url}); setIsUploadingIcon(false); }, 150, 150); }} />
                         </label>
                      </div>
                      <div className="relative flex-1 w-full">
                         <input type="text" value={editingGift.catalogIcon || ''} onChange={e => setEditingGift({...editingGift, catalogIcon: e.target.value})} placeholder="رابط الأيقونة المباشر..." className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pr-10 text-[10px] text-blue-400 outline-none" />
                         <LinkIcon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" />
                      </div>
                   </div>
                </div>

                <div className="bg-black/40 p-6 rounded-3xl border border-white/5 space-y-4">
                   <label className="text-[11px] font-black text-slate-500 uppercase">محتوى الأنميشن (URL أو رفع)</label>
                   <div className="space-y-4">
                      <div className="relative w-full h-48 bg-slate-800 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden group">
                         {editingGift.icon ? (
                            isVideoUrl(editingGift.icon) ? (
                               <video src={editingGift.icon} autoPlay loop muted playsInline className="w-full h-full object-contain" />
                            ) : (
                               <img src={editingGift.icon} className="w-full h-full object-contain" />
                            )
                         ) : <Video className="text-slate-700" size={32} />}
                         <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                            <Upload size={24} className="text-white" />
                            <input type="file" accept="*" className="hidden" onChange={(e) => { setIsUploadingContent(true); handleFileUpload(e, (url) => { setEditingGift({...editingGift, icon: url}); setIsUploadingContent(false); }, 512, 512); }} />
                         </label>
                      </div>
                      <div className="relative">
                         <input type="text" value={editingGift.icon || ''} onChange={e => setEditingGift({...editingGift, icon: e.target.value})} placeholder="رابط الأنميشن المباشر (GIF/MP4/PNG)..." className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pr-10 text-[10px] text-emerald-400 outline-none" />
                         <LinkIcon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <input type="text" value={editingGift.name} onChange={e => setEditingGift({...editingGift, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-xs" placeholder="اسم الهدية..." />
                   <input type="number" value={editingGift.cost} onChange={e => setEditingGift({...editingGift, cost: parseInt(e.target.value) || 0})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-yellow-500 text-xs" placeholder="السعر..." />
                </div>

                <button onClick={handleFinalSave} className="w-full py-5 bg-gradient-to-r from-pink-600 to-purple-700 text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all text-sm">حفظ الهدية</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminGifts;
