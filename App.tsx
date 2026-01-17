
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { db } from './lib/firebase';
import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  collection, 
  setDoc, 
  deleteDoc, 
  query, 
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { UserState, AppConfig, Product, Category, Order, ViewType, RechargeMethod } from './types';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import HomeView from './components/HomeView';
import WalletView from './components/WalletView';
import OrdersView from './components/OrdersView';
import NotificationsView from './components/NotificationsView';
import SearchView from './components/SearchView';
import CartView from './components/CartView';
import ProfileEditView from './components/ProfileEditView';
import AdminView from './components/AdminView';
import RechargeView from './components/RechargeView';
import RechargeDetailsView from './components/RechargeDetailsView';
import LoginView from './components/LoginView';
import { SITE_ASSETS } from './assets';

const DEFAULT_CONFIG: AppConfig = {
  logoUrl: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=200&h=200&fit=crop',
  appName: 'JENTEL-CASH',
  usdToEgpRate: 50,
  globalUsdToCoinRate: 100,
  diamondPriceUSD: 1,
  welcomeAnnouncement: 'مرحباً بكم في جنتل كاش',
  banners: [],
  themeColors: {
    primary: '#0f172a',
    secondary: '#facc15',
    background: 'transparent',
    surface: '#ffffff',
    text: '#0f172a'
  }
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserState | null>(null);
  const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [rechargeMethods, setRechargeMethods] = useState<RechargeMethod[]>([]);
  const [allUsers, setAllUsers] = useState<UserState[]>([]);
  const [selectedRechargeMethod, setSelectedRechargeMethod] = useState<RechargeMethod | null>(null);
  
  const lastPendingCountRef = useRef<number>(0);
  const lastCompletedOrderIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  const playSound = (type: 'order_received' | 'shipping_confirmed') => {
    const soundUrl = type === 'shipping_confirmed' 
      ? 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3' // صوت للمستخدم: تم الشحن
      : 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'; // صوت للمسؤول: طلب جديد وصل
    
    const audio = new Audio(soundUrl);
    audio.play().catch(() => console.log("Audio play blocked - needs interaction"));
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setCurrentView(event.state.view as ViewType);
      } else {
        setCurrentView('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    if (!window.history.state) {
      window.history.replaceState({ view: 'home' }, '', '');
    }
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = useCallback((view: ViewType) => {
    if (view === currentView) return;
    window.history.pushState({ view }, '', '');
    setCurrentView(view);
  }, [currentView]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "appConfig"), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as AppConfig;
        setAppConfig(data);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const bgUrl = appConfig.backgroundUrl || SITE_ASSETS.mainAppBackground;
    document.body.style.backgroundImage = `url(${bgUrl})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.width = '100vw';
    document.body.style.margin = '0';
    document.body.style.backgroundColor = '#0c0f17'; 
    if (appConfig.themeColors) {
      root.style.setProperty('--color-primary', appConfig.themeColors.primary);
      root.style.setProperty('--color-text', appConfig.themeColors.text);
    }
  }, [appConfig.backgroundUrl, appConfig.themeColors]);

  useEffect(() => {
    const savedUser = localStorage.getItem('jentel_user_session');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('jentel_user_session');
      }
    }
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    const unsub = onSnapshot(doc(db, "users", user.email), (snap) => {
      if (snap.exists()) {
        const updatedData = snap.data() as UserState;
        setUser(updatedData);
        localStorage.setItem('jentel_user_session', JSON.stringify(updatedData));
      }
    });
    return () => unsub();
  }, [user?.email]);

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    });
    const unsubCats = onSnapshot(collection(db, "categories"), (snap) => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
    });
    const unsubMethods = onSnapshot(collection(db, "rechargeMethods"), (snap) => {
      setRechargeMethods(snap.docs.map(d => ({ id: d.id, ...d.data() } as RechargeMethod)));
    });
    return () => {
      unsubProducts();
      unsubCats();
      unsubMethods();
    };
  }, []);

  // نظام مراقبة الطلبات الذكي للتنبيهات الصوتية
  useEffect(() => {
    if (!user) return;

    const ordersQuery = user.isAdmin 
      ? query(collection(db, "orders"), orderBy("date", "desc"))
      : query(collection(db, "orders"), where("userId", "==", user.email));

    const unsubOrders = onSnapshot(ordersQuery, (snap) => {
      const currentOrders = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      
      if (isInitialLoadRef.current) {
        // في أول تحميل، نقوم فقط بتحديث المراجع بدون تشغيل أصوات
        if (user.isAdmin) {
          lastPendingCountRef.current = currentOrders.filter(o => o.status === 'pending').length;
        } else {
          currentOrders.filter(o => o.status === 'completed').forEach(o => lastCompletedOrderIdsRef.current.add(o.id));
        }
        isInitialLoadRef.current = false;
      } else {
        // منطق المسؤول: تنبيه عند وصول طلب جديد "قيد المراجعة"
        if (user.isAdmin) {
          const currentPendingCount = currentOrders.filter(o => o.status === 'pending').length;
          if (currentPendingCount > lastPendingCountRef.current) {
            playSound('order_received');
          }
          lastPendingCountRef.current = currentPendingCount;
        } 
        
        // منطق المستخدم: تنبيه عند لحظة "تأكيد الشحن" (الحالة تصبح مكتملة)
        if (!user.isAdmin) {
          const completedOrders = currentOrders.filter(o => o.status === 'completed');
          completedOrders.forEach(o => {
            if (!lastCompletedOrderIdsRef.current.has(o.id)) {
              playSound('shipping_confirmed');
              lastCompletedOrderIdsRef.current.add(o.id);
            }
          });
        }
      }
      
      setOrders(currentOrders);
    });

    if (user.isAdmin) {
      const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
        setAllUsers(snap.docs.map(d => d.data() as UserState));
      });
      return () => { unsubOrders(); unsubUsers(); };
    }

    return () => unsubOrders();
  }, [user?.email, user?.isAdmin]);

  const handleLogin = async (identifier: string, password: string, userData?: Partial<UserState>, isSignup?: boolean) => {
    const cleanId = identifier.toLowerCase().trim();
    try {
      if (isSignup) {
        const newUser: UserState = {
          id: Math.floor(100000 + Math.random() * 900000).toString(),
          name: userData?.name || 'User',
          email: cleanId,
          password: password,
          vip: 1,
          balanceUSD: 0,
          profilePic: userData?.profilePic || SITE_ASSETS.defaultAvatar,
          country: userData?.country || 'Egypt',
          isVerified: false,
          theme: 'light',
          isAdmin: false,
          isBlocked: false,
          customRates: [],
          ...userData
        };
        await setDoc(doc(db, "users", cleanId), newUser);
        setUser(newUser);
        localStorage.setItem('jentel_user_session', JSON.stringify(newUser));
      } else {
        let userQuery = query(collection(db, "users"), where("email", "==", cleanId), limit(1));
        let userSnap = await getDocs(userQuery);
        if (userSnap.empty) {
          userQuery = query(collection(db, "users"), where("id", "==", identifier.trim()), limit(1));
          userSnap = await getDocs(userQuery);
        }
        if (userSnap.empty) throw new Error("المستخدم غير موجود");
        
        const data = userSnap.docs[0].data() as UserState;
        const isAdminAccount = data.email === 'admin@royal.com' || data.id === '1';
        const finalRequiredPass = isAdminAccount ? '150150' : data.password;
        if (password !== finalRequiredPass) throw new Error("كلمة المرور غير صحيحة");
        setUser(data);
        localStorage.setItem('jentel_user_session', JSON.stringify(data));
      }
    } catch (error: any) {
      throw error;
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('jentel_user_session');
    isInitialLoadRef.current = true;
    lastCompletedOrderIdsRef.current.clear();
    navigateTo('home');
  };

  const handlePurchase = async (product: Product, idValue: string, customPriceUSD?: number, coins?: number): Promise<boolean> => {
    if (!user) return false;
    const finalPrice = customPriceUSD || product.priceUSD;
    if (user.balanceUSD < finalPrice) {
      alert("رصيدك غير كافٍ");
      return false;
    }
    try {
      const orderId = Math.floor(Math.random() * 1000000).toString();
      const newOrder: Order = {
        id: orderId,
        productName: product.name,
        priceUSD: finalPrice,
        priceEGP: finalPrice * appConfig.usdToEgpRate,
        coinsAmount: coins || product.amount,
        date: new Date().toISOString(),
        status: 'pending',
        playerId: idValue,
        userId: user.email,
        type: 'product'
      };
      await setDoc(doc(db, "orders", orderId), newOrder);
      await updateDoc(doc(db, "users", user.email), {
        balanceUSD: user.balanceUSD - finalPrice
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  if (!user) {
    return <LoginView onLogin={handleLogin} appName={appConfig.appName} logoUrl={appConfig.logoUrl} loginBackgroundUrl={appConfig.loginBackgroundUrl} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'home': return <HomeView user={user} appConfig={appConfig} products={products} banners={appConfig.banners} categories={categories} onPurchase={handlePurchase} />;
      case 'wallet': return <WalletView user={user} orders={orders} appConfig={appConfig} />;
      case 'orders': return <OrdersView orders={orders} />;
      case 'notifications': return <NotificationsView notifications={[]} />;
      case 'search': return <SearchView products={products} onPurchase={handlePurchase} appConfig={appConfig} user={user} />;
      case 'cart': return <CartView products={products} categories={categories} appConfig={appConfig} user={user} onPurchase={handlePurchase} />;
      case 'profile_edit': return <ProfileEditView user={user} appConfig={appConfig} setUser={async (u) => { await updateDoc(doc(db, "users", user.email), u); }} onBack={() => window.history.back()} />;
      case 'recharge': return <RechargeView rechargeMethods={rechargeMethods} onSelectMethod={(m) => { setSelectedRechargeMethod(m); navigateTo('recharge_details'); }} />;
      case 'recharge_details': return selectedRechargeMethod ? <RechargeDetailsView method={selectedRechargeMethod} onConfirm={async (a, s, p, sc) => {
        const orderId = "R-" + Math.floor(Math.random() * 1000000);
        await setDoc(doc(db, "orders", orderId), { id: orderId, productName: `إيداع: ${selectedRechargeMethod.label}`, priceUSD: a, status: 'pending', playerId: s, userId: user.email, type: 'recharge', screenshot: sc, date: new Date().toISOString() });
        alert("تم إرسال طلب الإيداع"); navigateTo('wallet');
      }} /> : <HomeView user={user} appConfig={appConfig} products={products} banners={appConfig.banners} categories={categories} onPurchase={handlePurchase} />;
      case 'admin': return <AdminView 
        products={products} setProducts={async (id, data) => id ? await updateDoc(doc(db, "products", id), data) : await setDoc(doc(collection(db, "products")), data)} 
        deleteProduct={async (id) => await deleteDoc(doc(db, "products", id))} categories={categories} addCategory={async (data) => await setDoc(doc(collection(db, "categories")), data)} 
        deleteCategory={async (id) => await deleteDoc(doc(db, "categories", id))} rechargeMethods={rechargeMethods} setRechargeMethod={async (id, data) => id ? await updateDoc(doc(db, "rechargeMethods", id), data) : await setDoc(doc(collection(db, "rechargeMethods")), data)} 
        deleteRechargeMethod={async (id) => await deleteDoc(doc(db, "rechargeMethods", id))} orders={orders} allUsers={allUsers} updateAnyUser={async (e, d) => await updateDoc(doc(db, "users", e), d)} deleteAnyUser={async (e) => await deleteDoc(doc(db, "users", e))} 
        appConfig={appConfig} setAppConfig={async (cfg) => await updateDoc(doc(db, "settings", "appConfig"), cfg as any)} onBack={() => window.history.back()} 
        onUpdateOrder={async (id, s, r) => { await updateDoc(doc(db, "orders", id), { status: s, adminReply: r }); if (s === 'completed') { const o = orders.find(ord => ord.id === id); if (o?.type === 'recharge') { const u = allUsers.find(usr => usr.email === o.userId); if (u) await updateDoc(doc(db, "users", u.email), { balanceUSD: u.balanceUSD + o.priceUSD }); } } }} 
        currentUserEmail={user.email} 
      />;
      default: return <HomeView user={user} appConfig={appConfig} products={products} banners={appConfig.banners} categories={categories} onPurchase={handlePurchase} />;
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-transparent overflow-hidden w-full max-w-lg mx-auto shadow-2xl">
      <div className="fixed inset-0 z-[-1] bg-black/40 backdrop-blur-[6px] pointer-events-none w-full h-full"></div>
      <div className="fixed inset-0 z-[-1] opacity-[0.05] pointer-events-none w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

      <Header onMenuClick={() => setIsSidebarOpen(true)} currentView={currentView} onBack={() => window.history.back()} appConfig={appConfig} />
      
      <Sidebar 
        isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} setView={navigateTo} 
        user={user} setUser={setUser as any} appConfig={appConfig} onLogout={handleLogout} 
      />

      <main className="flex-1 relative z-10 bg-transparent min-h-screen w-full mt-16 overflow-hidden">
        {renderView()}
      </main>

      {currentView !== 'admin' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto">
          <BottomNav currentView={currentView} onViewChange={navigateTo} />
        </div>
      )}
    </div>
  );
};

export default App;
