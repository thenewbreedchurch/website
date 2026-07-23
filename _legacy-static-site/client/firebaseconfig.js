import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCxSIkVzOfHFsvEArp_OIAWm5f3DRAFDgg",
  authDomain: "tnbc-3a241.firebaseapp.com",
  projectId: "tnbc-3a241",
  storageBucket: "tnbc-3a241.firebasestorage.app",
  messagingSenderId: "371325686686",
  appId: "1:371325686686:web:31340b81722fe240543c8f",
  measurementId: "G-CYYYNX41K1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase service
export const auth = getAuth(app);
export const db = getFirestore(app);
