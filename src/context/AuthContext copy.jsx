import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import localforage from "localforage";  // ✅ Import localForage

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Prevent flickering
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const cachedUser = await localforage.getItem("authUser"); // ✅ Get cached user

      if (cachedUser) {
        setUser(cachedUser);
        setLoading(false);
      }

      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          const userRef = ref(db, `users/${currentUser.uid}`);
          const snapshot = await get(userRef);

          if (snapshot.exists()) {
            const userData = snapshot.val();
            const authUser = {
              uid: currentUser.uid,
              name: userData.name || "",
              email: currentUser.email,
              phone: userData.phone || "",
              role: userData.role || "visitor",
              photoURL: userData.photoURL || "/default-avatar.png",
            };

            setUser(authUser);
            await localforage.setItem("authUser", authUser); // ✅ Store only serializable data
          } else {
            const newUser = {
              uid: currentUser.uid,
              name: currentUser.displayName || "",
              email: currentUser.email,
              phone: "",
              role: "visitor",
              photoURL: currentUser.photoURL || "/default-avatar.png",
            };

            await set(userRef, newUser);
            setUser(newUser);
            await localforage.setItem("authUser", newUser); // ✅ Store in local cache
          }
        } else {
          setUser(null);
          await localforage.removeItem("authUser"); // ✅ Clear cache on logout
        }
        setLoading(false);
      });

      return () => unsubscribe();
    };

    fetchUser();
  }, []);

  // ✅ Google Sign-In
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const currentUser = result.user;

      const userRef = ref(db, `users/${currentUser.uid}`);
      const snapshot = await get(userRef);

      let authUser;

      if (snapshot.exists()) {
        const userData = snapshot.val();
        authUser = {
          uid: currentUser.uid,
          name: userData.name || "",
          email: currentUser.email,
          phone: userData.phone || "",
          role: userData.role || "visitor",
          photoURL: userData.photoURL || "/default-avatar.png",
        };
      } else {
        authUser = {
          uid: currentUser.uid,
          name: currentUser.displayName || "",
          email: currentUser.email,
          phone: "",
          role: "visitor",
          photoURL: currentUser.photoURL || "/default-avatar.png",
        };
        await set(userRef, authUser);
      }

      setUser(authUser);
      await localforage.setItem("authUser", authUser);
      navigate(authUser.phone ? "/visitor-dashboard" : "/profile");
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  // ✅ Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    await localforage.removeItem("authUser"); // ✅ Clear cache on logout
    navigate("/signin");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, signInWithGoogle, logout }}>
      {!loading && children} {/* ✅ Prevent flickering */}
    </AuthContext.Provider>
  );
};
