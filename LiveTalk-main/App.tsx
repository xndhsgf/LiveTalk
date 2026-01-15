
import React, { useState, useEffect, useRef } from 'react';
import { Home, User as UserIcon, Plus, Crown, Settings, LogOut, Smartphone, MessageCircle, Gamepad2, Search, Wallet, ShoppingBag, Package, Building, Zap, ShieldCheck, Edit3, Heart, ChevronRight, ChevronLeft, Globe, Trophy } from 'lucide-react';
import RoomCard from './components/RoomCard';
import VoiceRoom from './components/VoiceRoom';
import AuthScreen from './components/AuthScreen';
import AdminPanel from './components/AdminPanel';
import MessagesTab from './components/MessagesTab';
import ActivitiesTab from './components/ActivitiesTab';
import MiniPlayer from './components/MiniPlayer';
import VIPModal from './components/VIPModal';
import EditProfileModal from './components/EditProfileModal';
import BagModal from './components/BagModal';
import StoreModal from './components/StoreModal';
import WalletModal from './components/WalletModal';
import CreateRoomModal from './components/CreateRoomModal';
import AgencyRechargeModal from './components/AgencyRechargeModal';
import HostAgentDashboard from './components/HostAgentDashboard';
import ActivityModal from './components/ActivityModal';
import CPModal from './components/CPModal';
import GlobalBanner from './components/GlobalBanner';
import GlobalLeaderboardModal from './components/GlobalLeaderboardModal';
import PrivateChatModal from './components/PrivateChatModal';
import WheelGameModal from './components/WheelGameModal';
import SlotsGameModal from './components/SlotsGameModal';
import LionWheelGameModal from './components/LionWheelGameModal';
import { Room, User, VIPPackage, Gift, StoreItem, GameSettings, Activity, GlobalAnnouncement, GameType } from './types';
import { AnimatePresence, motion } from 'framer-motion';
import { db, auth } from './services/firebase';
import { EconomyEngine } from './services/economy';
import { collection, onSnapshot, doc, query, orderBy, getDoc, updateDoc, limit, where, setDoc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const PERMANENT_LOGO_URL = 'https://storage.googleapis.com/static.aistudio.google.com/stables/2025/03/06/f0e64906-e7e0-4a87-af9b-029e2467d302/f0e64906-e7e0-4a87-af9b-029e2467d302.png';

const calculateLvl = (pts: number) => {
  if (!pts || pts <= 0) return 1;
  const l = Math.floor(Math.sqrt(pts / 50000)); 
  return Math.max(1, Math.min(200, l));
};

// شارة لفل احترافية ومنسقة (تُستخدم في أماكن أخرى ولكن تم إزالتها من منطقة الهوية المطلوبة)
const ProfileBadge: React.FC<{ level: number; type: 'wealth' | 'recharge' }> = ({ level, type }) => {
  const isWealth = type === 'wealth';
  return (
    <div className="relative h-5 min-w-[55px] flex items-center pr-2 shrink-0">
      <div className={`absolute inset-0 right-2 rounded-l-md border border-white/10 ${isWealth ? 'bg-gradient-to-r from-purple-700 to-indigo-600 shadow-[0_0_10px_rgba(124,58,237,0.3)]' : 'bg-slate-900 border-blue-500/20'}`}></div>
      <div className="relative z-10 flex-1 text-center pr-1"><span className="text-[10px] font-black italic text-white drop-shadow-md">{level}</span></div>
      <div className="relative z-20 w-5 h-5 flex items-center justify-center -mr-1">
        <div className={`absolute inset-0 rounded-sm transform rotate-45 border border-white/20 ${isWealth ? 'bg-purple-600' : 'bg-black'}`}></div>
        <span className="relative z-30 text-[8px] mb-0.5">{isWealth ? '💎' : '⚡'}</span>
      </div>
    </div>
  );
};

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'messages' | 'profile' | 'rank'>('home');
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isRoomMinimized, setIsRoomMinimized] = useState(false);
  const [isUserMuted, setIsUserMuted] = useState(true);
  
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]); 
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [vipLevels, setVipLevels] = useState<VIPPackage[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [appName, setAppName] = useState('لايف توك - LiveTalk');
  const [appLogo, setAppLogo] = useState(PERMANENT_LOGO_URL);
  const [authBackground, setAuthBackground] = useState('');
  const [announcement, setAnnouncement] = useState<GlobalAnnouncement | null>(null);

  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showVIPModal, setShowVIPModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showBagModal, setShowBagModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showAgencyModal, setShowAgencyModal] = useState(false);
  const [showHostAgentDashboard, setShowHostAgentDashboard] = useState(false);
  const [showCPModal, setShowCPModal] = useState(false);
  const [showGlobalLeaderboard, setShowGlobalLeaderboard] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedChatPartner, setSelectedChatPartner] = useState<User | null>(null);
  const [activeGlobalGame, setActiveGlobalGame] = useState<GameType | null>(null);
  
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
  const bannerTimerRef = useRef<any>(null);
  const lastJoinedRoomId = useRef<string | null>(null);

  const [gameSettings, setGameSettings] = useState<GameSettings>({
    slotsWinRate: 35, wheelWinRate: 45, lionWinRate: 35, luckyGiftWinRate: 30, luckyGiftRefundPercent: 0, luckyXEnabled: false, luckyMultipliers: [], wheelJackpotX: 8, wheelNormalX: 2, slotsSevenX: 20, slotsFruitX: 5, availableEmojis: [], emojiDuration: 4
  });

  const handlePushState = () => {
    window.history.pushState({ popup: true }, "");
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (showAdminPanel) setShowAdminPanel(false);
      else if (showVIPModal) setShowVIPModal(false);
      else if (showEditProfileModal) setShowEditProfileModal(false);
      else if (showBagModal) setShowBagModal(false);
      else if (showStoreModal) setShowStoreModal(false);
      else if (showWalletModal) setShowWalletModal(false);
      else if (showCreateRoomModal) setShowCreateRoomModal(false);
      else if (showAgencyModal) setShowAgencyModal(false);
      else if (showHostAgentDashboard) setShowHostAgentDashboard(false);
      else if (showCPModal) setShowCPModal(false);
      else if (showGlobalLeaderboard) setShowGlobalLeaderboard(false);
      else if (selectedActivity) setSelectedActivity(null);
      else if (selectedChatPartner) setSelectedChatPartner(null);
      else if (activeGlobalGame) setActiveGlobalGame(null);
      else if (currentRoom && !isRoomMinimized) setIsRoomMinimized(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    showAdminPanel, showVIPModal, showEditProfileModal, showBagModal, showStoreModal, 
    showWalletModal, showCreateRoomModal, showAgencyModal, showHostAgentDashboard, 
    showCPModal, showGlobalLeaderboard, selectedActivity, selectedChatPartner, 
    activeGlobalGame, currentRoom, isRoomMinimized
  ]);

  useEffect(() => {
    const unsubIdentity = onSnapshot(doc(db, 'appSettings', 'identity'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.appLogo) setAppLogo(data.appLogo);
        if (data.authBackground) setAuthBackground(data.authBackground);
        if (data.appName) setAppName(data.appName);
      }
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const unsubUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const userData = { 
              id: docSnap.id, ...data,
              wealthLevel: calculateLvl(Number(data.wealth || 0)),
              rechargeLevel: calculateLvl(Number(data.rechargePoints || 0))
            } as User;
            setUser(userData);
          }
          setInitializing(false);
        });
        return () => unsubUser();
      } else {
        setUser(null);
        setInitializing(false);
      }
    });

    onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
    });

    onSnapshot(query(collection(db, 'rooms'), orderBy('listeners', 'desc')), (snapshot) => {
      setRooms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room)));
    });

    onSnapshot(collection(db, 'gifts'), (snapshot) => {
      setGifts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Gift)));
    });

    onSnapshot(collection(db, 'store'), (snap) => {
      setStoreItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoreItem)));
    });

    onSnapshot(collection(db, 'vip'), (snap) => {
      setVipLevels(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as VIPPackage)));
    });

    onSnapshot(collection(db, 'activities'), (snap) => {
      const activeActs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity))
        .filter(a => a.status === 'active');
      setActivities(activeActs);
    });

    onSnapshot(doc(db, 'appSettings', 'games'), (snap) => {
      if (snap.exists()) setGameSettings(prev => ({ ...prev, ...snap.data() }));
    });

    return () => { unsubIdentity(); unsubscribeAuth(); };
  }, []);

  useEffect(() => {
    if (activities.length > 1) {
      bannerTimerRef.current = setInterval(() => {
        setCurrentBannerIdx(prev => (prev + 1) % activities.length);
      }, 5000);
    }
    return () => clearInterval(bannerTimerRef.current);
  }, [activities]);

  const handleUpdateUser = async (updatedData: Partial<User>) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, ...updatedData } : null);
    try { await updateDoc(doc(db, 'users', user.id), updatedData); } catch (e) {}
  };

  const handleJoinRoom = async (room: Room) => {
    if (!user) return;
    if (lastJoinedRoomId.current !== room.id && user.activeEntry) {
      try {
        await addDoc(collection(db, 'rooms', room.id, 'entry_events'), {
          userId: user.id,
          userName: user.name,
          videoUrl: user.activeEntry,
          duration: user.activeEntryDuration || 6,
          timestamp: serverTimestamp()
        });
        lastJoinedRoomId.current = room.id;
      } catch (e) {}
    } else { lastJoinedRoomId.current = room.id; }
    
    handlePushState(); 
    setCurrentRoom(room);
    setIsRoomMinimized(false);
  };

  const handleLeaveRoom = async () => {
    if (!currentRoom || !user) return;
    const roomId = currentRoom.id;
    const isHost = currentRoom.hostId === user.id;
    if (isHost) {
      try { await deleteDoc(doc(db, 'rooms', roomId)); } catch (e) {}
    }
    lastJoinedRoomId.current = null;
    setCurrentRoom(null);
    setIsRoomMinimized(false);
  };

  const handleCreateRoom = async (data: any) => {
    if (!user) return;
    const roomId = 'room_' + Date.now();
    await setDoc(doc(db, 'rooms', roomId), { ...data, id: roomId, hostId: user.id, hostCustomId: user.customId, listeners: 1, speakers: [{ ...user, seatIndex: 0, isMuted: false, charm: 0 }] });
    const newRoom = { ...data, id: roomId, hostId: user.id, listeners: 1, speakers: [] };
    handleJoinRoom(newRoom);
  };

  if (initializing) return (
    <div className="h-screen w-full bg-[#030816] flex flex-col items-center justify-center gap-6">
       <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full" />
       <p className="text-white/50 font-black text-xs tracking-widest uppercase">تأمين الجلسة...</p>
    </div>
  );

  if (!user) return <AuthScreen onAuth={setUser} />;

  return (
    <div className="h-[100dvh] w-full bg-[#030816] text-white relative md:max-w-md mx-auto shadow-2xl overflow-hidden flex flex-col font-cairo">
      
      <AnimatePresence>
        {announcement && <GlobalBanner announcement={announcement} />}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        {activeTab === 'home' && (
           <div className="mt-2 space-y-3 px-4 relative">
              <div className="flex justify-between items-center mb-2 pt-4">
                <div className="flex items-center gap-2">
                   <img src={appLogo} className="w-8 h-8 rounded-lg object-cover" />
                   <span className="text-xs font-black text-white/60 uppercase tracking-widest">{appName}</span>
                </div>
                <button onClick={() => { handlePushState(); setShowGlobalLeaderboard(true); }} className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl flex items-center justify-center border border-amber-300/30 shadow-lg">
                   <Trophy size={20} className="text-white" fill="currentColor" />
                </button>
              </div>

              {activities.length > 0 && (
                <div className="w-full h-36 relative overflow-hidden rounded-[2rem] border border-white/5 bg-slate-900/50">
                   <div className="flex h-full w-full transition-transform duration-700 ease-out" style={{ transform: `translateX(${currentBannerIdx * 100}%)` }}>
                      {activities.map(act => (
                        <div key={act.id} onClick={() => { if(act.type === 'external_link') window.open(act.externalUrl, '_blank'); else { handlePushState(); setSelectedActivity(act); } }} className="w-full h-full shrink-0 relative cursor-pointer">
                           <img src={act.bannerUrl} className="w-full h-full object-cover" alt={act.title} />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                           <div className="absolute bottom-4 right-6 text-right">
                              <h4 className="text-white font-black text-sm drop-shadow-lg">{act.title}</h4>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              <div className="grid gap-2.5">{rooms.map(room => ( <RoomCard key={room.id} room={room} onClick={handleJoinRoom} /> ))}</div>
           </div>
        )}
        {activeTab === 'messages' && <MessagesTab currentUser={user} onOpenChat={(partner) => { handlePushState(); setSelectedChatPartner(partner); }} />}
        {activeTab === 'rank' && <ActivitiesTab onOpenGame={(game) => { handlePushState(); setActiveGlobalGame(game); }} />}
        {activeTab === 'profile' && (
          <div className="flex flex-col bg-[#030816] min-h-full" dir="rtl">
             <div className="relative w-full h-64 shrink-0 overflow-hidden">
               {user.cover ? <img src={user.cover} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-indigo-950 to-[#030816]"></div>}
               <div className="absolute inset-0 bg-gradient-to-t from-[#030816] to-transparent"></div>
               
               <div className="absolute bottom-4 right-6 flex items-end gap-5">
                  <div className="relative w-24 h-24 shrink-0">
                     <img src={user.avatar} className="w-full h-full rounded-full border-4 border-[#030816] object-cover bg-slate-800" />
                     {user.frame && <img src={user.frame} className="absolute inset-0 scale-[1.35] z-10 pointer-events-none" />}
                  </div>
                  
                  <div className="flex flex-col gap-2 pb-1 text-right">
                     <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-2xl font-black text-white drop-shadow-lg leading-tight">{user.name}</h2>
                     </div>
                     
                     {/* حاوية الـ ID المطورة: تم إزالة شارات الليفل تماماً بناءً على الطلب */}
                     <div className="flex flex-col items-start mt-1">
                        <div className="relative inline-flex items-center justify-center">
                           {user.badge ? (
                             <div className="relative flex items-center justify-center h-8 min-w-[90px] group">
                                {/* رقم الآيدي - متموضع تلقائياً في المنتصف فوق القالب */}
                                <div className="absolute z-20 text-white font-black text-[10px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] tracking-tighter ml-6">
                                   ID:{user.customId || user.id}
                                </div>
                                {/* القالب المرفوع */}
                                <img src={user.badge} className="h-8 object-contain drop-shadow-lg z-10" alt="Special ID" />
                             </div>
                           ) : (
                             <div className="bg-blue-600/60 backdrop-blur-md px-3 py-1 rounded-lg text-[9px] font-black shadow-lg border border-blue-400/20">ID:{user.customId || user.id}</div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>

               <div className="absolute top-12 left-6">
                  <button onClick={() => { handlePushState(); setShowEditProfileModal(true); }} className="p-2.5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 text-white active:scale-90 transition-all shadow-xl"><Edit3 size={18}/></button>
               </div>
            </div>

            <div className="px-6 mt-8 grid grid-cols-4 gap-y-8 gap-x-4">
               <button onClick={() => { handlePushState(); setShowWalletModal(true); }} className="flex flex-col items-center gap-2 group">
                  <div className="w-14 h-14 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-500 shadow-xl group-active:scale-90 transition-transform"><Wallet size={24}/></div>
                  <span className="text-[10px] font-black text-slate-300">المحفظة</span>
               </button>
               <button onClick={() => { handlePushState(); setShowStoreModal(true); }} className="flex flex-col items-center gap-2 group">
                  <div className="w-14 h-14 bg-cyan-600/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-500 shadow-xl group-active:scale-90 transition-transform"><ShoppingBag size={24}/></div>
                  <span className="text-[10px] font-black text-slate-300">المتجر</span>
               </button>
               <button onClick={() => { handlePushState(); setShowBagModal(true); }} className="flex flex-col items-center gap-2 group">
                  <div className="w-14 h-14 bg-purple-600/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-purple-500 shadow-xl group-active:scale-90 transition-transform"><Package size={24}/></div>
                  <span className="text-[10px] font-black text-slate-300">الحقيبة</span>
               </button>
               <button onClick={() => { handlePushState(); setShowVIPModal(true); }} className="flex flex-col items-center gap-2 group">
                  <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-500 shadow-xl group-active:scale-90 transition-transform"><Crown size={24}/></div>
                  <span className="text-[10px] font-black text-amber-500">الـ VIP</span>
               </button>
               <button onClick={() => { handlePushState(); setShowCPModal(true); }} className="flex flex-col items-center gap-2 group">
                  <div className="w-14 h-14 bg-pink-600/10 border border-pink-500/20 rounded-2xl flex items-center justify-center text-pink-500 shadow-xl group-active:scale-90 transition-transform"><Heart size={24} fill="currentColor"/></div>
                  <span className="text-[10px] font-black text-slate-300">الارتباط</span>
               </button>
               {user.isAgency && (
                  <button onClick={() => { handlePushState(); setShowAgencyModal(true); }} className="flex flex-col items-center gap-2 group">
                     <div className="w-14 h-14 bg-orange-600/10 border border-orange-500/20 rounded-2xl flex items-center justify-center text-orange-500 shadow-xl animate-pulse"><Zap size={24}/></div>
                     <span className="text-[10px] font-black text-slate-300">الشحن</span>
                  </button>
               )}
               {user.isHostAgent && (
                  <button onClick={() => { handlePushState(); setShowHostAgentDashboard(true); }} className="flex flex-col items-center gap-2 group">
                     <div className="w-14 h-14 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 shadow-xl border-b-4 border-emerald-500/40"><Building size={24}/></div>
                     <span className="text-[10px] font-black text-emerald-400">الوكالة</span>
                  </button>
               )}
               {(user.isAdmin || user.isSystemModerator) && (
                  <button onClick={() => { handlePushState(); setShowAdminPanel(true); }} className="flex flex-col items-center gap-2 group">
                     <div className="w-14 h-14 bg-red-600/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500 shadow-xl"><ShieldCheck size={24}/></div>
                     <span className="text-[10px] font-black text-slate-300">السيستم</span>
                  </button>
               )}
            </div>

            <div className="mt-auto px-6 pb-12 pt-10">
               <button onClick={async () => { await signOut(auth); window.location.reload(); }} className="w-full py-4 bg-red-600/10 text-red-500 rounded-2xl border border-red-500/20 font-black flex items-center justify-center gap-2 active:scale-95 transition-all"><LogOut size={18}/> تسجيل الخروج</button>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-[#030816]/80 backdrop-blur-xl border-t border-white/5 h-20 flex items-center px-4 z-20 pb-[env(safe-area-inset-bottom)]">
         <div className="relative w-full h-14 bg-white/5 rounded-full border border-white/5 flex items-center justify-around">
            <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'text-amber-400' : 'text-slate-500'}><Home size={22}/></button>
            <button onClick={() => setActiveTab('messages')} className={activeTab === 'messages' ? 'text-amber-400' : 'text-slate-500'}><MessageCircle size={22}/></button>
            <button onClick={() => { handlePushState(); setShowCreateRoomModal(true); }} className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center -translate-y-4 border-4 border-[#030816] shadow-xl text-black active:scale-90 transition-transform"><Plus size={28}/></button>
            <button onClick={() => setActiveTab('rank')} className={activeTab === 'rank' ? 'text-amber-400' : 'text-slate-500'}><Gamepad2 size={22}/></button>
            <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'text-amber-400' : 'text-slate-500'}><UserIcon size={22}/></button>
         </div>
      </div>

      <AnimatePresence>
        {currentRoom && !isRoomMinimized && (
          <motion.div key="room" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed inset-0 z-[150]">
            <VoiceRoom room={currentRoom} currentUser={user!} onLeave={handleLeaveRoom} onMinimize={() => setIsRoomMinimized(true)} gifts={gifts} gameSettings={gameSettings} onUpdateUser={handleUpdateUser} users={users} onOpenPrivateChat={(partner: User) => { handlePushState(); setSelectedChatPartner(partner); }} onOpenCP={() => { handlePushState(); setShowCPModal(true); }} onPushState={handlePushState} />
          </motion.div>
        )}
        {selectedChatPartner && <PrivateChatModal partner={selectedChatPartner} currentUser={user!} onClose={() => setSelectedChatPartner(null)} />}
        {activeGlobalGame === 'wheel' && <WheelGameModal isOpen={true} onClose={() => setActiveGlobalGame(null)} userCoins={Number(user.coins)} onUpdateCoins={(c) => handleUpdateUser({ coins: c })} winRate={gameSettings.wheelWinRate} gameSettings={gameSettings} />}
        {activeGlobalGame === 'slots' && <SlotsGameModal isOpen={true} onClose={() => setActiveGlobalGame(null)} userCoins={Number(user.coins)} onUpdateCoins={(c) => handleUpdateUser({ coins: c })} winRate={gameSettings.slotsWinRate} gameSettings={gameSettings} />}
        {activeGlobalGame === 'lion' && <LionWheelGameModal isOpen={true} onClose={() => setActiveGlobalGame(null)} userCoins={Number(user.coins)} onUpdateCoins={(c) => handleUpdateUser({ coins: c })} gameSettings={gameSettings} />}
        {showVIPModal && <VIPModal user={user!} vipLevels={vipLevels} onClose={() => setShowVIPModal(false)} onBuy={(vip) => EconomyEngine.buyVIP(user!.id, user!.coins, user!.wealth, vip, handleUpdateUser)} />}
        {showEditProfileModal && <EditProfileModal isOpen={showEditProfileModal} onClose={() => setShowEditProfileModal(false)} currentUser={user!} onSave={handleUpdateUser} />}
        {showBagModal && <BagModal isOpen={showBagModal} onClose={() => setShowBagModal(false)} user={user!} onEquip={(item) => handleUpdateUser({ [item.type === 'frame' ? 'frame' : item.type === 'bubble' ? 'activeBubble' : 'activeEntry']: item.url })} />}
        {showStoreModal && <StoreModal isOpen={showStoreModal} onClose={() => setShowStoreModal(false)} items={storeItems} user={user!} onBuy={(item) => EconomyEngine.spendCoins(user!.id, user!.coins, user!.wealth, item.price, user!.ownedItems || [], item.id, handleUpdateUser, item, user!.earnedItems || [])} />}
        {showWalletModal && <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} user={user!} onExchange={(amt) => EconomyEngine.exchangeDiamonds(user!.id, user!.coins, user!.diamonds, amt, handleUpdateUser)} onAgencyExchange={(aid, amt) => EconomyEngine.exchangeSalaryToAgency(user!.id, user!.diamonds, aid, amt, handleUpdateUser)} />}
        {showCreateRoomModal && <CreateRoomModal isOpen={showCreateRoomModal} onClose={() => setShowCreateRoomModal(false)} onCreate={handleCreateRoom} />}
        {showAgencyModal && <AgencyRechargeModal isOpen={showAgencyModal} onClose={() => setShowAgencyModal(false)} agentUser={user!} users={users} onCharge={(tid, amt) => EconomyEngine.agencyTransfer(user!.id, user!.agencyBalance, tid, 0, 0, amt, (a, u) => handleUpdateUser(a))} />}
        {showHostAgentDashboard && <HostAgentDashboard isOpen={showHostAgentDashboard} onClose={() => setShowHostAgentDashboard(false)} agentUser={user!} allUsers={users} />}
        {showCPModal && <CPModal isOpen={showCPModal} onClose={() => setShowCPModal(false)} currentUser={user!} users={users} gameSettings={gameSettings} onUpdateUser={handleUpdateUser} />}
        {showGlobalLeaderboard && <GlobalLeaderboardModal isOpen={showGlobalLeaderboard} onClose={() => setShowGlobalLeaderboard(false)} users={users} />}
        {selectedActivity && <ActivityModal isOpen={!!selectedActivity} onClose={() => setSelectedActivity(null)} activity={selectedActivity} user={user!} onUpdateUser={handleUpdateUser} />}
      </AnimatePresence>
      {isRoomMinimized && currentRoom && <MiniPlayer room={currentRoom} onExpand={() => setIsRoomMinimized(false)} onLeave={handleLeaveRoom} isMuted={isUserMuted} onToggleMute={() => setIsUserMuted(!isUserMuted)} />}
      {showAdminPanel && <AdminPanel isOpen={showAdminPanel} onClose={() => setShowAdminPanel(false)} currentUser={user!} users={users} onUpdateUser={(uid, data) => updateDoc(doc(db, 'users', uid), data)} rooms={rooms} setRooms={() => {}} onUpdateRoom={() => Promise.resolve()} gifts={gifts} storeItems={storeItems} vipLevels={vipLevels} gameSettings={gameSettings} setGameSettings={async (s) => setGameSettings(s)} appBanner="" onUpdateAppBanner={() => {}} appLogo={appLogo} onUpdateAppLogo={(l) => setDoc(doc(db, 'appSettings', 'identity'), { appLogo: l }, { merge: true })} appName={appName} onUpdateAppName={(n) => setDoc(doc(db, 'appSettings', 'identity'), { appName: n }, { merge: true })} authBackground={authBackground} onUpdateAuthBackground={(b) => setDoc(doc(db, 'appSettings', 'identity'), { authBackground: b }, { merge: true })} />}
    </div>
  );
}
