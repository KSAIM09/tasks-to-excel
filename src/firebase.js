import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration (direct)
const firebaseConfig = {
  apiKey: "AIzaSyBOYsPfNCLf4ySnvAKo6YgGWrDrrQbCaS0",
  authDomain: "monthly-tasks-40843.firebaseapp.com",
  databaseURL: "https://monthly-tasks-40843-default-rtdb.firebaseio.com",
  projectId: "monthly-tasks-40843",
  storageBucket: "monthly-tasks-40843.firebasestorage.app",
  messagingSenderId: "952607714234",
  appId: "1:952607714234:web:9dd0aaa454d5ec6b4e4b83"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with networking fallbacks to avoid stream issues behind proxies/ad-blockers
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  useFetchStreams: false,
});

export default app;
