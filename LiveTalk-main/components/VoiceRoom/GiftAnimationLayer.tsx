
import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../services/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { User, GiftDisplaySize } from '../../types';

interface GiftEvent {
  id: string;
  giftId: string;
  giftName: string;
  giftIcon: string;
  giftAnimation: string; // 'none', 'pop', 'full-screen', etc.
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientIds: string[];
  quantity: number;
  duration?: number;
  displaySize?: GiftDisplaySize;
  timestamp: any;
}

interface GiftAnimationLayerProps {
  roomId: string;
  currentUserId: string;
  speakers?: any[];
  onActiveChange?: (active: boolean) => void;
}

const FullScreenVideoPlayer = ({ src, onEnded }: { src: string, onEnded?: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    video.volume = 1.0;
    video.play().catch(err => {
      console.warn("Autoplay blocked, trying muted", err);
      video.muted = true;
      video.play();
    });
  }, [src]);

  return (
    <video 
      ref={videoRef}
      src={src} 
      autoPlay
      playsInline
      onEnded={onEnded}
      className="absolute inset-0 w-full h-full object-cover pointer-events-none z-[5000]"
    />
  );
};

export const GiftAnimationLayer = forwardRef((props: GiftAnimationLayerProps, ref) => {
  const { roomId, currentUserId, onActiveChange } = props;
  const [activeAnimations, setActiveAnimations] = useState<GiftEvent[]>([]);
  const playedIds = useRef(new Set<string>());

  useEffect(() => {
    if (onActiveChange) {
      onActiveChange(activeAnimations.length > 0);
    }
  }, [activeAnimations, onActiveChange]);

  const isVideoUrl = (url: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg|mov|m4v)$/i) || url.includes('video');
  };

  const triggerAnimation = (event: GiftEvent) => {
    if (playedIds.current.has(event.id)) return;
    playedIds.current.add(event.id);

    setActiveAnimations(prev => [...prev, event]);
    
    // إذا كان هناك مدة محددة للهدية نستخدمها، وإلا 5 ثوانٍ افتراضية
    const displayDuration = (event.duration || 5) * 1000;
    
    // إزالة الهدية بعد انتهاء المدة
    setTimeout(() => {
      setActiveAnimations(prev => prev.filter(a => a.id !== event.id));
      // تنظيف المعرف بعد فترة لضمان عدم التكرار المباشر
      setTimeout(() => playedIds.current.delete(event.id), 10000);
    }, displayDuration);
  };

  useImperativeHandle(ref, () => ({
    trigger: (event: GiftEvent) => triggerAnimation(event)
  }));

  useEffect(() => {
    const q = query(
      collection(db, 'rooms', roomId, 'gift_events'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          const newEvent = { id: change.doc.id, ...data } as GiftEvent;
          if (newEvent.senderId === currentUserId) return;
          const now = Date.now();
          const eventTime = data.timestamp?.toMillis ? data.timestamp.toMillis() : now;
          if (now - eventTime < 10000) triggerAnimation(newEvent);
        }
      });
    });
    return () => unsubscribe();
  }, [roomId, currentUserId]);

  return (
    <div className="fixed inset-0 z-[5000] pointer-events-none overflow-hidden">
      <AnimatePresence>
        {activeAnimations.map((event) => {
          const isFullScreen = event.giftAnimation === 'full-screen' || event.displaySize === 'full' || event.displaySize === 'max';
          const isNoAnim = event.giftAnimation === 'none';

          // حالة ملء الشاشة (التأثير المطلوب بالصورة)
          if (isFullScreen) {
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 w-full h-full z-[5000]"
              >
                {isVideoUrl(event.giftIcon) ? (
                  <FullScreenVideoPlayer 
                    src={event.giftIcon} 
                    onEnded={() => setActiveAnimations(prev => prev.filter(a => a.id !== event.id))}
                  />
                ) : (
                  <img 
                    src={event.giftIcon} 
                    className="w-full h-full object-cover" 
                    alt="Full Screen Gift"
                  />
                )}
              </motion.div>
            );
          }

          // حالة "بدون تأثير" للهدايا الفيديو (تظهر وتختفي بمجرد انتهاء الفيديو أو المدة)
          if (isNoAnim) {
            return (
              <div key={event.id} className="absolute inset-0 w-full h-full z-[5000]">
                 {isVideoUrl(event.giftIcon) ? (
                   <video 
                     src={event.giftIcon} 
                     autoPlay 
                     playsInline 
                     className="w-full h-full object-cover pointer-events-none"
                     onEnded={() => setActiveAnimations(prev => prev.filter(a => a.id !== event.id))}
                   />
                 ) : (
                   <img src={event.giftIcon} className="w-full h-full object-contain" />
                 )}
              </div>
            );
          }

          // الهدايا العادية (تأثير البوب العادي في منتصف الشاشة)
          return (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="absolute inset-0 flex items-center justify-center z-[4000]"
            >
              <div className="relative w-72 h-72 flex items-center justify-center">
                {isVideoUrl(event.giftIcon) ? (
                  <video src={event.giftIcon} autoPlay playsInline muted className="w-full h-full object-contain" />
                ) : (
                  <img src={event.giftIcon} className="w-full h-full object-contain filter drop-shadow-2xl" />
                )}
                {event.quantity > 1 && (
                  <div className="absolute -right-4 top-0 bg-yellow-500 text-black font-black text-4xl px-4 py-1 rounded-2xl border-2 border-white shadow-xl italic">
                    X{event.quantity}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
});

export default GiftAnimationLayer;
