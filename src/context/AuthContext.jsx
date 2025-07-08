/*  src/context/AuthContext.jsx  */
import { createContext, useContext, useEffect, useState } from "react";
import { onIdTokenChanged, signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
import api from "../utils/api";
import {
  getToken as readLS,
  setToken as saveLS,
  clearToken as clearLS,
  setUser  as saveUser,
  clearUser as clearSavedUser,
} from "../utils/auth.js";

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [token, setTokenState] = useState(readLS());
  const [user,  setUserState]  = useState(null);
  const [ready, setReady]      = useState(false);

  /* helpers */
  const storeToken = (t) => { t ? saveLS(t) : clearLS(); setTokenState(t); };
  const storeUser  = (u) => { u ? saveUser(u) : clearSavedUser(); setUserState(u); };

  const logout = async () => { try { await signOut(auth); } catch {} storeToken(null); storeUser(null); };

  /* Firebase listener */
  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const fresh = await fbUser.getIdToken();
          storeToken(fresh);
          try {
            const { data } = await api.get("/users/me");      // token auto‑added
            storeUser(data);
          } catch {
            storeUser({
              _id: fbUser.uid,
              name: fbUser.displayName || "Anonymous",
              email: fbUser.email,
              avatar: fbUser.photoURL,
              isAdmin: false,
            });
          }
        } catch {
          storeToken(null);
          storeUser(null);
        }
      } else {
        storeToken(null);
        storeUser(null);
      }
      setReady(true);
    });
    return () => unsub();
  }, []);

  const isAuthenticated = Boolean(token && user);

  if (!ready) return <p className="loading">Loading auth…</p>;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        ready,
        isAdmin: user?.isAdmin || false,
        isAuthenticated,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
