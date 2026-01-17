
import React, { useState } from 'react';
import { 
  ArrowRight, Package, ShoppingCart, LayoutGrid, Settings, 
  Users, ShieldAlert, BarChart3, CreditCard, ShieldCheck, Wallet, Menu, X, Image as ImageIcon, Zap, ChevronLeft
} from 'lucide-react';
import { Product, Category, AppConfig, Order, UserState, RechargeMethod } from '../types';

// استيراد الأقسام المستقلة
import OrdersTab from './admin/OrdersTab';
import ProductsTab from './admin/ProductsTab';
import CategoriesTab from './admin/CategoriesTab';
import UsersTab from './admin/UsersTab';
import SettingsTab from './admin/SettingsTab';
import StatsTab from './admin/StatsTab';
import RechargeMethodsTab from './admin/RechargeMethodsTab';
import AdminsTab from './admin/AdminsTab';
import RechargeOrdersTab from './admin/RechargeOrdersTab';
import BannersTab from './admin/BannersTab';
import UserRatesTab from './admin/UserRatesTab';

interface AdminViewProps {
  products: Product[];
  setProducts: (id: string | null, data: any) => Promise<any>;
  deleteProduct: (id: string) => Promise<void>;
  categories: Category[];
  addCategory: (data: any) => Promise<any>;
  deleteCategory: (id: string) => Promise<void>;
  rechargeMethods: RechargeMethod[];
  setRechargeMethod: (id: string | null, data: any) => Promise<any>;
  deleteRechargeMethod: (id: string) => Promise<void>;
  orders: Order[];
  allUsers: UserState[];
  updateAnyUser: (email: string, data: any) => Promise<void>;
  deleteAnyUser: (email: string) => Promise<void>;
  appConfig: AppConfig;
  setAppConfig: (cfg: AppConfig) => Promise<void>;
  onBack: () => void;
  onUpdateOrder: (orderId: string, status: 'completed' | 'rejected', reply: string) => void;
  onDeleteAllOrders?: () => Promise<void>;
  currentUserEmail: string; 
}

type TabType = 'stats' | 'recharge_orders' | 'orders' | 'products' | 'categories' | 'users' | 'settings' | 'recharge_methods' | 'admins' | 'banners' | 'user_rates';

