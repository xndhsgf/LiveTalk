
import React from 'react';
import { db } from '../../services/firebase';
import { 
  doc, 
  getDoc, 
  writeBatch, 
  increment, 
  collection, 
  serverTimestamp 
} from 'firebase/firestore';
import { Room, User, Gift, GameSettings } from '../../types';

interface VoiceRoomInternalProps {
  room: Room;
  currentUser: User;
  onLeave: () => void;
  onMinimize: () => void;
  gifts: Gift[];
  gameSettings: GameSettings;
  onUpdateUser: (updatedData: Partial<User>) => void;
  users: User[];
  onOpenPrivateChat: (partner: User) => void;
  onOpenCP: () => void;
  onPushState: () => void;
}

// Utility to calculate level based on standard app logic
const calculateLiveLvl = (pts: number) => {
  if (!pts || pts <= 0) return 1;
  const l = Math.floor(Math.sqrt(pts / 50000)); 
  return Math.max(1, Math.min(200, l));
};

const VoiceRoomInternal: React.FC<VoiceRoomInternalProps> = ({ 
  room: initialRoom, 
  currentUser, 
  users 
}) => {

  const queueRoomSpeakersUpdate = (speakers: any[]) => {
    // Placeholder for speaker sync logic
    console.log("Updating room speakers", speakers);
  };

  const commitSingleGift = async (gift: Gift, qty: number, recIds: string[], cost: number, win: number, speakers: any[]) => {
    const batch = writeBatch(db);
    
    // جلب نسبة الإنتاج من الإعدادات
    let productionRatio = 0.7; // الافتراضي 70%
    try {
      const econSnap = await getDoc(doc(db, 'appSettings', 'economy'));
      if (econSnap.exists()) {
        productionRatio = (econSnap.data().hostProductionRatio || 70) / 100;
      }
    } catch (e) { console.warn("Economy load error, using default 70%"); }

    batch.update(doc(db, 'users', currentUser.id), { coins: increment(-cost + win), wealth: increment(cost) });
    recIds.forEach(rid => {
      const recipientUser = users.find((u: User) => u.id === rid);
      const hostAgencyId = recipientUser?.hostAgencyId;
      const valuePerRecipient = (gift.cost * qty);
      
      // استخدام النسبة الديناميكية
      const earnings = valuePerRecipient * productionRatio;
      
      batch.update(doc(db, 'users', rid), { 
        charm: increment(valuePerRecipient), 
        diamonds: increment(earnings), 
        ...(hostAgencyId ? { hostProduction: increment(earnings) } : {}) 
      });
      
      if (hostAgencyId) batch.update(doc(db, 'host_agencies', hostAgencyId), { totalProduction: increment(earnings) });
      batch.set(doc(db, 'rooms', initialRoom.id, 'contributors', currentUser.id), { userId: currentUser.id, name: currentUser.name, avatar: currentUser.avatar, amount: increment(valuePerRecipient) }, { merge: true });
    });
    
    batch.set(doc(collection(db, 'rooms', initialRoom.id, 'gift_events')), { 
      giftId: gift.id, giftName: gift.name, giftIcon: gift.icon, giftAnimation: gift.animationType || 'pop', 
      senderId: currentUser.id, senderName: currentUser.name, recipientIds: recIds, quantity: qty, 
      duration: gift.duration || 5, displaySize: gift.displaySize || 'medium', soundUrl: gift.soundUrl || '', timestamp: serverTimestamp() 
    });

    if (win >= 10000 || cost >= 10000) {
      batch.set(doc(collection(db, 'global_announcements')), { senderId: currentUser.id, senderName: currentUser.name, giftName: gift.name, giftIcon: (gift.catalogIcon || gift.icon), recipientName: recIds.length > 1 ? `${recIds.length} مستخدمين` : (users.find((u: User) => u.id === recIds[0])?.name || 'مستخدم'), roomTitle: initialRoom.title, roomId: initialRoom.id, amount: win >= 10000 ? win : cost, type: win >= 10000 ? 'lucky_win' : 'gift', timestamp: serverTimestamp() });
    }
    const wealthLvl = calculateLiveLvl(Number(currentUser.wealth || 0) + cost);
    batch.set(doc(collection(db, 'rooms', initialRoom.id, 'messages')), { userId: currentUser.id, userName: currentUser.name, userWealthLevel: wealthLvl, userRechargeLevel: calculateLiveLvl(Number(currentUser.rechargePoints || 0)), content: win > 0 ? `أرسل ${gift.name} x${qty} وفاز بـ ${win.toLocaleString()} 🪙!` : `أرسل ${gift.name} x${qty} 🎁`, type: 'gift', isLuckyWin: win > 0, timestamp: serverTimestamp() });
    
    await batch.commit(); 
    queueRoomSpeakersUpdate(speakers);
  };

  return (
    <div className="voice-room-container">
      {/* UI logic implementation... */}
    </div>
  );
};

export default VoiceRoomInternal;