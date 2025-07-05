// firebase-init.js
// Helper script to initialize sample data in Firestore
// Run this after setting up Firebase: node firebase-init.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Import your Firebase config from .env
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample areas to initialize
const sampleAreas = [
  { name: 'Main Hall', maxCapacity: 1000, currentCount: 0, status: 'enabled' },
  { name: 'Conference Room A', maxCapacity: 50, currentCount: 0, status: 'enabled' },
  { name: 'Exhibition Area', maxCapacity: 500, currentCount: 0, status: 'enabled' },
  { name: 'Lobby', maxCapacity: 200, currentCount: 0, status: 'enabled' },
  { name: 'Auditorium', maxCapacity: 300, currentCount: 0, status: 'disabled' },
];

async function initializeData() {
  console.log('🔄 Initializing sample data...');
  
  try {
    const areasCollection = collection(db, 'areas');
    
    for (const area of sampleAreas) {
      const docRef = await addDoc(areasCollection, area);
      console.log(`✅ Added area: ${area.name} (ID: ${docRef.id})`);
    }
    
    console.log('🎉 Sample data initialized successfully!');
    console.log('You can now start using the GE Counter application.');
    
  } catch (error) {
    console.error('❌ Error initializing data:', error);
    console.log('Please check your Firebase configuration and try again.');
  }
}

// Run the initialization
initializeData();
