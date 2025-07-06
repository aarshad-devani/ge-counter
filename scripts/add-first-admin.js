// First Admin Setup Script
// Run this once to add yourself as the first admin

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Your Firebase config (copy from your .env or firebase config)
const firebaseConfig = {
  // Add your config here
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to add first admin
export const addFirstAdmin = async (adminEmail: string) => {
  try {
    const adminDoc = doc(db, 'admins', adminEmail);
    
    await setDoc(adminDoc, {
      email: adminEmail,
      addedAt: new Date().toISOString(),
      addedBy: 'system',
      status: 'active',
    });
    
    console.log('✅ First admin added successfully:', adminEmail);
  } catch (error) {
    console.error('❌ Error adding first admin:', error);
  }
};

// Call this function with your email
// addFirstAdmin('your-email@example.com');
