import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, firestore } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { collection, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import localforage from "localforage";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const cachedUser = await localforage.getItem("authUser");
      const cachedFamily = await localforage.getItem("familyData");
      const cachedMigratedData = await localforage.getItem("migratedData");

      if (cachedUser) {
        setUser(cachedUser);
        setLoading(false);
      }

      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          const userRef = ref(db, `users/${currentUser.uid}`);
          const snapshot = await get(userRef);

          let authUser;
          if (snapshot.exists()) {
            const userData = snapshot.val();
            authUser = { ...userData, uid: currentUser.uid, email: currentUser.email };
            await localforage.setItem("authUser", authUser);
            setUser(authUser);
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
            await set(userRef, authUser);
            await localforage.setItem("authUser", authUser);
            setUser(authUser);
          }

          // Fetch Family Data if user has familyId
          if (authUser.familyId && !cachedFamily) {
            const familyRef = ref(db, `families/${authUser.familyId}`);
            const familySnap = await get(familyRef);
            if (familySnap.exists()) {
              await localforage.setItem("familyData", familySnap.val());
            }
          }

          // Fetch Firestore migratedData (Users & Families) if not cached
          if (!cachedMigratedData) {
            const usersDoc = await getDoc(doc(firestore, "migratedData", "users"));
            const familiesDoc = await getDoc(doc(firestore, "migratedData", "families"));
            const migratedData = {
              users: usersDoc.exists() ? usersDoc.data() : {},
              families: familiesDoc.exists() ? familiesDoc.data() : {},
            };
            await localforage.setItem("migratedData", migratedData);
          }
        } else {
          setUser(null);
          await localforage.removeItem("authUser");
        }
        setLoading(false);
      });

      return () => unsubscribe();
    };

    fetchUser();
  }, []);

  const refreshData = async () => {
    if (user) {
      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        await localforage.setItem("authUser", snapshot.val());
      }
      if (user.familyId) {
        const familyRef = ref(db, `families/${user.familyId}`);
        const familySnap = await get(familyRef);
        if (familySnap.exists()) {
          await localforage.setItem("familyData", familySnap.val());
        }
      }
      const usersDoc = await getDoc(doc(firestore, "migratedData", "users"));
      const familiesDoc = await getDoc(doc(firestore, "migratedData", "families"));
      const migratedData = {
        users: usersDoc.exists() ? usersDoc.data() : {},
        families: familiesDoc.exists() ? familiesDoc.data() : {},
      };
      await localforage.setItem("migratedData", migratedData);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, refreshData }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
