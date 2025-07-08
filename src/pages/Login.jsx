/*  frontend/src/pages/Login.jsx  */
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { auth } from "../utils/firebase";
import api from "../utils/api";
import { setToken as cacheToken, setUser as cacheUser } from "../utils/auth";
import { AuthContext } from "../context/AuthContext";
import "../styles/Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const { setToken, setUser } = useContext(AuthContext);  // ✅ both from context

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // handle input change
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // helper to sync token + user
  const saveAuth = async (firebaseUser) => {
    const token = await firebaseUser.getIdToken(true);  // 🔄 always get fresh token

    cacheToken(token);   // save to localStorage
    setToken(token);     // update global context for axios interceptor

    const { data } = await api.get("/users/me"); // backend call with Bearer token
    cacheUser(data);
    setUser(data);        // 🔄 update global context
  };

  // Email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      await saveAuth(cred.user);
      navigate("/explore");  // ✅ your home or explore page
    } catch (err) {
      alert(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth login
  const handleGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, new GoogleAuthProvider());
      await saveAuth(res.user);
      navigate("/explore");
    } catch (err) {
      alert(err.message || "Google login failed");
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2 className="auth-title">Welcome&nbsp;Back</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <div className="forgot-wrapper">
          <Link to="/forgot">Forgot password?</Link>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in…" : "Login"}
        </button>

        <button type="button" onClick={handleGoogle} className="google-btn">
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
          />
          Sign in with Google
        </button>

        <p className="auth-footer">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
