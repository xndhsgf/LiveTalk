
import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, Users, PlusCircle, Building, Trash2, ChevronRight, UserPlus, Trophy, Coins, Settings2, Percent, Zap, TrendingUp, Save } from 'lucide-react';
import { db } from '../../services/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, query, where, getDocs, serverTimestamp, increment, getDoc, arrayUnion } from 'firebase/firestore';
import { User, HostAgency } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminHostAgenciesProps {
  users: User[];
  onUpdateUser: (userId: string, data: Partial<User>) => Promise<void>;
}

const AdminHostAgencies: React.FC<AdminHostAgenciesProps> = ({ users, onUpdateUser }) => {
  const [agencies, setAgencies] = useState<HostAgency[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newAgencyName, setNewAgencyName] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewingAgency, setViewingAgency] = useState<HostAgency | null>(null);
  const [agencyHosts, setAgencyHosts] = useState<User[]>([]);
  
  // إعدادات الاقتصاد
  const [economySettings, setEconomySettings] = useState({
    hostProductionRatio: 70, // 70%
    salaryToAgencyRatio: 1.14 // (80000 / 70000)
  });
  const [isSavingEconomy, setIsSavingEconomy] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'host_agencies'), (snapshot) => {
      setAgencies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HostAgency)));
    });

    const unsubEconomy = onSnapshot(doc(db, 'appSettings', 'economy'), (snap) => {
      if (snap.exists()) setEconomySettings(prev => ({ ...prev, ...snap.data() }));
    });

    return () => { unsub(); unsubEconomy(); };
  }, []);

  const handleSaveEconomy = async () => {
    setIsSavingEconomy(true);
    try {
      await setDoc(doc(db, 'appSettings', 'economy'), economySettings, { merge: true });
      alert('تم تحديث إعدادات الاقتصاد الملكي بنجاح ✅');
    } catch (e) {
      alert('فشل حفظ الإعدادات');
    } finally {
      setIsSavingEconomy(false);
    }
  };

  const handleCreateAgency = async () => {
    if (!selectedUser || !newAgencyName.trim()) return;
    const agencyId = 'agency_' + Date.now();
    try {
      const medalsSnap = await getDoc(doc(db, 'appSettings', 'medals_library'));
      const autoAgentMedal = medalsSnap.exists() ? medalsSnap.data().autoAgentMedal : null;

      await setDoc(doc(db, 'host_agencies', agencyId), {
        name: newAgencyName,
        agentId: selectedUser.id,
        agentName: selectedUser.name,
        createdAt: serverTimestamp(),
        totalProduction: 0
      });

      let currentAchievements = [...(selectedUser.achievements || [])];
      if (autoAgentMedal && !currentAchievements.includes(autoAgentMedal)) {
        currentAchievements.unshift(autoAgentMedal);
      }

      await onUpdateUser(selectedUser.id, { 
        isHostAgent: true, 
        hostAgencyId: agencyId,
        achievements: currentAchievements.slice(0, 30)
      });

      alert('تم فتح الوكالة ومنح وسام الوكيل الملكي بنجاح! ✅');
      setSelectedUser(null);
      setNewAgencyName('');
    } catch (e) { alert('فشل فتح الوكالة'); }
  };

  const fetchAgencyHosts = async (agencyId: string) => {
    const q = query(collection(db, 'users'), where('hostAgencyId', '==', agencyId));
    const snap = await getDocs(q);
    setAgencyHosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
  };

  const handleAddHostToAgency = async (userId: string) => {
    if (!viewingAgency) return;
    try {
      const medalsSnap = await getDoc(doc(db, 'appSettings', 'medals_library'));
      const autoHostMedal = medalsSnap.exists() ? medalsSnap.data().autoHostMedal : null;
      const user = users.find(u => u.id === userId);
      if (!user) return;

      let currentAchievements = [...(user.achievements || [])];
      if (autoHostMedal && !currentAchievements.includes(autoHostMedal)) {
        currentAchievements.unshift(autoHostMedal);
      }

      await updateDoc(doc(db, 'users', userId), {
        isHost: true,
        hostAgencyId: viewingAgency.id,
        hostProduction: 0,
        achievements: currentAchievements.slice(0, 30)
      });

      alert('تم إضافة المضيف للوكالة ومنح وسام المضيف الرسمي بنجاح! ✅');
      fetchAgencyHosts(viewingAgency.id);
    } catch (e) { alert('فشل الإضافة'); }
  };

  const filteredUsers = searchQuery.trim() === '' ? [] : users.filter(u => 
    u.customId?.toString() === searchQuery || u.id === searchQuery
  ).slice(0, 3);

  return (
    <div className="space-y-8 text-right font-cairo" dir="rtl">
      
      {/* قسم التحكم الاقتصادي الاحترافي */}
      <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900/40 p-8 rounded-[3rem] border border-indigo-500/20 shadow-2xl">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1">
               <h3 className="text-2xl font-black text-white flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-900/40"><Settings2 className="text-white" /></div>
                  مركز التحكم الاقتصادي (Economy Control)
               </h3>
               <p className="text-slate-500 text-xs font-bold mt-2">تحكم في نسب الأرباح التي يتقاضاها المضيفون والوكلاء من النظام.</p>
            </div>
            <button 
               onClick={handleSaveEconomy}
               disabled={isSavingEconomy}
               className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
               {isSavingEconomy ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
               حفظ الإعدادات المالية
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5 space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <TrendingUp className="text-amber-500" size={18} />
                     <h4 className="text-sm font-black text-white">نسبة تارجت المضيف</h4>
                  </div>
                  <div className="bg-amber-500 text-black px-3 py-0.5 rounded-lg font-black text-xs">{economySettings.hostProductionRatio}%</div>
               </div>
               <input 
                  type="range" min="1" max="100" 
                  value={economySettings.hostProductionRatio}
                  onChange={(e) => setEconomySettings({...economySettings, hostProductionRatio: parseInt(e.target.value)})}
                  className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-amber-500"
               />
               <p className="text-[10px] text-slate-500 font-bold leading-relaxed">تحدد هذه النسبة مقدار ما يدخل في "تارجت" المضيف من قيمة الهدايا المستلمة. (المتبقي يذهب للوكالة والنظام)</p>
            </div>

            <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5 space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Zap className="text-orange-500" size={18} />
                     <h4 className="text-sm font-black text-white">معامل تحويل الراتب للوكيل</h4>
                  </div>
                  <div className="bg-orange-500 text-black px-3 py-0.5 rounded-lg font-black text-xs">x{economySettings.salaryToAgencyRatio.toFixed(2)}</div>
               </div>
               <div className="flex gap-4">
                  <input 
                    type="number" step="0.01"
                    value={economySettings.salaryToAgencyRatio}
                    onChange={(e) => setEconomySettings({...economySettings, salaryToAgencyRatio: parseFloat(e.target.value) || 1})}
                    className="flex-1 bg-slate-900 border border-white/10 rounded-xl p-3 text-center text-orange-500 font-black"
                  />
                  <div className="flex-[1.5] bg-black/30 border border-white/5 rounded-xl p-3 flex flex-col justify-center items-center">
                     <span className="text-[8px] text-slate-500 font-black uppercase">مثال التحويل</span>
                     <span className="text-[10px] text-white font-bold">70,000 💎 = {(70000 * economySettings.salaryToAgencyRatio).toLocaleString()} 🪙</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-white flex items-center gap-3">
             <div className="p-2 bg-blue-600 rounded-xl shadow-lg"><Building size={24} /></div>
             إدارة وكالات المضيفين
          </h3>
          <p className="text-slate-500 text-xs font-bold mt-1">افتح وكالات جديدة وتابع إنتاج المضيفين.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-black/20 p-6 rounded-[2.5rem] border border-white/5 space-y-6">
           <h4 className="text-white font-black text-sm flex items-center gap-2"><PlusCircle className="text-emerald-500" /> فتح وكالة جديدة</h4>
           <div className="space-y-4">
              <input 
                type="text" 
                placeholder="ابحث بآيدي الوكيل الجديد..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none"
              />
              {filteredUsers.map(u => (
                 <button key={u.id} onClick={() => setSelectedUser(u)} className={`w-full p-4 rounded-2xl flex items-center gap-4 border transition-all ${selectedUser?.id === u.id ? 'bg-blue-600/20 border-blue-500' : 'bg-black/40 border-white/5 hover:bg-white/5'}`}>
                    <img src={u.avatar} className="w-10 h-10 rounded-xl object-cover" />
                    <div className="text-right flex-1">
                       <p className="text-white font-black text-xs">{u.name}</p>
                       <p className="text-[10px] text-slate-500">ID: {u.customId || u.id}</p>
                    </div>
                    {selectedUser?.id === u.id && <ShieldCheck className="text-blue-500" />}
                 </button>
              ))}

              {selectedUser && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4 border-t border-white/5">
                    <input 
                      type="text" 
                      placeholder="اسم الوكالة..." 
                      value={newAgencyName}
                      onChange={(e) => setNewAgencyName(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-blue-500"
                    />
                    <button onClick={handleCreateAgency} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all">إتمام فتح الوكالة</button>
                 </motion.div>
              )}
           </div>
        </div>

        <div className="bg-black/20 p-6 rounded-[2.5rem] border border-white/5 space-y-4">
           <h4 className="text-white font-black text-sm flex items-center gap-2"><Trophy className="text-amber-500" /> الوكالات النشطة ({agencies.length})</h4>
           <div className="space-y-3 overflow-y-auto max-h-[400px] scrollbar-hide">
              {agencies.map(agency => (
                 <div key={agency.id} className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:border-blue-500/50 transition-all">
                    <div>
                       <p className="text-white font-black text-sm">{agency.name}</p>
                       <p className="text-[10px] text-slate-500 italic">الوكيل: {agency.agentName}</p>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => { setViewingAgency(agency); fetchAgencyHosts(agency.id); }} className="p-2 bg-blue-600/10 text-blue-500 rounded-lg hover:bg-blue-600 hover:text-white"><ChevronRight size={18} /></button>
                       <button onClick={async () => { if(confirm('حذف الوكالة؟')) await deleteDoc(doc(db, 'host_agencies', agency.id)) }} className="p-2 bg-red-600/10 text-red-500 rounded-lg hover:bg-red-600 hover:text-white"><Trash2 size={18} /></button>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>

      <AnimatePresence>
        {viewingAgency && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-slate-900 border border-white/10 rounded-[3rem] w-full max-w-2xl p-8 shadow-2xl flex flex-col max-h-[90vh]">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-white flex items-center gap-3"><Building className="text-blue-500"/> تفاصيل وكالة: {viewingAgency.name}</h3>
                  <button onClick={() => setViewingAgency(null)} className="p-2 text-slate-500"><PlusCircle className="rotate-45" size={28}/></button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-hidden">
                  <div className="space-y-4">
                     <h5 className="text-[10px] font-black text-slate-500 uppercase pr-2">إضافة مضيف جديد للوكالة</h5>
                     <div className="relative">
                        <input 
                           type="text" 
                           placeholder="ادخل آيدي المضيف..." 
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none"
                        />
                        <div className="mt-2 space-y-2">
                           {filteredUsers.map(u => (
                              <button key={u.id} onClick={() => handleAddHostToAgency(u.id)} className="w-full p-3 bg-white/5 rounded-xl flex items-center gap-3 text-right hover:bg-emerald-600/20 transition-all">
                                 <img src={u.avatar} className="w-8 h-8 rounded-lg object-cover" />
                                 <div className="flex-1">
                                    <p className="text-xs font-bold text-white">{u.name}</p>
                                    <p className="text-[9px] text-slate-500">ID: {u.customId || u.id}</p>
                                 </div>
                                 <UserPlus size={16} className="text-emerald-500" />
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col bg-black/20 rounded-[2rem] border border-white/5 overflow-hidden">
                     <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                        <h5 className="text-xs font-black text-white">قائمة المضيفين ({agencyHosts.length})</h5>
                        <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                           <Coins size={10} className="text-amber-500" />
                           <span className="text-[10px] font-black text-amber-500">{viewingAgency.totalProduction?.toLocaleString()}</span>
                        </div>
                     </div>
                     <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {agencyHosts.map(host => (
                           <div key={host.id} className="bg-slate-800/40 p-3 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <img src={host.avatar} className="w-8 h-8 rounded-full border border-white/10" />
                                 <div className="text-right">
                                    <p className="text-[11px] font-black text-white leading-none">{host.name}</p>
                                    <p className="text-[8px] text-slate-500 mt-1">تارجت: {(host.hostProduction || 0).toLocaleString()}</p>
                                 </div>
                              </div>
                              <button onClick={async () => { if(confirm('سحب المضيف من الوكالة؟')) { await updateDoc(doc(db, 'users', host.id), { hostAgencyId: null, isHost: false }); fetchAgencyHosts(viewingAgency.id); } }} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={14}/></button>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminHostAgencies;
