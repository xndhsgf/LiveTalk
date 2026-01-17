
import React, { useState } from 'react';
import { ShoppingBag, Zap, LayoutGrid, ChevronLeft } from 'lucide-react';
import { Product, Category, AppConfig, UserState } from '../types';
import PurchaseModal from './PurchaseModal';

interface CartViewProps {
  products: Product[];
  categories: Category[];
  appConfig: AppConfig;
  user: UserState;
  onPurchase: (product: Product, idValue: string, customPriceUSD?: number, coins?: number) => Promise<boolean>;
}

const CartView: React.FC<CartViewProps> = ({ products, categories, appConfig, user, onPurchase }) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProducts = activeTab === 'all' 
    ? products 
    : products.filter(p => p.categoryId === activeTab);

  return (
    <div className="p-4 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-transparent min-h-screen rtl" dir="rtl">
      
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6 bg-white/5 backdrop-blur-md p-4 rounded-[2rem] border border-white/10 shadow-xl">
         <div className="text-right">
            <h2 className="text-xl font-black text-white leading-none">معرض المنتجات</h2>
            <p className="text-[9px] font-bold text-yellow-400 uppercase mt-1 tracking-widest">جميع خدمات المنصة في مكان واحد</p>
         </div>
         <div className="bg-yellow-400 text-slate-900 px-4 py-2 rounded-2xl flex flex-col items-center shadow-lg shadow-yellow-400/20">
            <span className="text-sm font-black leading-none">{products.length}</span>
            <span className="text-[7px] font-black uppercase">منتج</span>
         </div>
      </div>

      {/* Categories Filter - Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-2 px-1">
         <button 
           onClick={() => setActiveTab('all')}
           className={`shrink-0 px-6 py-3 rounded-2xl font-black text-[10px] transition-all border ${activeTab === 'all' ? 'bg-white text-slate-900 border-white shadow-lg' : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'}`}
         >
           الكل
         </button>
         {categories.map(cat => (
           <button 
             key={cat.id}
             onClick={() => setActiveTab(cat.id)}
             className={`shrink-0 px-6 py-3 rounded-2xl font-black text-[10px] transition-all border ${activeTab === cat.id ? 'bg-white text-slate-900 border-white shadow-lg' : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'}`}
           >
             {cat.title}
           </button>
         ))}
      </div>

      {/* Products Grid - Comprehensive View */}
      {filteredProducts.length > 0 ? (
        <div className="space-y-4">
          {filteredProducts.map((item) => (
            <div 
              key={item.id} 
              onClick={() => { setSelectedProduct(item); setIsModalOpen(true); }}
              className="bg-black/30 backdrop-blur-xl rounded-[2.2rem] p-4 shadow-2xl border border-white/10 flex items-center justify-between group active:scale-95 transition-all duration-300"
            >
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl p-1.5 flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-105 transition-transform">
                     <img src={item.image} className="w-full h-full object-contain rounded-xl" alt={item.name} />
                  </div>
                  <div className="text-right">
                     <h4 className="font-black text-[12px] text-white group-hover:text-yellow-400 transition-colors">{item.name}</h4>
                     <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-emerald-400 font-black">${item.priceUSD.toLocaleString()}</span>
                        <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                        <span className="text-[8px] text-white/40 font-bold">{categories.find(c => c.id === item.categoryId)?.title}</span>
                     </div>
                  </div>
               </div>
               
               <div className="bg-yellow-400 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-400/20 text-slate-900 group-hover:bg-white transition-colors">
                  <Zap size={22} fill="currentColor" />
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 opacity-30">
           <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
              <ShoppingBag size={48} className="text-white" />
           </div>
           <p className="font-black text-white text-sm">لا توجد منتجات في هذا القسم</p>
           <p className="text-[9px] font-bold text-yellow-400 mt-2 uppercase tracking-widest">يرجى اختيار قسم آخر</p>
        </div>
      )}

      {/* Purchase Modal Logic */}
      {isModalOpen && selectedProduct && (
        <PurchaseModal 
          isOpen={isModalOpen} 
          product={selectedProduct} 
          appConfig={appConfig}
          userBalance={user.balanceUSD}
          user={user}
          onClose={() => { setIsModalOpen(false); setSelectedProduct(null); }} 
          onConfirm={onPurchase} 
        />
      )}
    </div>
  );
};

export default CartView;
