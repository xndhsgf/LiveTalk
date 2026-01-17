
import React, { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Product, AppConfig, UserState } from '../types';
import PurchaseModal from './PurchaseModal';

interface SearchViewProps {
  products: Product[];
  onPurchase: (product: Product, idValue: string, customPrice?: number, coins?: number) => Promise<boolean>;
  appConfig: AppConfig;
  user: UserState;
}

const SearchView: React.FC<SearchViewProps> = ({ products, onPurchase, appConfig, user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProducts = searchQuery.trim() === '' 
    ? [] 
    : products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-4 pb-32 animate-in fade-in duration-500 bg-transparent min-h-screen rtl" dir="rtl">
      <div className="mb-6">
         <h2 className="text-xl font-black text-white text-right drop-shadow-md">بحث عن منتج</h2>
      </div>

      <div className="relative mb-8">
        <input 
          type="text" 
          placeholder="ابحث باسم المنتج..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-14 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-6 pr-14 text-right font-bold text-white outline-none shadow-xl placeholder:text-white/40"
        />
        <SearchIcon size={24} className="absolute right-6 top-1/2 -translate-y-1/2 text-[#facc15]" />
      </div>

      <div className="grid grid-cols-4 gap-3 px-1">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div 
              key={product.id} 
              onClick={() => { setSelectedProduct(product); setIsModalOpen(true); }}
              className="relative group cursor-pointer active:scale-90 transition-all duration-300"
            >
              <div className="w-full aspect-square rounded-[1rem] overflow-hidden shadow-sm relative border border-white/10 bg-black/40 backdrop-blur-sm">
                <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product.name} />
                <div className="absolute bottom-1 inset-x-1 bg-black/60 backdrop-blur-sm rounded-[0.7rem] py-1 px-1 border border-white/10">
                    <p className="font-black text-[7px] text-white text-center truncate uppercase tracking-tighter">{product.name}</p>
                </div>
              </div>
            </div>
          ))
        ) : searchQuery.trim() !== '' ? (
          <div className="col-span-4 text-center py-10">
            <p className="font-bold text-white/50 text-sm">لا توجد منتجات تطابق بحثك</p>
          </div>
        ) : (
          <div className="col-span-4 text-center py-10 opacity-40">
            <SearchIcon size={48} className="mx-auto mb-4 text-white/30" />
            <p className="font-bold text-white/40 text-sm">ابدأ بكتابة اسم المنتج للبحث</p>
          </div>
        )}
      </div>

      {isModalOpen && selectedProduct && (
        <PurchaseModal 
          isOpen={isModalOpen} 
          product={selectedProduct} 
          appConfig={appConfig}
          userBalance={user.balanceUSD}
          onClose={() => setIsModalOpen(false)} 
          onConfirm={onPurchase} 
        />
      )}
    </div>
  );
};

export default SearchView;
