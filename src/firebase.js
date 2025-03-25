

import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getDatabase, 
  ref, 
  set, 
  get 
} from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyAJsqbc3ESm21xtkrWKVxbdQSZ8hG5t3EU",
    authDomain: "fir-2523f.firebaseapp.com",
    databaseURL: "https://fir-2523f-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fir-2523f",
    storageBucket: "fir-2523f.firebasestorage.app",
    messagingSenderId: "162725265446",
    appId: "1:162725265446:web:a6ea60c90e2a54abcba6e7",
    measurementId: "G-B1VLLLS0SC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getDatabase(app);

// Function to handle Google Login
const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = ref(db, `users/${user.uid}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      // New user - Save profile to database with default role
      const userData = { 
        uid: user.uid, 
        name: user.displayName, 
        email: user.email, 
        role: "visitor" 
      };
      await set(userRef, userData);
      return userData;
    } else {
      return snapshot.val(); // Return existing user data
    }
  } catch (error) {
    console.error("Login Error:", error);
    return null;
  }
};

// Function to logout
const logout = async () => {
  await signOut(auth);
};

// Function to listen for authentication state changes
const checkAuthState = (callback) => {
  return onAuthStateChanged(auth, async (authUser) => {
    if (authUser) {
      const userRef = ref(db, `users/${authUser.uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

export { auth, provider, db, loginWithGoogle, logout, checkAuthState };
