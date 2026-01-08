
import { db } from './firebase';
import { doc, increment, writeBatch, arrayUnion, updateDoc } from 'firebase/firestore';

export const EconomyEngine = {
  
  // 1. صرف كوينز لشراء منتج من المتجر
  spendCoins: async (userId: string, currentCoins: any, currentWealth: any, amount: any, currentOwnedItems: string[], itemId: string | null, updateLocalState: (data: any) => void, itemMetadata?: any, currentEarnedItems: any[] = []) => {
    const coins = Number(currentCoins || 0);
    const wealth = Number(currentWealth || 0);
    const cost = Number(amount || 0);

    if (cost <= 0 || coins < cost) return false;
    
    // --- البيانات المحلية (لـ React) ---
    const localUpdate: any = { 
      coins: coins - cost, 
      wealth: wealth + cost 
    };

    let newItemForState: any = null;
    if (itemId && itemMetadata) {
      const now = Date.now();
      const instanceId = `${itemId}_buy_${now}`;
      
      const expiresAt = itemMetadata.ownershipDays > 0 
        ? now + (itemMetadata.ownershipDays * 24 * 60 * 60 * 1000) 
        : null;

      newItemForState = {
        id: instanceId, 
        originalId: itemId, 
        name: itemMetadata.name,
        type: itemMetadata.type,
        url: itemMetadata.url,
        expiresAt: expiresAt,
        duration: itemMetadata.duration || 6, // حفظ مدة الأنميشن
        price: itemMetadata.price || 0
      };

      // تقليم المصفوفة المحلية لمنع تضخم الحالة
      const updatedEarned = [...(Array.isArray(currentEarnedItems) ? currentEarnedItems : []), newItemForState];
      localUpdate.earnedItems = updatedEarned.slice(-12);
      
      if (!currentOwnedItems.includes(itemId)) {
        localUpdate.ownedItems = [...currentOwnedItems, itemId];
      }
    }

    // تحديث الواجهة فوراً
    updateLocalState(localUpdate);

    // --- البيانات البعيدة (لـ Firestore) ---
    try {
      const userRef = doc(db, 'users', userId);
      
      const firestoreUpdate: any = { 
        coins: increment(-cost), 
        wealth: increment(cost) 
      };
      
      if (itemId) firestoreUpdate.ownedItems = arrayUnion(itemId);
      
      // لا نستخدم arrayUnion هنا إذا أردنا التقليم، بل نقوم بتحديث المصفوفة كاملة بعد التقليم
      if (newItemForState) {
        firestoreUpdate.earnedItems = localUpdate.earnedItems;
      }
      
      await updateDoc(userRef, firestoreUpdate);
      return true;
    } catch (e: any) { 
      console.error("Economy Database Error:", e);
      return false; 
    }
  },

  // 2. شراء رتبة VIP
  buyVIP: async (userId: string, currentCoins: any, currentWealth: any, vip: any, updateLocalState: (data: any) => void) => {
    const coins = Number(currentCoins || 0);
    const cost = Number(vip.cost || 0);
    if (coins < cost) return false;

    updateLocalState({ 
      isVip: true, 
      vipLevel: vip.level, 
      coins: coins - cost, 
      wealth: Number(currentWealth || 0) + cost, 
      frame: vip.frameUrl 
    });

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { 
        isVip: true, 
        vipLevel: vip.level, 
        coins: increment(-cost), 
        wealth: increment(cost), 
        frame: vip.frameUrl 
      });
      return true;
    } catch (e) { return false; }
  },

  // 3. تحويل الألماس لكوينز
  exchangeDiamonds: async (userId: string, currentCoins: any, currentDiamonds: any, amount: any, updateLocalState: (data: any) => void) => {
    const cost = Number(amount || 0);
    const diamonds = Number(currentDiamonds || 0);
    if (cost <= 0 || diamonds < cost) return false;
    const coinsGained = Math.floor(cost * 0.5);

    updateLocalState({ 
      coins: Number(currentCoins || 0) + coinsGained, 
      diamonds: diamonds - cost 
    });

    try {
      await updateDoc(doc(db, 'users', userId), { 
        coins: increment(coinsGained), 
        diamonds: increment(-cost) 
      });
      return true;
    } catch (e) { return false; }
  },

  agencyTransfer: async (agentId: string, agentBalance: any, targetId: string, targetCoins: any, targetRechargePoints: any, amount: number, callback: (agentUpdate: any, userUpdate: any) => void) => {
    const balance = Number(agentBalance || 0);
    if (balance < amount) return false;
    callback({ agencyBalance: balance - amount }, null);

    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'users', agentId), { agencyBalance: increment(-amount) });
      batch.update(doc(db, 'users', targetId), { 
        coins: increment(amount),
        rechargePoints: increment(amount)
      });
      await batch.commit();
      return true;
    } catch (e) {
      console.error("Agency Transfer Error:", e);
      return false;
    }
  },

  exchangeSalaryToAgency: async (userId: string, userDiamonds: any, agentId: string, amount: number, updateLocalState: (data: any) => void) => {
    const diamonds = Number(userDiamonds || 0);
    if (diamonds < amount) return false;
    const agencyBalanceGained = Math.floor((amount / 70000) * 80000);
    updateLocalState({ diamonds: diamonds - amount });

    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'users', userId), { diamonds: increment(-amount) });
      batch.update(doc(db, 'users', agentId), { agencyBalance: increment(agencyBalanceGained) });
      await batch.commit();
      return true;
    } catch (e) {
      console.error("Salary Exchange Error:", e);
      return false;
    }
  }
};
