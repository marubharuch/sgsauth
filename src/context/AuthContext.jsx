import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, firestore } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { collection, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import localforage from "localforage";

const AuthContext = createContext();

 //*Clearing LocalForage on initial load (useful for debugging but may cause unnecessary clearing)
await localforage.clear();
console.log("LocalForage cleared");
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const cachedUser = await localforage.getItem("authUser"); // ✅ Retrieving user from LocalForage
      const cachedFamily = await localforage.getItem("familyData"); // ✅ Retrieving family data from LocalForage
      const cachedMigratedData = await localforage.getItem("migratedData"); // ✅ Retrieving migrated data from LocalForage

      if (cachedUser) {
        setUser(cachedUser);
        setLoading(false);
      
        // ✅ Prevent redirection if already on a "safe" route like /all
        const currentPath = window.location.pathname;
        const skipRedirectPaths = ["/all", "/profile", "/visitor-dashboard", "/data-entry", "/role-management"]; // Add others if needed
      
        if (!skipRedirectPaths.includes(currentPath)) {
          if (cachedUser.familyId) {
            navigate("/profile");
          } else {
            navigate("/visitor-dashboard");
          }
        }
      
        return;
      }
      

      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          const userRef = ref(db, `users/${currentUser.uid}`);
          const snapshot = await get(userRef);

          let authUser;
          if (snapshot.exists()) {
            authUser = { ...snapshot.val(), uid: currentUser.uid, email: currentUser.email };
          } else {
            authUser = {
              uid: currentUser.uid,
              name: currentUser.displayName || "",
              email: currentUser.email,
              phone: "",
              role: "visitor",
              photoURL: currentUser.photoURL || "/default-avatar.png",
              familyId: null,
            };
            await set(userRef, authUser); // ✅ Storing user data in Firebase RTDB
          }

          await localforage.setItem("authUser", authUser); // ✅ Storing user data in LocalForage

          setUser(authUser);

          if (authUser.familyId && !cachedFamily) {
            const familyRef = ref(db, `families/${authUser.familyId}`);
            const familySnap = await get(familyRef);
            if (familySnap.exists()) {
              await localforage.setItem("familyData", familySnap.val()); // ✅ Storing family data in LocalForage
              console.log("Stored familyData in LocalForage:", familySnap.val());
            }
          }

          if (!cachedMigratedData) {
            const usersDoc = await getDoc(doc(firestore, "migratedData", "users"));
            const familiesDoc = await getDoc(doc(firestore, "migratedData", "families"));
            const migratedData = {
              users: usersDoc.exists() ? usersDoc.data() : {},
              families: familiesDoc.exists() ? familiesDoc.data() : {},
            };
            await localforage.setItem("migratedData", migratedData); // ✅ Storing migrated data in LocalForage
            console.log("Stored migratedData in LocalForage:", migratedData);
          }
        } else {
          setUser(null);
          await localforage.removeItem("authUser"); // ✅ Removing user data from LocalForage on logout
        }
        setLoading(false);
      });

      return () => unsubscribe();
    };

    fetchUser();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const { user } = result;
      if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        let authUser;

        if (snapshot.exists()) {
          authUser = { ...snapshot.val(), uid: user.uid, email: user.email };
        } else {
          authUser = {
            uid: user.uid,
            name: user.displayName || "",
            email: user.email,
            phone: user.phoneNumber || "",
            role: "visitor",
            photoURL: user.photoURL || "/default-avatar.png",
            familyId: null,
          };
          await set(userRef, authUser);
        }

        await localforage.setItem("authUser", authUser); // ✅ Storing user data in LocalForage after Google sign-in
        setUser(authUser);
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    await localforage.removeItem("authUser"); // ✅ Removing user from LocalForage
    await localforage.removeItem("familyData"); // ✅ Removing family data from LocalForage
    await localforage.removeItem("migratedData"); // ✅ Removing migrated data from LocalForage
    setUser(null);
    navigate("/");
  };

  const refreshData = async () => {
    if (user) {
      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        await localforage.setItem("authUser", snapshot.val()); // ✅ Refreshing user data in LocalForage
      }
      if (user.familyId) {
        const familyRef = ref(db, `families/${user.familyId}`);
        const familySnap = await get(familyRef);
        if (familySnap.exists()) {
          await localforage.setItem("familyData", familySnap.val()); // ✅ Refreshing family data in LocalForage
        }
      }
      const usersDoc = await getDoc(doc(firestore, "migratedData", "users"));
      const familiesDoc = await getDoc(doc(firestore, "migratedData", "families"));
      const migratedData = {
        users: usersDoc.exists() ? usersDoc.data() : {},
        families: familiesDoc.exists() ? familiesDoc.data() : {},
      };
      await localforage.setItem("migratedData", migratedData); // ✅ Refreshing migrated data in LocalForage
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, refreshData, signInWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
