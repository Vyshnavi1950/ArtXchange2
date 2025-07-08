import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../utils/firebase";
import api from "../utils/api";
import { setToken, setUser } from "../utils/auth";
import "../styles/Auth.css";

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      /* ---------- Firebase signup ---------- */
      const cred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      await updateProfile(cred.user, { displayName: form.name });

      const token = await cred.user.getIdToken();
      setToken(token);

      /* ---------- Optional avatar upload ---------- */
      if (avatar) {
        const fd = new FormData();
        fd.append("avatar", avatar);
        await api.put("/users/me", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      /* ---------- Fetch & cache profile ---------- */
      const { data } = await api.get("/users/me");
      setUser(data);

      nav("/");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2 className="auth-title">Join&nbsp;ArtXchange</h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />
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

        {/* optional avatar */}
        <label style={{ margin: "8px 0" }}>
          Avatar:
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files[0])}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Creating…" : "Register"}
        </button>

        <p className="auth-footer">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
