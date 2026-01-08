
import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../services/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { User, GiftDisplaySize } from '../../types';
import { Sparkles, Crown } from 'lucide-react';

interface GiftEvent {
  id: string;
  giftId: string;
  giftName: string;
  giftIcon: string;
  giftAnimation: string;
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

const SmartVideoPlayer = ({ src, objectFit }: { src: string, objectFit: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    video.volume = 0.7;
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
      className={`w-full h-full ${objectFit} pointer-events-none shadow-2xl`}
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
    
    const displayDuration = (event.duration || 5) * 1000;
    
    setTimeout(() => {
      setActiveAnimations(prev => prev.filter(a => a.id !== event.id));
      setTimeout(() => playedIds.current.delete(event.id), 5000);
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
    <div className="absolute inset-0 z-[1000] pointer-events-none overflow-hidden">
      <AnimatePresence>
        {activeAnimations.map((event) => {
          const isFullScreen = event.giftAnimation === 'full-screen' || event.displaySize === 'full' || event.displaySize === 'max';
          
          if (isFullScreen) {
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, scale: 1.2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center z-[2000]"
              >
                {/* خلفية معتمة خفيفة جداً للهدايا الكبيرة */}
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
                
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  {/* حاوية الهدية */}
                  <div className="w-full h-full relative">
                    {isVideoUrl(event.giftIcon) ? (
                      <SmartVideoPlayer src={event.giftIcon} objectFit="object-contain" />
                    ) : (
                      <motion.img 
                        animate={{ 
                          scale: [1, 1.05, 1],
                          y: [0, -20, 0]
                        }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        src={event.giftIcon} 
                        className="w-full h-full object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]" 
                      />
                    )}
                  </div>
                  {/* تم إزالة بطاقة تعريف المرسل (المربع الأصفر) من هنا بناءً على طلب المستخدم لترك الشاشة للهدية فقط */}
                </div>
              </motion.div>
            );
          }

          // الهدايا العادية (تأثير ظهور من الأسفل مع ارتداد)
          return (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, scale: 0.3, y: 100 }}
              animate={{ 
                opacity: [0, 1, 1, 0], 
                scale: [0.3, 1.1, 1, 1.2],
                y: [100, 0, 0, -50]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative w-64 h-64 flex items-center justify-center">
                {isVideoUrl(event.giftIcon) ? (
                  <video src={event.giftIcon} autoPlay playsInline muted className="w-full h-full object-contain" />
                ) : (
                  <img src={event.giftIcon} className="w-full h-full object-contain filter drop-shadow-2xl" />
                )}
                
                {event.quantity > 1 && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.2 }}
                    className="absolute -right-4 top-0 bg-gradient-to-b from-yellow-300 to-orange-600 text-white font-black text-4xl px-4 py-1 rounded-2xl shadow-xl border-2 border-white italic"
                  >
                    X{event.quantity}
                  </motion.div>
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
