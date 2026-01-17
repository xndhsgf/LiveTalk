
import React, { useState } from 'react';
import { PlusCircle, Camera, Trash2, Package } from 'lucide-react';
import { Product, Category } from '../../types';

interface ProductsTabProps {
  products: Product[];
  categories: Category[];
  setProducts: (id: string | null, data: any) => Promise<any>;
  deleteProduct: (id: string) => Promise<void>;
  usdToEgpRate: number;
}

const ProductsTab: React.FC<ProductsTabProps> = ({ products, categories, setProducts, deleteProduct, usdToEgpRate }) => {
  const [newP, setNewP] = useState({ 
    name: '', 
    priceUSD: '', 
    usdToCoinRate: '100', 
    image: '', 
    categoryId: categories[0]?.id || '',
    isCustomAmount: false
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewP({ ...newP, image: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async () => {
    if (!newP.name || !newP.priceUSD || !newP.image) return alert('أكمل البيانات!');
    const price = parseFloat(newP.priceUSD);
    const rate = parseFloat(newP.usdToCoinRate);
    await setProducts(null, {
      ...newP,
      priceUSD: price,
      usdToCoinRate: rate,
      amount: price * rate,
      priceEGP: price * usdToEgpRate,
      color: 'from-blue-600 to-indigo-700'
    });
    alert('تمت إضافة المنتج بنجاح ✅');
    setNewP({ name: '', priceUSD: '', usdToCoinRate: '100', image: '', categoryId: categories[0]?.id || '', isCustomAmount: false });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-md border border-slate-100 space-y-4">
        <h3 className="font-black text-slate-800 text-sm flex items-center gap-2"><PlusCircle size={18}/> إضافة منتج جديد</h3>
        
        <label className="w-full h-32 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden group">
           {newP.image ? <img src={newP.image} className="h-full w-full object-cover" /> : <div className="text-center"><Camera className="text-slate-300 mx-auto" size={32}/><span className="text-[10px] text-slate-400 font-bold block mt-1">صورة المنتج</span></div>}
           <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
        </label>

        <div className="space-y-3">
           <input type="text" placeholder="اسم المنتج" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} className="w-full h-12 bg-slate-50 rounded-xl px-4 text-right font-bold outline-none border border-slate-100 focus:border-yellow-400" />
           
           <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs font-black text-slate-600">تفعيل مبلغ مخصص</span>
              <button onClick={() => setNewP({...newP, isCustomAmount: !newP.isCustomAmount})} className={`w-10 h-6 rounded-full transition-colors relative ${newP.isCustomAmount ? 'bg-green-500' : 'bg-slate-300'}`}>
                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newP.isCustomAmount ? 'right-5' : 'right-1'}`}></div>
              </button>
           </div>

           <div className="grid grid-cols-2 gap-3">
              <input type="number" placeholder="السعر ($)" value={newP.priceUSD} onChange={(e) => setNewP({...newP, priceUSD: e.target.value})} className="w-full h-12 bg-slate-50 rounded-xl px-4 text-center font-black text-emerald-600 border border-slate-100" />
              <input type="number" placeholder="كوينز لكل 1$" value={newP.usdToCoinRate} onChange={(e) => setNewP({...newP, usdToCoinRate: e.target.value})} className="w-full h-12 bg-slate-50 rounded-xl px-4 text-center font-black text-indigo-600 border border-slate-100" />
           </div>

           <select value={newP.categoryId} onChange={(e) => setNewP({...newP, categoryId: e.target.value})} className="w-full h-12 bg-slate-50 rounded-xl px-4 text-right font-bold outline-none border border-slate-100">
              {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
           </select>
        </div>

        <button onClick={handleAdd} className="w-full h-14 bg-slate-900 text-yellow-400 rounded-2xl font-black shadow-lg">حفظ المنتج</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {products.map(p => (
          <div key={p.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm relative group">
            <img src={p.image} className="w-full h-24 object-cover rounded-2xl mb-2" />
            <p className="font-black text-[10px] text-slate-800 text-center truncate">{p.name}</p>
            <button onClick={() => confirm('حذف؟') && deleteProduct(p.id)} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsTab;
