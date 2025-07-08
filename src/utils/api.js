/*  src/utils/api.js  */
import axios from "axios";
import { auth } from "./firebase";
import { getToken, setToken, clearToken } from "./auth.js";

/* ──────────────────────────────────────────────────────────
   Resolve the backend host

   • In production (Vercel build)  ➜  MUST have VITE_API_URL
   • In dev (npm run dev on localhost) ➜ fallback to localhost:5000
   ────────────────────────────────────────────────────────── */
const HOST = import.meta.env.VITE_API_URL
  ?? (import.meta.env.DEV ? "http://localhost:5000" : null);

if (!HOST) {
  // Stop the build immediately if the env‑var is missing in prod
  throw new Error(
    "❌  VITE_API_URL is not defined – add it in Vercel → Project Settings → Environment."
  );
}

console.log("🌐 API host →", HOST);  // shows at dev start & in browser console

/* ───────── Create shared axios instance ───────── */
const api = axios.create({
  baseURL: `${HOST}/api`,   // ← every call becomes /api/...
  withCredentials: true     // ← send/receive cookies
});

/* ───────── Token‑refresh helper ───────── */
let refreshing = null;
async function getFreshIdToken() {
  if (!auth.currentUser) return null;
  if (refreshing) return refreshing;           // de‑dupe concurrent refresh

  const { exp } = JSON.parse(
    atob(auth.currentUser.stsTokenManager.accessToken.split(".")[1])
  );
  const msLeft = exp * 1000 - Date.now();

  refreshing =
    msLeft < 60_000 ? auth.currentUser.getIdToken(true)  // force refresh
                    : auth.currentUser.getIdToken();     // cached

  try   { return await refreshing; }
  finally { refreshing = null; }
}

/* ───────── Request interceptor ───────── */
api.interceptors.request.use(async (config) => {
  const idToken = await getFreshIdToken();
  if (idToken) {
    setToken(idToken);                 // cache for Postman/fallback
    config.headers.Authorization = `Bearer ${idToken}`;
  } else {
    const local = getToken();
    if (local) config.headers.Authorization = `Bearer ${local}`;
  }
  return config;
});

/* ───────── Global auth‑error handler ───────── */
api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const code = err.response?.status;
    if (code === 401 || code === 403) {
      clearToken();
      if (auth.currentUser) await auth.signOut();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
