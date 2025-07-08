/*  src/utils/api.js  */
import axios from "axios";
import { auth } from "./firebase";
import { getToken, setToken, clearToken } from "./auth.js";


const BASE =
  import.meta.env.VITE_API_URL ||
  (location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://artxchange1.onrender.com");



const api = axios.create({
  baseURL: `${BASE}/api`,
  withCredentials: true, // always send cookies
});

/* ───────────── Token‑refresh guard ─────────────
   Prevents multiple concurrent refreshes.
------------------------------------------------*/
let refreshing = null; // holds the in‑flight refresh Promise

async function getFreshIdToken() {
  if (!auth.currentUser) return null;

  // Re‑use ongoing refresh if one is already happening
  if (refreshing) return refreshing;

  // Trigger forced refresh only if token expiring in <60 s
  const { exp } = JSON.parse(atob(auth.currentUser.stsTokenManager.accessToken.split(".")[1]));
  const willExpireIn = exp * 1000 - Date.now();

  refreshing =
    willExpireIn < 60_000
      ? auth.currentUser.getIdToken(true) // force refresh
      : auth.currentUser.getIdToken();    // cached

  try {
    const idToken = await refreshing;
    return idToken;
  } finally {
    refreshing = null; // allow next refresh
  }
}

/* ───────────── Request interceptor ───────────── */
api.interceptors.request.use(
  async (config) => {
    const idToken = await getFreshIdToken();
    if (idToken) {
      setToken(idToken); // store for fallback (e.g. Postman)
      config.headers.Authorization = `Bearer ${idToken}`;
    } else {
      const stored = getToken();
      if (stored) config.headers.Authorization = `Bearer ${stored}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ───────────── Response interceptor ───────────── */
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      clearToken();
      if (auth.currentUser) await auth.signOut();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
