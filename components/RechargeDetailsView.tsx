
import React, { useState } from 'react';
import { Paperclip, Copy, User as UserIcon, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { RechargeMethod } from '../types';

interface RechargeDetailsViewProps {
  method: RechargeMethod;
  onConfirm: (amount: number, senderName: string, playerId: string, screenshot?: string) => void;
}

const RechargeDetailsView: React.FC<RechargeDetailsViewProps> = ({ method, onConfirm }) => {
  const [senderName, setSenderName] = useState('');
  const [amount, setAmount] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [screenshot, setScreenshot] = useState<string | undefined>(undefined);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('تم النسخ: ' + text);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setScreenshot(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRequest = () => {
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum < 5) {
      alert('أقل مبلغ للإيداع هو 5 دولار');
      return;
    }
    if (!playerId.trim()) {
      alert('يرجى إدخال الآي دي الخاص بك');
      return;
    }
    if (!senderName.trim()) {
      alert('يرجى إدخال اسم المرسل');
      return;
    }
    if (!screenshot) {
      alert('يرجى رفع صورة إثبات التحويل');
      return;
    }
    onConfirm(amountNum, senderName, playerId, screenshot);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32 animate-in fade-in duration-500 rtl text-right" dir="rtl">
      <div className="p-4 bg-white shadow-sm mb-4">
        <h2 className="text-3xl font-black text-slate-800 text-center py-4 uppercase tracking-tighter">{method.label}</h2>
        
        {/* IBAN Box */}
        <div className="bg-[#e5e7eb] rounded-2xl p-5 mb-3 flex items-center justify-center relative">
          <span className="text-slate-600 font-bold text-lg select-all text-center break-all">{method.iban}</span>
          <button onClick={() => handleCopy(method.iban || '')} className="absolute left-4 text-slate-400 p-2 hover:bg-white/20 rounded-lg cursor-pointer">
             <Copy size={18} />
          </button>
        </div>

        {/* Company Name Box 1 */}
        {method.recipientName && (
          <div className="bg-[#e5e7eb] rounded-2xl p-5 mb-3 flex items-center justify-center relative">
            <span className="text-slate-600 font-bold text-lg select-all text-center">{method.recipientName}</span>
            <button onClick={() => handleCopy(method.recipientName || '')} className="absolute left-4 text-slate-400 p-2 hover:bg-white/20 rounded-lg cursor-pointer">
              <Copy size={18} />
            </button>
          </div>
        )}

        {/* Company Name Box 2 (The Hidden Field) */}
        {method.recipientName2 && (
          <div className="bg-[#e5e7eb] rounded-2xl p-5 mb-6 flex items-center justify-center relative">
            <span className="text-slate-600 font-bold text-lg select-all text-center">{method.recipientName2}</span>
            <button onClick={() => handleCopy(method.recipientName2 || '')} className="absolute left-4 text-slate-400 p-2 hover:bg-white/20 rounded-lg cursor-pointer">
              <Copy size={18} />
            </button>
          </div>
        )}

        {/* Instructions Text */}
        <div className="px-4 text-center space-y-2 mb-8">
          <p className="text-slate-500 font-bold text-sm leading-relaxed whitespace-pre-wrap">
            {method.instructions}
          </p>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4 px-2">
          <div className="relative">
             <input type="text" placeholder="الآي دي الخاص بك (ID)" value={playerId} onChange={(e) => setPlayerId(e.target.value)} className="w-full h-16 bg-[#f1f5f9] rounded-[2rem] px-8 text-center font-bold text-slate-700 outline-none shadow-inner" />
             <UserIcon size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative">
            <input type="text" placeholder="اسم المرسل الثلاثي" value={senderName} onChange={(e) => setSenderName(e.target.value)} className="w-full h-16 bg-[#f1f5f9] rounded-[2rem] px-8 text-center font-bold text-slate-700 outline-none shadow-inner" />
          </div>

          <div className="relative flex items-center">
            <div className="absolute right-6 flex items-center gap-2 pointer-events-none">
               <span className="w-8 h-6 bg-white rounded shadow-sm flex items-center justify-center text-xs">{method.currencyIcon}</span>
               <span className="text-[#facc15] font-black text-sm uppercase">القيمة</span>
            </div>
            <input type="number" placeholder="أقل إيداع 5 دولار" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full h-16 bg-[#f1f5f9] rounded-[2rem] px-8 text-center font-bold text-slate-700 outline-none shadow-inner" />
          </div>

          <div className="relative">
             <label className="w-full h-24 bg-[#f1f5f9] rounded-[2rem] border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#facc15] transition-colors overflow-hidden">
                {screenshot ? (
                  <div className="flex items-center gap-2 text-green-600 font-bold">
                    <CheckCircle size={20} /><span>تم اختيار الصورة</span>
                    <img src={screenshot} className="w-12 h-12 object-cover rounded-lg ml-2" />
                  </div>
                ) : (
                  <>
                    <ImageIcon size={28} className="text-slate-400 mb-1" />
                    <span className="text-[10px] font-black text-slate-400 uppercase">رفع سكرين شوت التحويل</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
             </label>
          </div>

          <button onClick={handleRequest} className="w-full h-16 bg-[#facc15] text-white rounded-[2rem] font-black text-lg shadow-lg active:scale-95 transition-all mt-6 cursor-pointer">طلب</button>
        </div>
      </div>
    </div>
  );
};

export default RechargeDetailsView;
