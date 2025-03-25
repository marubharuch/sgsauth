import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [hasNavigated, setHasNavigated] = useState(false); // Prevent unnecessary redirects
  const navigate = useNavigate();
  const location = useLocation();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUser({ ...currentUser, ...userData });

          // ✅ Prevent infinite navigation loop
          if (!hasNavigated) {
            if (!userData.phone) {
              navigate("/profile");
            } else {
              navigate("/visitor-dashboard");
            }
            setHasNavigated(true); // Set navigation flag to prevent looping
          }
        } else {
          // First-time login → Store user data & move to profile
          const newUser = {
            name: currentUser.displayName || "",
            email: currentUser.email,
            phone: "",
            role: "visitor",
            photoURL: currentUser.photoURL || "/default-avatar.png",
          };

          await set(userRef, newUser);
          setUser({ ...currentUser, ...newUser });

          if (!hasNavigated) {
            navigate("/profile");
            setHasNavigated(true);
          }
        }
      } else {
        setUser(null);
        setHasNavigated(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, hasNavigated]);

  // Google Sign-In
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const currentUser = result.user;

      const userRef = ref(db, `users/${currentUser.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        setUser({ ...currentUser, ...userData });

        if (!userData.phone) {
          navigate("/profile");
        } else {
          navigate("/visitor-dashboard");
        }
      } else {
        // First-time login, store new user
        const newUser = {
          name: currentUser.displayName || "",
          email: currentUser.email,
          phone: "",
          role: "visitor",
          photoURL: currentUser.photoURL || "/default-avatar.png",
        };

        await set(userRef, newUser);
        setUser({ ...currentUser, ...newUser });

        navigate("/profile");
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  // ✅ Fix Logout Issue
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setHasNavigated(false); // Reset navigation state on logout
    navigate("/signin");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
