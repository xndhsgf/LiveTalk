
export type ViewType = 'home' | 'wallet' | 'orders' | 'notifications' | 'search' | 'cart' | 'profile_edit' | 'admin' | 'recharge' | 'recharge_details';
export type ThemeType = 'light' | 'dark';

export interface Category {
  id: string;
  title: string;
  image: string;
}

export interface Banner {
  id: string;
  url: string;
  title: string;
  link?: string;
}

export interface CustomRate {
  productId: string;
  customUsdToCoinRate: number;
}

export interface Product {
  id: string;
  name: string;
  priceUSD: number;
  priceEGP: number;
  usdToCoinRate: number;
  amount: number;
  image: string;
  color: string;
  categoryId: string;
  isCustomAmount?: boolean;
}

export interface Order {
  id: string;
  productName: string;
  priceUSD: number;
  priceEGP: number;
  coinsAmount: number;
  date: string;
  status: 'completed' | 'pending' | 'rejected';
  playerId?: string;
  userId: string;
  type?: 'product' | 'recharge' | 'category_order';
  adminReply?: string;
  screenshot?: string;
  details?: any;
}

export interface RechargeMethod {
  id: string;
  label: string;
  icon: string;
  color: string;
  iban?: string;
  recipientName?: string;
  recipientName2?: string;
  instructions?: string;
  currencyIcon?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'recharge_success' | 'system' | 'order_update';
}

export interface UserState {
  name: string;
  email: string;
  password?: string;
  id: string;
  serialId?: number;
  vip: number;
  balanceUSD: number;
  profilePic: string;
  country: string;
  isVerified: boolean;
  theme: ThemeType;
  isAdmin?: boolean;
  isBlocked?: boolean;
  isFrozen?: boolean;
  customRates?: CustomRate[]; 
  permissions?: string[]; // مصفوفة لتخزين معرفات الأقسام المسموح بدخولها
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
}

export interface AppConfig {
  logoUrl: string;
  backgroundUrl?: string;
  loginBackgroundUrl?: string; 
  appName: string;
  usdToEgpRate: number;
  globalUsdToCoinRate: number;
  diamondPriceUSD: number;
  welcomeAnnouncement: string; 
  announcements?: string[]; 
  banners: Banner[];
  themeColors: ThemeColors;
  whatsappNumber?: string;
}