const AdminView: React.FC<AdminViewProps> = (props) => {
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // جلب المستخدم الحالي للتحقق من صلاحياته
  const currentUser = props.allUsers.find(u => u.email === props.currentUserEmail);
  const isSuperAdmin = props.currentUserEmail === 'admin@royal.com';
  
  // تعريف كافة التبويبات المتاحة
  const allTabs = [
    { id: 'stats', label: 'إحصائيات المنصة', icon: <BarChart3 size={20} /> },
    { id: 'recharge_orders', label: 'طلبات الإيداع', icon: <Wallet size={20} />, count: props.orders.filter(o => o.type === 'recharge' && o.status === 'pending').length },
    { id: 'orders', label: 'طلبات الشحن', icon: <ShoppingCart size={20} />, count: props.orders.filter(o => o.type !== 'recharge' && o.status === 'pending').length },
    { id: 'user_rates', label: 'نسب المستخدمين', icon: <Zap size={20} /> },
    { id: 'banners', label: 'إدارة البنرات', icon: <ImageIcon size={20} /> },
    { id: 'products', label: 'إدارة المنتجات', icon: <Package size={20} /> },
    { id: 'categories', label: 'إدارة الأقسام', icon: <LayoutGrid size={20} /> },
    { id: 'recharge_methods', label: 'طرق الدفع', icon: <CreditCard size={20} /> },
    { id: 'users', label: 'إدارة الأعضاء', icon: <Users size={20} /> },
    { id: 'admins', label: 'طاقم الإدارة', icon: <ShieldCheck size={20} /> },
    { id: 'settings', label: 'إعدادات المتجر', icon: <Settings size={20} /> },
  ];

  // تصفية التبويبات بناءً على مصفوفة الصلاحيات الخاصة بالمشرف
  const allowedTabs = allTabs.filter(tab => {
    if (isSuperAdmin) return true; // المدير العام يرى كل شيء
    if (tab.id === 'admins' && !isSuperAdmin) return false; // لا يمكن لأي مشرف رؤية قسم الإدارة سوى المدير العام
    return currentUser?.permissions?.includes(tab.id);
  });

  // إذا كان التبويب النشط غير مسموح به (بسبب الحظر المفاجئ)، نعود للإحصائيات أو أول تبويب متاح
  React.useEffect(() => {
     if (allowedTabs.length > 0 && !allowedTabs.find(t => t.id === activeTab)) {
        setActiveTab(allowedTabs[0].id as TabType);
     }
  }, [allowedTabs, activeTab]);

  const handleTabChange = (id: TabType) => {
    setActiveTab(id);
    setIsMenuOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent rtl w-full font-['Cairo'] relative" dir="rtl">
      
      {/* Header Admin */}
      <div className="h-16 bg-[#0c0f17] flex items-center justify-between px-4 sticky top-0 z-[110] shadow-lg border-b border-white/5">
         <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMenuOpen(true)} 
              className="p-2 bg-white/10 rounded-xl text-yellow-400 active:scale-90 transition-transform"
            >
               <Menu size={24} />
            </button>
            <div className="text-right">
              <h2 className="text-white font-black text-sm leading-none">{props.appConfig.appName}</h2>
              <p className="text-[8px] text-yellow-400 font-bold uppercase mt-1">لوحة الإدارة</p>
            </div>
         </div>

         <div className="flex items-center gap-2">
            <button 
              onClick={props.onBack} 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-black shadow-md active:scale-95 transition-all"
            >
               <ArrowRight size={14} className="rotate-180" />
               <span>خروج</span>
            </button>
            <button 
              onClick={props.onBack}
              className="w-9 h-9 flex items-center justify-center bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all active:scale-90"
            >
              <ChevronLeft size={20} className="rotate-180" />
            </button>
         </div>
      </div>

      <div className={`fixed inset-0 z-[200] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
        <div className={`absolute top-0 right-0 h-full w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
           <div className="p-6 bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-slate-900 shadow-lg">
                    <ShieldAlert size={20} />
                 </div>
                 <span className="text-white font-black text-sm uppercase">قائمة المهام</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="text-white/40 hover:text-white">
                 <X size={24} />
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
              {allowedTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as TabType)}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-slate-900 text-yellow-400 shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <span className={activeTab === tab.id ? 'text-yellow-400' : 'text-slate-400'}>{tab.icon}</span>
                  <span className="flex-1 text-right font-black text-xs">{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">{tab.count}</span>
                  )}
                </button>
              ))}
           </div>

           <div className="p-4 border-t border-slate-100">
              <button onClick={props.onBack} className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs border border-red-100">
                 <ArrowRight size={18} /> العودة لمتجر المستخدم
              </button>
           </div>
        </div>
      </div>

      <div className="flex-1 p-4 pb-24 w-full max-w-[500px] mx-auto overflow-x-hidden">
        
        <div className="mb-6 flex items-center justify-between bg-white/90 backdrop-blur p-4 rounded-3xl shadow-sm border border-slate-200/50">
           <div className="text-right">
              <h3 className="text-slate-800 font-black text-base">{allowedTabs.find(t => t.id === activeTab)?.label}</h3>
              <p className="text-[10px] text-slate-400 font-bold">إدارة بيانات القسم حالياً</p>
           </div>
           <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center">
              {allowedTabs.find(t => t.id === activeTab)?.icon}
           </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'stats' && (
            <StatsTab totalUsers={props.allUsers.length} totalOrders={props.orders.length} />
          )}

          {activeTab === 'recharge_orders' && (
            <RechargeOrdersTab orders={props.orders} allUsers={props.allUsers} onUpdateOrder={props.onUpdateOrder} />
          )}

          {activeTab === 'orders' && (
            <OrdersTab orders={props.orders.filter(o => o.type !== 'recharge')} allUsers={props.allUsers} onUpdateOrder={props.onUpdateOrder} />
          )}

          {activeTab === 'user_rates' && (
            <UserRatesTab allUsers={props.allUsers} products={props.products} onUpdateUser={props.updateAnyUser} />
          )}

          {activeTab === 'banners' && (
            <BannersTab appConfig={props.appConfig} setAppConfig={props.setAppConfig} />
          )}

          {activeTab === 'products' && (
            <ProductsTab products={props.products} categories={props.categories} setProducts={props.setProducts} deleteProduct={props.deleteProduct} usdToEgpRate={props.appConfig.usdToEgpRate} />
          )}

          {activeTab === 'categories' && (
            <CategoriesTab categories={props.categories} addCategory={props.addCategory} deleteCategory={props.deleteCategory} />
          )}

          {activeTab === 'recharge_methods' && (
            <RechargeMethodsTab 
              rechargeMethods={props.rechargeMethods} 
              setRechargeMethod={props.setRechargeMethod} 
              deleteRechargeMethod={props.deleteRechargeMethod} 
            />
          )}

          {activeTab === 'admins' && isSuperAdmin && (
            <AdminsTab 
              allUsers={props.allUsers} 
              updateAnyUser={props.updateAnyUser} 
              deleteAnyUser={props.deleteAnyUser} 
              currentUserEmail={props.currentUserEmail}
            />
          )}

          {activeTab === 'users' && (
            <UsersTab allUsers={props.allUsers} updateAnyUser={props.updateAnyUser} deleteAnyUser={props.deleteAnyUser} />
          )}

          {activeTab === 'settings' && (
            <SettingsTab 
              appConfig={props.appConfig} 
              setAppConfig={props.setAppConfig} 
              onDeleteAllOrders={props.onDeleteAllOrders} 
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminView;
