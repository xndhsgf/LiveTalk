
import React, { useState } from 'react';
import { PlusCircle, Image as ImageIcon, Link as LinkIcon, Trash2, Save, ExternalLink } from 'lucide-react';
import { AppConfig, Banner } from '../../types';

interface BannersTabProps {
  appConfig: AppConfig;
  setAppConfig: (cfg: AppConfig) => Promise<void>;
}

const BannersTab: React.FC<BannersTabProps> = ({ appConfig, setAppConfig }) => {
  const [newBanner, setNewBanner] = useState({ url: '', title: '', link: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBanner({ ...newBanner, url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addBanner = async () => {
    if (!newBanner.url) return alert('يرجى اختيار صورة للبنر');
    
    setIsSaving(true);
    const updatedBanners = [
      ...(appConfig.banners || []),
      { 
        id: Date.now().toString(), 
        url: newBanner.url, 
        title: newBanner.title || 'إعلان جديد',
        link: newBanner.link || '' 
      }
    ];

    try {
      await setAppConfig({ ...appConfig, banners: updatedBanners });
      setNewBanner({ url: '', title: '', link: '' });
      alert('تم إضافة البنر بنجاح ✅');
    } catch (error) {
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا البنر؟')) return;
    
    const updatedBanners = appConfig.banners.filter(b => b.id !== id);
    await setAppConfig({ ...appConfig, banners: updatedBanners });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* نموذج إضافة بنر جديد */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-md border border-slate-100 space-y-4">
        <h3 className="font-black text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4 text-sm">
          <ImageIcon size={18} className="text-indigo-500" /> إضافة بنر إعلاني جديد
        </h3>

        <div className="space-y-4">
          <label className="relative block w-full h-40 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 overflow-hidden cursor-pointer hover:border-indigo-400 transition-all">
            {newBanner.url ? (
              <img src={newBanner.url} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2">
                <ImageIcon size={32} />
                <span className="text-[10px] font-black uppercase">اختر صورة البنر</span>
              </div>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </label>

          <div className="space-y-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="عنوان البنر (اختياري)" 
                value={newBanner.title} 
                onChange={(e) => setNewBanner({...newBanner, title: e.target.value})} 
                className="w-full h-12 bg-slate-50 rounded-xl px-4 text-right font-bold border border-slate-100 outline-none focus:border-indigo-400" 
              />
            </div>
            <div className="relative">
              <input 
                type="text" 
                placeholder="رابط التوجه (Link) - يبدأ بـ http" 
                value={newBanner.link} 
                onChange={(e) => setNewBanner({...newBanner, link: e.target.value})} 
                className="w-full h-12 bg-slate-50 rounded-xl px-4 pr-10 text-right font-bold border border-slate-100 outline-none focus:border-indigo-400" 
              />
              <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            </div>
          </div>

          <button 
            onClick={addBanner} 
            disabled={isSaving}
            className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            {isSaving ? 'جاري الحفظ...' : <><PlusCircle size={20} /> إضافة البنر للمتجر</>}
          </button>
        </div>
      </div>

      {/* عرض قائمة البنرات الحالية */}
      <div className="space-y-4">
        <h4 className="font-black text-slate-800 text-sm px-4">البنرات النشطة حالياً ({appConfig.banners?.length || 0})</h4>
        <div className="grid grid-cols-1 gap-4">
          {appConfig.banners?.map((banner) => (
            <div key={banner.id} className="bg-white p-3 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 group">
              <div className="w-24 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                <img src={banner.url} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1 text-right overflow-hidden">
                <p className="font-black text-xs text-slate-800 truncate">{banner.title}</p>
                {banner.link && (
                  <p className="text-[9px] text-indigo-500 font-bold truncate flex items-center justify-end gap-1 mt-1">
                    {banner.link} <ExternalLink size={10} />
                  </p>
                )}
              </div>
              <button 
                onClick={() => deleteBanner(banner.id)}
                className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center active:scale-90 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BannersTab;
