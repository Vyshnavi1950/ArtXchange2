/*  src/utils/auth.js  — pure localStorage helpers  */
const TOKEN_KEY = "token";
const USER_KEY  = "user";

/* ---- token ---- */
export const getToken   = ()   => localStorage.getItem(TOKEN_KEY);
export const setToken   = (t)  => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = ()   => localStorage.removeItem(TOKEN_KEY);

/* ---- user ---- */
export const getUser    = () => {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; }
  catch { return null; }
};
export const setUser    = (u) => localStorage.setItem(USER_KEY, JSON.stringify(u));
export const clearUser  = () => localStorage.removeItem(USER_KEY);

/* ---- flags ---- */
export const isAuthenticated = () => Boolean(getToken() && getUser());
export const isAdmin         = () => getUser()?.isAdmin === true;

/* ---- hard logout ---- */
export const hardLogout = () => {
  clearToken();
  clearUser();
  window.location.href = "/login";
};
