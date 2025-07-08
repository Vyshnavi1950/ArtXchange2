import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/Explore.css";

const LIMIT = 12;
const API = import.meta.env.VITE_API_URL || "https://artxchange1.onrender.com";
const safe = (src) => (src?.startsWith("http") ? src : `${API}${src || ""}`);

export default function Explore() {
  const { user } = useAuth(); // may be null if guest
  const [skill, setSkill] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const sentinel = useRef(null);

  // ---------------- fetch page ----------------
  useEffect(() => {
    let cancel = false;
    (async () => {
      setBusy(true);
      try {
        const { data } = await axios.get(`${API}/api/users/explore`, {
          params: { page, limit: LIMIT, skill, userId: user?._id },
        });
        if (cancel) return;

        setUsers((prev) => {
          const seen = new Set(prev.map((u) => u._id));
          const merged = [
            ...prev,
            ...data.users.filter((u) => !seen.has(u._id)),
          ];
          setTotal(data.total);
          return page === 1 ? data.users : merged;
        });
      } catch (err) {
        console.error("Explore fetch error:", err.response?.data || err);
      } finally {
        if (!cancel) setBusy(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [page, skill, user]);

  // ---------------- reset on new search ----------------
  useEffect(() => {
    setUsers([]);
    setPage(1);
    setTotal(0);
  }, [skill]);

  // ---------------- infinite scroll ----------------
  useEffect(() => {
    if (!sentinel.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const more = users.length < total;
        if (entry.isIntersecting && !busy && more) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 }
    );
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, [busy, total, users.length]);

  // ---------------- render ----------------
  const display = skill
    ? users.filter((u) =>
        (
          u.name +
          " " +
          u.bio +
          " " +
          (u.skillsOffered || []).join(" ") +
          " " +
          (u.skillsNeeded || []).join(" ")
        )
          .toLowerCase()
          .includes(skill.toLowerCase())
      )
    : users;

  return (
    <div className="explore-glass">
      <h2 className="headline">Explore Artists</h2>

      <input
        className="skill-input"
        placeholder="Search skill, name, bio…"
        value={skill}
        onChange={(e) => setSkill(e.target.value)}
      />

      {display.length === 0 && !busy ? (
        <p className="status">No artists found.</p>
      ) : (
        <>
          <div className="user-grid">
            {display.map((u) => (
              <div key={u._id} className="user-card">
                <Link to={`/profile/${u._id}`} className="card-link">
                  <img
                    src={safe(u.avatar)}
                    alt={u.name}
                    className="user-avatar"
                  />
                  <h3>{u.name}</h3>
                  <div className="skills">
                    {(u.skillsOffered || []).slice(0, 3).map((s) => (
                      <span key={s} className="chip">
                        {s}
                      </span>
                    ))}
                  </div>
                </Link>

                {/* New: View Profile Button */}
                <Link to={`/profile/${u._id}`} className="view-btn">
                  View Profile
                </Link>
              </div>
            ))}
          </div>
          {busy && <p className="status">Loading…</p>}
          <div ref={sentinel} style={{ height: 1 }} />
        </>
      )}
    </div>
  );
}
