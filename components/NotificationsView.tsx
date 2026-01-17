
import React from 'react';
import { Search, Bell, CheckCircle, Info } from 'lucide-react';
import { Notification } from '../types';

interface NotificationsViewProps {
  notifications: Notification[];
}

const NotificationsView: React.FC<NotificationsViewProps> = ({ notifications }) => {
  return (
    <div className="p-4 pb-32 animate-in fade-in duration-500 bg-transparent min-h-screen rtl" dir="rtl">
      <div className="mb-4">
         <h2 className="text-xl font-black text-white text-right drop-shadow-md">الإشعارات</h2>
      </div>

      {/* Date Filters */}
      <div className="flex gap-3 items-center mb-6">
        <div className="flex-1 relative">
           <label className="absolute -top-2 right-4 bg-[#0f172a] text-white px-2 text-[9px] font-bold">من</label>
           <div className="w-full h-12 border-2 border-white/10 bg-white/5 rounded-full flex items-center justify-center font-bold text-white text-sm backdrop-blur-md">2025-12-30</div>
        </div>
        <div className="flex-1 relative">
           <label className="absolute -top-2 right-4 bg-[#0f172a] text-white px-2 text-[9px] font-bold">الى</label>
           <div className="w-full h-12 border-2 border-white/10 bg-white/5 rounded-full flex items-center justify-center font-bold text-white text-sm backdrop-blur-md">2025-12-30</div>
        </div>
      </div>

      <div className="flex items-center justify-center mb-10">
        <button className="bg-[#facc15] w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-yellow-400/30">
          <Search size={24} className="text-white" />
        </button>
      </div>

      {/* Notifications List or Empty State */}
      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div key={notif.id} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-sm flex items-start gap-4 rtl">
              <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'recharge_success' ? 'bg-green-100/20 text-green-400' : 'bg-blue-100/20 text-blue-400'}`}>
                {notif.type === 'recharge_success' ? <CheckCircle size={20} /> : <Info size={20} />}
              </div>
              <div className="flex-1 text-right">
                <h4 className="font-black text-sm text-white mb-1">{notif.title}</h4>
                <p className="text-xs text-white/60 font-bold leading-relaxed">{notif.message}</p>
                <div className="mt-2 text-[9px] text-white/30 font-black">{notif.date}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 opacity-60">
          <p className="font-bold text-white/40">لا توجد إشعارات حالياً</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsView;
