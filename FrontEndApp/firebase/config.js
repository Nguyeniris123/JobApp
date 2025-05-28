
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configuration object
export const firebaseConfig = {
  apiKey: "AIzaSyCIMcF2niWutcfWzw1OlGm7EWZA3U4e5F0",
  authDomain: "jobappchat.firebaseapp.com",
  projectId: "jobappchat",
  databaseURL: "https://jobappchat-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "jobappchat.firebasestorage.app",
  messagingSenderId: "501808058071",
  appId: "1:501808058071:web:7091b099f4484ac2caea92"
};

// Khởi tạo Firebase một lần duy nhất
const app = initializeApp(firebaseConfig);

// Khởi tạo database
const database = getDatabase(app);

// Export database
export { database };
