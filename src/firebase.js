import { initializeApp } from "firebase/app";
import { getFirestore, doc, collection } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// ── Paste your Firebase project config here ──
// Get it from: Firebase Console → Project Settings → Your apps → SDK setup
const firebaseConfig = {
  apiKey: "AIzaSyBOeaboZKCeX5eEFTnfFmrIAVFF-hUvsZc",
  authDomain: "qrscanner-fbbe5.firebaseapp.com",
  projectId: "qrscanner-fbbe5",
  storageBucket: "qrscanner-fbbe5.firebasestorage.app",
  messagingSenderId: "580112527272",
  appId: "1:580112527272:web:30bc1d1851fc0dc16e779d",
  measurementId: "G-0E3VLFGZE4"
};

export const isFirebaseConfigured = !firebaseConfig.apiKey.startsWith("YOUR_");

let db = null;
let auth = null;
let googleProvider = null;
let menuDoc = null;
let ordersCol = null;
let reviewsCol = null;

if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  menuDoc = doc(db, "menu", "data");
  ordersCol = collection(db, "orders");
  reviewsCol = collection(db, "reviews");
}

export { db, auth, googleProvider, menuDoc, ordersCol, reviewsCol };
