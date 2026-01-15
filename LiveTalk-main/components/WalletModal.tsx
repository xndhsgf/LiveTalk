
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, Gem, Coins, ArrowRightLeft, TrendingUp, Search, UserCheck, Zap, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { User } from '../types';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, limit, doc, onSnapshot } from 'firebase/firestore';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onExchange: (diamonds: number) => void;
  onAgencyExchange?: (agentId: string, amount: number) => Promise<boolean>;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, user, onExchange, onAgencyExchange }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'agency'>('personal');
  const [exchangeAmount, setExchangeAmount] = useState<string>('');
  const [exchangeRatio, setExchangeRatio] = useState(1.14); // الافتراضي
  
  const [agentSearchId, setAgentSearchId] = useState('');
  const [foundAgent, setFoundAgent] = useState<User | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'appSettings', 'economy'), (snap) => {
       if (snap.exists()) setExchangeRatio(snap.data().salaryToAgencyRatio || 1.14);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const currentDiamonds = Number(user.diamonds || 0);
  const personalCoins = Math.floor((Number(exchangeAmount) || 0) * 0.5);
  
  // حساب الرصيد بناءً على المعامل الديناميكي
  const agencyCoins = useMemo(() => {
    const amt = Number(exchangeAmount) || 0;
    if (amt < 70000) return 0;
    return Math.floor(amt * exchangeRatio);
  }, [exchangeAmount, exchangeRatio]);

  const handleSearchAgent = async () => {
    if (!agentSearchId.trim()) return;
    setIsSearching(true);
    setFoundAgent(null);
    try {
      const q = query(collection(db, 'users'), where('customId', '==', agentSearchId), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const agentData = { id: snap.docs[0].id, ...snap.docs[0].data() } as User;
        if (agentData.isAgency) setFoundAgent(agentData);
        else alert('هذا المستخدم ليس وكيل شحن معتمد');
      } else alert('لم يتم العثور على وكيل بهذا الـ ID');
    } catch (e) { alert('خطأ في البحث'); } finally { setIsSearching(false); }
  };

  const handleExchange = () => {
    const amount = Number(exchangeAmount);
    if (isNaN(amount) || amount <= 0) return;
    if (amount > currentDiamonds) return alert('رصيد الألماس غير كافٍ!');
    if (activeTab === 'personal') { onExchange(amount); setExchangeAmount(''); }
    else {
      if (!foundAgent) return alert('يرجى اختيار الوكيل أولاً');
      if (amount < 70000) return alert('الحد الأدنى لتحويل الراتب للوكلاء هو 70,000 ماسة');
      setIsConfirming(true);
    }
  };

  const confirmAgencyTransfer = async () => {
    if (!foundAgent || isProcessing) return;
    setIsProcessing(true);
    const success = await onAgencyExchange?.(foundAgent.id, Number(exchangeAmount));
    if (success) {
      alert('تم تحويل الراتب إلى رصيد وكالة الوكيل بنجاح! ✅');
      setExchangeAmount(''); setFoundAgent(null); setAgentSearchId(''); setIsConfirming(false);
    } else alert('فشلت العملية، تأكد من الرصيد والاتصال');
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-cairo">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        dir="rtl"
      >
        <div className="p-6 bg-gradient-to-br from-indigo-600/20 via-blue-900/10 to-transparent border-b border-white/5 relative text-center">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition active:scale-90"><X size={20} /></button>
          <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-3 border border-indigo-500/30 shadow-lg mx-auto"><Wallet size={28} className="text-indigo-400" /></div>
          <h2 className="text-xl font-black text-white">إدارة المحفظة</h2>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3 shrink-0">
          <div className="bg-slate-900/50 border border-white/5 p-4 rounded-3xl text-center shadow-inner">
            <div className="flex items-center justify-center gap-1.5 text-yellow-500 mb-1"><Coins size={14} /><span className="text-[10px] font-bold">الكوينز</span></div>
            <div className="text-xl font-black text-white">{(Number(user.coins || 0)).toLocaleString()}</div>
          </div>
          <div className="bg-slate-900/50 border border-white/5 p-4 rounded-3xl text-center shadow-inner">
            <div className="flex items-center justify-center gap-1.5 text-blue-400 mb-1"><Gem size={14} /><span className="text-[10px] font-bold">الراتب (الألماس)</span></div>
            <div className="text-xl font-black text-white">{(Number(user.diamonds || 0)).toLocaleString()}</div>
          </div>
        </div>

        <div className="px-6 flex gap-2 mb-4">
           <button onClick={() => { setActiveTab('personal'); setExchangeAmount(''); }} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTab === 'personal' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'bg-white/5 text-slate-500'}`}>استبدال شخصي</button>
           <button onClick={() => { setActiveTab('agency'); setExchangeAmount(''); }} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTab === 'agency' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40' : 'bg-white/5 text-slate-500'}`}>تحويل لوكيل شحن</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-8 scrollbar-hide">
          <div className={`bg-slate-900/60 rounded-[2rem] p-5 border ${activeTab === 'personal' ? 'border-white/5' : 'border-orange-500/20'}`}>
            {activeTab === 'personal' ? (
              <div className="space-y-5">
                 <div className="flex justify-between items-center px-1">
                    <h3 className="text-xs font-bold text-slate-300">استبدال الراتب لعملاتك</h3>
                    <span className="bg-indigo-500/10 text-indigo-400 text-[8px] font-black px-2 py-1 rounded-full border border-indigo-500/20">نسبة التحويل: 50%</span>
                 </div>
                 <div className="relative">
                    <input type="number" placeholder="أدخل كمية الألماس..." value={exchangeAmount} onChange={(e) => setExchangeAmount(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 pr-12 text-sm text-white font-black outline-none focus:border-indigo-500/50" />
                    <Gem size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400" />
                    <button onClick={() => setExchangeAmount(String(currentDiamonds))} className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-lg">الكل</button>
                 </div>
                 <div className="w-full bg-black/20 rounded-2xl p-4 flex justify-between items-center border border-dashed border-white/10">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold"><Coins size={16} className="text-yellow-500" /> ستحصل على:</div>
                    <div className="text-lg font-black text-yellow-500">{personalCoins.toLocaleString()} 🪙</div>
                 </div>
              </div>
            ) : (
              <div className="space-y-6">
                 <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-2xl flex items-center gap-3">
                    <div className="bg-orange-500 rounded-lg p-1.5 text-black"><Zap size={18} fill="currentColor" /></div>
                    <div>
                       <p className="text-[10px] font-black text-orange-400">عرض الوكلاء المحدث</p>
                       <p className="text-[9px] text-slate-400 font-bold leading-none mt-1">المعدل الحالي: 1 ماسة = {exchangeRatio.toFixed(2)} كوينز للوكالة</p>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 pr-2">البحث عن وكيل الشحن (ID):</label>
                    <div className="flex gap-2">
                       <div className="relative flex-1">
                          <input type="text" value={agentSearchId} onChange={(e) => setAgentSearchId(e.target.value)} placeholder="ادخل آيدي الوكيل..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pr-10 text-white text-xs font-black outline-none focus:border-orange-500/50" />
                          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                       </div>
                       <button onClick={handleSearchAgent} disabled={isSearching} className="px-5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all active:scale-95">{isSearching ? '...' : <UserCheck size={18}/>}</button>
                    </div>
                 </div>

                 <AnimatePresence>
                    {foundAgent && (
                       <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-orange-600/10 border border-orange-500/30 rounded-3xl p-4 flex items-center gap-4 relative overflow-hidden group">
                          <img src={foundAgent.avatar} className="w-14 h-14 rounded-2xl object-cover border border-white/10 shadow-lg" />
                          <div className="flex-1 text-right">
                             <div className="flex items-center gap-1.5"><h4 className="text-white font-black text-sm leading-none">{foundAgent.name}</h4><Zap size={10} className="text-orange-500" fill="currentColor" /></div>
                             <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest">ID: {foundAgent.customId}</p>
                          </div>
                          <CheckCircle2 className="text-emerald-500" size={20} />
                       </motion.div>
                    )}
                 </AnimatePresence>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 pr-2">كمية الراتب (دفعات الـ 70,000):</label>
                    <div className="relative">
                       <input type="number" step="70000" value={exchangeAmount} onChange={(e) => setExchangeAmount(e.target.value)} placeholder="70000..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-center text-xl font-black text-orange-500 outline-none" />
                       <Gem size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" />
                    </div>
                    {agencyCoins > 0 && (
                       <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-black/30 rounded-2xl p-4 flex justify-between items-center border border-dashed border-orange-500/20">
                          <span className="text-[10px] font-bold text-slate-400">سيحصل الوكيل على:</span>
                          <span className="text-lg font-black text-yellow-500">{agencyCoins.toLocaleString()} 🪙</span>
                       </motion.div>
                    )}
                 </div>
              </div>
            )}

            <button onClick={handleExchange} disabled={!exchangeAmount || Number(exchangeAmount) <= 0 || (activeTab === 'agency' && (!foundAgent || Number(exchangeAmount) < 70000))} className={`w-full mt-6 py-4 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 ${activeTab === 'personal' ? 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white' : 'bg-gradient-to-r from-orange-500 to-amber-600 text-black'}`}>
              <TrendingUp size={18}/> {activeTab === 'personal' ? 'استبدال شخصي فوراً' : 'تحويل الراتب للوكيل'}
            </button>
          </div>
        </div>

        <AnimatePresence>
           {isConfirming && foundAgent && (
             <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#1a1f2e] border border-orange-500/30 rounded-[2.5rem] p-8 text-center space-y-6 shadow-2xl">
                   <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500 border border-red-500/30 animate-pulse"><AlertCircle size={32} /></div>
                   <div><h4 className="text-white font-black text-lg">تأكيد التحويل النهائي</h4><p className="text-slate-400 text-xs mt-2 leading-relaxed">أنت على وشك تحويل <span className="text-blue-400 font-bold">{Number(exchangeAmount).toLocaleString()}</span> راتب إلى الوكيل <span className="text-orange-500 font-bold">{foundAgent.name}</span>.<br/>سيتم إضافة <span className="text-yellow-500 font-bold">{agencyCoins.toLocaleString()} كوينز</span> لرصيد وكالته.</p></div>
                   <div className="flex gap-3"><button onClick={confirmAgencyTransfer} disabled={isProcessing} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs shadow-xl active:scale-95 disabled:opacity-50">{isProcessing ? 'جاري التحويل...' : 'نعم، قم بالتحويل'}</button><button onClick={() => setIsConfirming(false)} className="flex-1 py-4 bg-white/5 text-slate-400 rounded-2xl font-black text-xs active:scale-95">إلغاء</button></div>
                </motion.div>
             </div>
           )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default WalletModal;
