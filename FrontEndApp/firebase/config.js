
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { enableIndexedDbPersistence, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCIMcF2niWutcfWzw1OlGm7EWZA3U4e5F0",
  authDomain: "jobappchat.firebaseapp.com",
  projectId: "jobappchat",
  databaseURL: "https://jobappchat-default-rtdb.asia-southeast1.firebasedatabase.app/",
  storageBucket: "jobappchat.firebasestorage.app",
  messagingSenderId: "501808058071",
  appId: "1:501808058071:web:7091b099f4484ac2caea92"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

if (process.env.NODE_ENV === 'production') {
  enableIndexedDbPersistence(db)
    .catch((err) => {
      console.error('Firestore persistence failed:', err.code);
    });
}

export { auth, db };




