// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCe63NDqYR2A-hUOu22S5Kr1g6vclkIcGw",
  authDomain: "nhatroketnoi-9390a.firebaseapp.com",
  databaseURL: "https://nhatroketnoi-9390a-default-rtdb.firebaseio.com",
  projectId: "nhatroketnoi-9390a",
  storageBucket: "nhatroketnoi-9390a.appspot.com",
  messagingSenderId: "249753111607",
  appId: "1:249753111607:web:3f6d0ddaa27e34fc6683b2",
  measurementId: "G-219LR643DB",
};

// Khởi tạo Firebase cho môi trường ES6/modules
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const database = getDatabase(app);

// Analytics only works in browser environment
try {
  export const analytics = getAnalytics(app);
} catch (error) {
  console.log(
    "Analytics not initialized. This is expected in Node.js environment."
  );
}

export default app;
