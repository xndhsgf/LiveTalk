
import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBsHj__2h1ksWvG_nlr5vXpAurQV5CgQi8",
  authDomain: "royal-charge.firebaseapp.com",
  projectId: "royal-charge",
  storageBucket: "royal-charge.firebasestorage.app",
  messagingSenderId: "418043619400",
  appId: "1:418043619400:web:fd7b22a26d5d1077c2507d"
};

const app = initializeApp(firebaseConfig);

// تفعيل الكاش المحلي لضمان عمل التطبيق حتى عند فقدان الاتصال المؤقت
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
