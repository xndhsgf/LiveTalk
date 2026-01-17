
import React, { useState, useEffect, useRef } from 'react';
import { Megaphone, LayoutGrid } from 'lucide-react';
import PurchaseModal from './PurchaseModal';
import { Product, UserState, Banner, Category, AppConfig } from '../types';

interface HomeViewProps {
  user: UserState;
  appConfig: AppConfig;
  onPurchase: (product: Product, idValue: string, customPriceUSD?: number, coins?: number) => Promise<boolean>;
  products: Product[];
  banners: Banner[];
  categories: Category[];
}

const HomeView: React.FC<HomeViewProps> = ({ user, appConfig, onPurchase, products, banners, categories }) => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(categories[0]?.id || null);
  
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const timer = setInterval(() => setCurrentBanner((prev) => (prev + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners?.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!banners || banners.length <= 1) return;
    const threshold = 50;
    if (touchStartX.current - touchEndX.current > threshold) {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    } else if (touchEndX.current - touchStartX.current > threshold) {
      setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
    }
  };

  const filteredProducts = activeCategoryId 
    ? products.filter(p => p.categoryId === activeCategoryId)
    : products;

  const activeCategory = categories.find(c => c.id === activeCategoryId);
  const tickerText = appConfig.announcements && appConfig.announcements.length > 0 
    ? appConfig.announcements.join("  |  ") 
    : appConfig.welcomeAnnouncement;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-transparent rtl">
      
      {/* 
          الجزء العلوي الثابت - تم ضغطه بالكامل لرفعه للأعلى 
      */}
      <div className="fixed top-16 left-0 right-0 z-[60] max-w-lg mx-auto bg-[#0c0f17]/90 backdrop-blur-xl border-b border-white/5 pb-0">
        
        {/* 1. شريط الإعلانات - ارتفاع صغير (32px) */}
        <div className="bg-[#fbbf24] px-4 flex items-center overflow-hidden text-white font-bold text-[10px] h-8 shadow-md">
           <div className="flex items-center gap-2 bg-[#fbbf24] z-10 pl-2 shrink-0">
              <Megaphone size={12} className="text-white" />
              <button className="bg-[#1e293b] text-white px-2 py-0.5 rounded-md text-[8px] font-black uppercase">النظام</button>
           </div>
           <div className="flex-1 overflow-hidden relative h-full flex items-center">
              <div className="whitespace-nowrap animate-marquee absolute right-0 flex items-center gap-10 pr-4">
                 <span>{tickerText}</span>
                 <span>{tickerText}</span>
              </div>
           </div>
        </div>

        {/* 2. البنرات الإعلانية */}
        <div className="pt-2 pb-1 px-4">
          <div 
            className="relative h-28 w-full overflow-hidden rounded-[1.5rem] shadow-lg border border-white/20 bg-black/30 backdrop-blur-sm"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {banners && banners.length > 0 ? banners.map((banner, index) => (
              <div 
                key={banner.id} 
                className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${index === currentBanner ? 'opacity-100 translate-x-0' : (index < currentBanner ? 'opacity-0 -translate-x-full' : 'opacity-0 translate-x-full')}`}
              >
                <img src={banner.url} alt={banner.title} className="w-full h-full object-cover" />
              </div>
            )) : null}
          </div>
        </div>

        {/* 3. الأقسام - تقليل المسافات */}
        <div className="py-1 px-4">
          <div className="flex items-center justify-between mb-1 px-1 text-right">
             <h3 className="text-[10px] font-black text-white uppercase drop-shadow-md">تصفح الأقسام</h3>
             <div className="w-5 h-5 flex items-center justify-center bg-white/10 rounded-lg">
                <LayoutGrid size={10} className="text-yellow-400" />
             </div>
          </div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => setActiveCategoryId(cat.id)} 
                className={`flex flex-col items-center shrink-0 transition-all ${activeCategoryId === cat.id ? 'scale-105' : 'opacity-70 scale-95'}`}
              >
                <div className={`w-11 h-11 rounded-[1.1rem] overflow-hidden border-2 transition-all ${activeCategoryId === cat.id ? 'border-yellow-400 shadow-lg shadow-yellow-400/30' : 'border-white/10 bg-black/20 backdrop-blur-[2px]'}`}>
                  <img src={cat.image} className="w-full h-full object-cover" alt={cat.title} />
                </div>
                <span className={`text-[7px] font-black mt-1 ${activeCategoryId === cat.id ? 'text-yellow-400' : 'text-white/80'}`}>
                  {cat.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. شريط اسم القسم - ملتصق بالأعلى */}
        <div className="px-5 py-1">
           <div className="flex items-center justify-between bg-black/70 backdrop-blur-2xl rounded-2xl p-2 border border-white/10 shadow-xl">
              <span className="text-[9px] font-black bg-yellow-400 text-slate-900 px-3 py-1 rounded-full shadow-inner">{filteredProducts.length} عنصر</span>
              <div className="flex flex-col items-end">
                 <h3 className="text-[11px] font-black text-white uppercase tracking-widest drop-shadow-md leading-none">
                   {activeCategory?.title || 'المنتجات'}
                 </h3>
                 <div className="w-8 h-0.5 bg-yellow-400 rounded-full mt-1"></div>
              </div>
           </div>
        </div>
      </div>

      {/* 
          منطقة المنتجات المتحركة 
          تقليل الـ pt لتبدأ المنتجات فوراً تحت شريط الأقسام
      */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-[300px] pb-32 relative z-[50] text-right bg-transparent">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-4 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                onClick={() => { setSelectedProduct(product); setTimeout(() => setIsModalOpen(true), 10); }}
                className="relative group cursor-pointer active:scale-90 transition-all duration-300"
              >
                <div className="w-full aspect-square rounded-[1rem] overflow-hidden shadow-lg relative border border-white/10 bg-black/40 backdrop-blur-[2px]">
                    <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                    <div className="absolute bottom-1 inset-x-1 bg-black/60 backdrop-blur-sm rounded-[0.7rem] py-1 px-1 border border-white/10">
                        <p className="text-[6px] font-black text-white text-center truncate uppercase tracking-tighter">{product.name}</p>
                    </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 opacity-30">
             <p className="text-[10px] font-black text-white">لا توجد منتجات</p>
          </div>
        )}
      </div>
      
      {isModalOpen && selectedProduct && (
        <PurchaseModal 
          isOpen={isModalOpen} product={selectedProduct} appConfig={appConfig}
          userBalance={user.balanceUSD} user={user}
          onClose={() => { setIsModalOpen(false); setSelectedProduct(null); }} 
          onConfirm={onPurchase} 
        />
      )}

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default HomeView;
