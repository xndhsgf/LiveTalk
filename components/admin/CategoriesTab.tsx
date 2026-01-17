
import React, { useState } from 'react';
import { PlusCircle, Camera, Trash2 } from 'lucide-react';
import { Category } from '../../types';

interface CategoriesTabProps {
  categories: Category[];
  addCategory: (data: any) => Promise<any>;
  deleteCategory: (id: string) => Promise<void>;
}

const CategoriesTab: React.FC<CategoriesTabProps> = ({ categories, addCategory, deleteCategory }) => {
  const [newCat, setNewCat] = useState({ title: '', image: '' });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewCat({ ...newCat, image: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if(!newCat.title || !newCat.image) return alert('أكمل البيانات!');
    await addCategory(newCat);
    setNewCat({ title: '', image: '' });
    alert('تم إضافة القسم بنجاح ✅');
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-md border border-slate-100 space-y-4">
        <h3 className="font-black text-slate-800 text-sm">إضافة قسم جديد</h3>
        <label className="w-full h-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden group">
          {newCat.image ? <img src={newCat.image} className="h-full w-full object-cover" /> : <Camera className="text-slate-300"/>}
          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
        </label>
        <input type="text" placeholder="اسم القسم" value={newCat.title} onChange={(e) => setNewCat({...newCat, title: e.target.value})} className="w-full h-12 bg-slate-50 rounded-xl px-4 text-right font-bold border border-slate-100 outline-none" />
        <button onClick={handleSave} className="w-full h-12 bg-slate-900 text-white rounded-xl font-black shadow-lg">حفظ القسم</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm relative group">
            <img src={cat.image} className="w-full h-24 object-cover rounded-2xl mb-2" />
            <p className="font-black text-xs text-slate-800 text-center">{cat.title}</p>
            <button onClick={() => confirm('حذف القسم؟') && deleteCategory(cat.id)} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><Trash2 size={12}/></button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesTab;
