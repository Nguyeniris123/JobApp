
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { enableIndexedDbPersistence, getFirestore } from 'firebase/firestore';

// Firebase configuration object
export const firebaseConfig = {
  apiKey: "AIzaSyB8R83GV2FwuIBxLVCwpLPITAOmS1f_kJM",
  authDomain: "jobapp-9c8b0.firebaseapp.com",
  projectId: "jobapp-9c8b0",
  // databaseURL: "https://jobappchat-default-rtdb.asia-southeast1.firebasedatabase.app/",
  storageBucket: "jobapp-9c8b0.firebasestorage.app",
  messagingSenderId: "967409187661",
  appId: "1:967409187661:web:d976687c40d25c0eae5504"
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




