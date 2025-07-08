/*  src/context/AuthContext.jsx  */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { onIdTokenChanged, signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
import api from "../utils/api";

/* local‑storage helpers */
import {
  getToken as readLS,
  setToken as saveLS,
  clearToken as clearLS,
  setUser  as saveUser,
  clearUser as clearSavedUser,
} from "../utils/auth.js";

/* ──────────────────────────── */
/* Context + hook              */
/* ──────────────────────────── */
export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

/* ──────────────────────────── */
/* Provider                     */
/* ──────────────────────────── */
export default function AuthProvider({ children }) {
  const [token, setTokenState] = useState(readLS());
  const [user,  setUserState]  = useState(null);
  const [ready, setReady]      = useState(false);

  /* ---------- sync Axios header ---------- */
  const syncAxiosHeader = useCallback((t) => {
    if (t) {
      api.defaults.headers.common.Authorization = `Bearer ${t}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, []);

  /* ---------- state helpers ---------- */
  const storeToken = useCallback(
    (t) => {
      t ? saveLS(t) : clearLS();
      setTokenState(t);
      syncAxiosHeader(t);
    },
    [syncAxiosHeader]
  );

  const storeUser = useCallback((u) => {
    u ? saveUser(u) : clearSavedUser();
    setUserState(u);
  }, []);

  /* ---------- logout ---------- */
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");   // clear server cookie
    } catch (_) {
      /* cookie might already be gone — ignore */
    }
    try {
      await signOut(auth);              // Firebase sign‑out
    } catch (_) {
      /* ignore */
    }
    storeToken(null);
    storeUser(null);
  }, [storeToken, storeUser]);

  /* ---------- Firebase listener ---------- */
  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const fresh = await fbUser.getIdToken(true); // force refresh
          storeToken(fresh);

          // backend will auto‑create user doc if missing
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

    return unsub; // cleanup on unmount
  }, [storeToken, storeUser]);

  /* ---------- ensure Axios header on first load ---------- */
  useEffect(() => {
    if (token) syncAxiosHeader(token);
  }, [token, syncAxiosHeader]);

  /* ---------- derived flags ---------- */
  const isAuthenticated = Boolean(token && user);
  const isAdmin         = Boolean(user?.isAdmin);

  /* ---------- loading splash ---------- */
  if (!ready) return <p className="loading">Loading auth…</p>;

  /* ---------- context value ---------- */
  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        ready,
        isAuthenticated,
        isAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
