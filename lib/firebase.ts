import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCC_rCR54i6BfO1ZnlNpcUOXPpskeenStM",
  authDomain: "maratan-map.firebaseapp.com",
  projectId: "maratan-map",
  storageBucket: "maratan-map.firebasestorage.app",
  messagingSenderId: "252911686821",
  appId: "1:252911686821:web:de99c8b0c7f91cef1b294c"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);