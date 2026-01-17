
import React, { useState } from 'react';
import { UserPlus, ShieldCheck, Trash2, Search, Key, CheckSquare, Square, ShieldAlert, User, CheckCircle, Lock, Edit3, X, Save } from 'lucide-react';
import { UserState } from '../../types';

interface AdminsTabProps {
  allUsers: UserState[];
  updateAnyUser: (email: string, data: any) => Promise<void>;
  deleteAnyUser: (email: string) => Promise<void>;
  currentUserEmail: string;
}

const AdminsTab: React.FC<AdminsTabProps> = ({ allUsers, updateAnyUser, deleteAnyUser, currentUserEmail }) => {
  const isSuperAdmin = currentUserEmail === 'admin@royal.com';

  // حالة تعيين مشرف جديد
  const [targetId, setTargetId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'stats', 'recharge_orders', 'orders', 'products', 'categories', 'recharge_methods', 'users', 'settings'
  ]);

  // حالة تعديل مشرف موجود
  const [editingAdmin, setEditingAdmin] = useState<UserState | null>(null);

  // حالات إدارة كلمات المرور (للمدير العام فقط)
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserForPass, setSelectedUserForPass] = useState<UserState | null>(null);
  const [newPasswordForUser, setNewPasswordForUser] = useState('');
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  const availablePermissions = [
    { id: 'stats', label: 'الإحصائيات' },
    { id: 'recharge_orders', label: 'طلبات الإيداع' },
    { id: 'orders', label: 'طلبات الشحن' },
    { id: 'user_rates', label: 'نسب المستخدمين' },
    { id: 'banners', label: 'البنرات' },
    { id: 'products', label: 'المنتجات' },
    { id: 'categories', label: 'الأقسام' },
    { id: 'recharge_methods', label: 'طرق الدفع' },
    { id: 'users', label: 'إدارة الأعضاء' },
    { id: 'settings', label: 'إعدادات المتجر' },
  ];

  const admins = allUsers.filter(u => u?.isAdmin);

  const togglePermission = (id: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handlePromoteToAdmin = async () => {
    if (!targetId.trim()) { alert('أدخل ID'); return; }
    const targetUser = allUsers.find(u => u.id === targetId.trim());
    if (!targetUser) { alert('ID غير موجود'); return; }

    setIsSubmitting(true);
    try {
      await updateAnyUser(targetUser.email, { 
        isAdmin: true,
        permissions: selectedPermissions 
      });
      alert(`تم تعيين المشرف بنجاح ✅`);
      setTargetId('');
    } catch (error) {
      alert('خطأ في العملية');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAdminPermissions = async () => {
    if (!editingAdmin) return;
    try {
      await updateAnyUser(editingAdmin.email, { 
        permissions: editingAdmin.permissions || [] 
      });
      alert('تم تحديث صلاحيات المشرف بنجاح ✅');
      setEditingAdmin(null);
    } catch (e) {
      alert('خطأ أثناء التحديث');
    }
  };

  const handleSearchUser = () => {
    if (!userSearch.trim()) {
      alert('يرجى إدخال البريد أو الـ ID للبحث');
      return;
    }
    const found = allUsers.find(u => 
      (u.id && u.id === userSearch.trim()) || 
      (u.email && u.email.toLowerCase() === userSearch.toLowerCase().trim())
    );
    if (found) {
      setSelectedUserForPass(found);
    } else {
      alert('عذراً، لم يتم العثور على هذا الحساب');
      setSelectedUserForPass(null);
    }
  };

  const handleUpdateUserPassword = async () => {
    if (!selectedUserForPass || !newPasswordForUser) return;
    setIsUpdatingPass(true);
    try {
      await updateAnyUser(selectedUserForPass.email, { password: newPasswordForUser });
      alert(`تم تحديث كلمة المرور بنجاح ✅`);
      setSelectedUserForPass(null);
      setNewPasswordForUser('');
      setUserSearch('');
    } catch (error) {
      alert('حدث خطأ أثناء التحديث');
    } finally {
      setIsUpdatingPass(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20 rtl text-right" dir="rtl">
      
      {/* قسم إعادة تعيين كلمة السر */}
      {isSuperAdmin && (
        <div className="bg-[#0f172a] p-8 rounded-[3rem] shadow-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute left-6 top-8 w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/10">
             <Key size={28} />
          </div>
          <div className="mb-8">
             <h3 className="font-black text-white text-xl">إعادة تعيين كلمة السر</h3>
             <p className="text-[11px] font-bold text-slate-400 mt-1">تغيير كلمة مرور أي حساب فوراً</p>
          </div>
          <div className="space-y-4">
            {!selectedUserForPass ? (
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="ادخل الـ ID أو البريد الإلكتروني..." 
                  value={userSearch} 
                  onChange={(e) => setUserSearch(e.target.value)} 
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
                  className="w-full h-16 bg-white/5 rounded-[1.5rem] px-6 pr-14 text-right font-black text-white border border-white/10 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600" 
                />
                <button onClick={handleSearchUser} className="absolute right-2 top-2 bottom-2 w-12 bg-indigo-600 text-white rounded-[1.1rem] flex items-center justify-center shadow-lg active:scale-90 transition-all">
                  <Search size={20}/>
                </button>
              </div>
            ) : (
              <div className="animate-in zoom-in-95 duration-300 space-y-4">
                 <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 flex items-center justify-between">
                    <button onClick={() => { setSelectedUserForPass(null); setNewPasswordForUser(''); }} className="bg-white/10 p-2 rounded-xl text-white/40 hover:text-white">تغيير البحث</button>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-indigo-400">تم العثور على:</p>
                       <p className="text-xs font-black text-white">{selectedUserForPass.email}</p>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <input type="text" placeholder="كلمة السر الجديدة..." value={newPasswordForUser} onChange={(e) => setNewPasswordForUser(e.target.value)} className="w-full h-16 bg-white/5 rounded-[1.5rem] px-6 text-center font-black text-white border border-white/10 outline-none focus:border-emerald-500 text-lg" />
                    <button onClick={handleUpdateUserPassword} disabled={isUpdatingPass} className="w-full h-16 bg-emerald-600 text-white rounded-[1.5rem] font-black text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
                      {isUpdatingPass ? 'جاري الحفظ...' : 'حفظ كلمة السر الجديدة ✅'}
                    </button>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* نموذج إضافة مشرف جديد مع تحديد الوظائف */}
      <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 space-y-6">
        <div className="flex items-center justify-between">
           <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <UserPlus size={28} />
           </div>
           <div className="text-right flex-1 mr-4">
              <h3 className="font-black text-slate-800 text-xl">إضافة مشرف وتحديد وظائفه</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-1">اختر الأقسام التي يسمح له بدخولها</p>
           </div>
        </div>

        <div className="space-y-6">
          <input 
            type="text" 
            placeholder="أدخل الـ ID الخاص بالمستخدم" 
            value={targetId} 
            onChange={(e) => setTargetId(e.target.value)} 
            className="w-full h-16 bg-slate-50 rounded-[1.5rem] px-6 text-right font-black border border-slate-100 outline-none focus:border-indigo-400 text-lg" 
          />

          <div className="space-y-3">
            <p className="text-xs font-black text-slate-500 mr-2 mb-4">الوظائف المتاحة للمشرف:</p>
            <div className="grid grid-cols-2 gap-3">
               {availablePermissions.map(p => (
                 <button 
                   key={p.id}
                   onClick={() => togglePermission(p.id, selectedPermissions, setSelectedPermissions)}
                   className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedPermissions.includes(p.id) ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                 >
                    {selectedPermissions.includes(p.id) ? <CheckSquare size={18}/> : <Square size={18}/>}
                    <span className="text-xs font-black">{p.label}</span>
                 </button>
               ))}
            </div>
          </div>
        </div>

        <button onClick={handlePromoteToAdmin} disabled={isSubmitting} className="w-full h-18 bg-indigo-600 text-white rounded-[2rem] font-black text-base shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all py-5">
          <ShieldCheck size={24} /> <span>تأكيد التعيين بالوظائف المحددة</span>
        </button>
      </div>

      {/* طاقم الإدارة الحالي وإدارة صلاحياتهم */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
           <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full">{admins.length} مشرف</span>
           <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
             <ShieldAlert size={18} className="text-amber-500" /> طاقم الإدارة الحالي
           </h4>
        </div>
        {admins.map(admin => (
          <div key={admin.email} className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button 
                  onClick={() => admin.email !== 'admin@royal.com' && setEditingAdmin(admin)}
                  className={`p-3 rounded-2xl transition-all ${admin.email === 'admin@royal.com' ? 'opacity-20 grayscale' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'}`}
                  disabled={admin.email === 'admin@royal.com'}
                  title="تعديل الوظائف"
                >
                  <Edit3 size={20} />
                </button>
                <button 
                  onClick={() => admin.email !== 'admin@royal.com' && confirm('هل تريد سحب رتبة الإشراف تماماً؟') && updateAnyUser(admin.email, { isAdmin: false })} 
                  className={`p-3 rounded-2xl transition-all ${admin.email === 'admin@royal.com' ? 'opacity-20 grayscale' : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'}`}
                  disabled={admin.email === 'admin@royal.com'}
                >
                  <Trash2 size={20} />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <h5 className="font-black text-sm text-slate-800">{admin.name}</h5>
                  <p className="text-[10px] font-bold text-slate-400">ID: {admin.id}</p>
                </div>
                <img src={admin.profilePic} className="w-12 h-12 rounded-2xl border border-slate-50 object-cover shadow-sm" alt="" />
              </div>
            </div>
            
            {/* عرض الوظائف الحالية كعلامات صغيرة */}
            <div className="flex flex-wrap justify-end gap-1">
               {(admin.permissions || []).map(pid => (
                 <span key={pid} className="text-[8px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg border border-slate-200">
                    {availablePermissions.find(ap => ap.id === pid)?.label || pid}
                 </span>
               ))}
               {(!admin.permissions || admin.permissions.length === 0) && (
                 <span className="text-[8px] font-black text-red-400 bg-red-50 px-2 py-0.5 rounded-lg">لا توجد وظائف محددة</span>
               )}
            </div>
          </div>
        ))}
      </div>

      {/* نافذة تعديل صلاحيات مشرف موجود */}
      {editingAdmin && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setEditingAdmin(null)} />
          <div className="relative w-full max-w-[450px] bg-white rounded-[3rem] shadow-2xl p-8 animate-in zoom-in-95 duration-300">
             <div className="flex items-center justify-between mb-8">
                <button onClick={() => setEditingAdmin(null)} className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:text-red-500 transition-colors">
                  <X size={24} />
                </button>
                <div className="text-right">
                   <h3 className="text-slate-800 font-black text-lg">تعديل وظائف المشرف</h3>
                   <p className="text-[10px] font-bold text-slate-400 mt-1">{editingAdmin.name}</p>
                </div>
             </div>

             <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                   {availablePermissions.map(p => (
                     <button 
                       key={p.id}
                       onClick={() => {
                          const current = editingAdmin.permissions || [];
                          const updated = current.includes(p.id) ? current.filter(x => x !== p.id) : [...current, p.id];
                          setEditingAdmin({...editingAdmin, permissions: updated});
                       }}
                       className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${editingAdmin.permissions?.includes(p.id) ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                     >
                        {editingAdmin.permissions?.includes(p.id) ? <CheckSquare size={18}/> : <Square size={18}/>}
                        <span className="text-xs font-black">{p.label}</span>
                     </button>
                   ))}
                </div>

                <button 
                  onClick={handleUpdateAdminPermissions}
                  className="w-full h-16 bg-slate-900 text-yellow-400 rounded-[1.5rem] font-black text-base shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                   <Save size={20} /> حفظ التعديلات على الوظائف
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminsTab;
