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
  /* ---------- local state ---------- */
  const [token, setTokenState] = useState(readLS());
  const [user,  setUserState]  = useState(null);
  const [ready, setReady]      = useState(false);

  /* ---------- helpers ---------- */
  const storeToken = (t) => {
    t ? saveLS(t) : clearLS();
    setTokenState(t);
  };
  const storeUser = (u) => {
    u ? saveUser(u) : clearSavedUser();
    setUserState(u);
  };

  /* ---------- logout ---------- */
  const logout = async () => {
    try {
      /* tell backend to clear its auth cookie */
      await api.post("/auth/logout");
    } catch {
      /* ignore — cookie may already be gone */
    }
    try {
      /* sign out Firebase client (if signed in) */
      await signOut(auth);
    } catch {/* noop */}
    storeToken(null);
    storeUser(null);
  };

  /* ---------- Firebase ID‑token listener ---------- */
  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const fresh = await fbUser.getIdToken(/* forceRefresh */ true);
          storeToken(fresh);

          /* fetch /users/me — backend will create user document lazily if needed */
          const { data } = await api.get("/users/me");
          storeUser(data);
        } catch (err) {
          console.error("Auth sync error:", err);
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
        isAdmin: Boolean(user?.isAdmin),
        isAuthenticated,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
