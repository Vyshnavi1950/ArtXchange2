/*  src/pages/Match.jsx  */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/Match.css";

const API = import.meta.env.VITE_API_URL || "https://artxchange1.onrender.com";

export default function Match() {
  /* auth */
  const { user } = useAuth();
  const token = user?.token || localStorage.getItem("token");
  const axiosCfg = { headers: { Authorization: `Bearer ${token}` } };

  /* state */
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  /* fetch */
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const { data } = await axios.get(`${API}/api/matches`, axiosCfg);
        setMatches(data);
      } catch (err) {
        console.error("Match fetch error:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  /* helpers */
  const replace = (updated) =>
    setMatches((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));

  const updateStatus = async (id, action) => {
    try {
      const { data } = await axios.patch(
        `${API}/api/matches/${id}/respond`,
        { action }, // "accept" | "reject"
        axiosCfg
      );
      replace(data);
    } catch (err) {
      alert(err.response?.data?.msg || "Action failed");
    }
  };

  const schedule = async (id) => {
    const whenISO = prompt(
      "Enter session start (YYYY‑MM‑DDTHH:mm, 24‑h)\nExample: 2025‑07‑15T18:30"
    );
    if (!whenISO) return;
    try {
      const { data } = await axios.patch(
        `${API}/api/matches/${id}/schedule`,
        { whenISO, durationMin: 60 },
        axiosCfg
      );
      replace(data);
    } catch (err) {
      alert(err.response?.data?.msg || "Schedule failed");
    }
  };

  const deleteMatch = async (id) => {
    if (!confirm("Delete this match?")) return;
    try {
      await axios.delete(`${API}/api/matches/${id}`, axiosCfg);
      setMatches((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      alert(err.response?.data?.msg || "Delete failed");
    }
  };

  const group = (status) => matches.filter((m) => m.status === status);

  /* card */
  const Card = ({ m, idx }) => {
    const partner = m.participants?.find((p) => p._id !== user._id);
    if (!partner) return null;

    const isMine = m.participants.some((p) => p._id === user._id);

    return (
      <div className="match-card" style={{ "--i": idx }}>
        {/* avatar */}
        {partner.avatar ? (
          <img src={`${API}${partner.avatar}`} alt={partner.name} className="avatar" />
        ) : (
          <div className="avatar">{partner.name?.[0] || "?"}</div>
        )}

        {/* info */}
        <div className="match-info">
          <h4>{partner.name}</h4>
          <p><strong>Skill:</strong> {m.skill}</p>

          {/* accepted + scheduled */}
          {m.status === "accepted" && m.scheduledFor && (
            <>
              <small>
                Scheduled {new Date(m.scheduledFor).toLocaleString()} •{" "}
                {m.durationMin || 60} min
              </small>
              <div className="button-row">
                <a
                  href={`https://meet.jit.si/${m.videoRoom}`}
                  className="btn btn-call"
                  target="_blank"
                  rel="noreferrer"
                >
                  Join Call
                </a>
              </div>
            </>
          )}

          {/* accepted but not yet scheduled */}
          {m.status === "accepted" && !m.scheduledFor && (
            <div className="button-row">
              <button className="btn btn-schedule" onClick={() => schedule(m._id)}>
                Schedule
              </button>
            </div>
          )}

          {/* pending accept / reject */}
          {m.status === "pending" && (
            <div className="button-row">
              <button className="btn btn-accept" onClick={() => updateStatus(m._id, "accept")}>
                Accept
              </button>
              <button className="btn btn-reject" onClick={() => updateStatus(m._id, "reject")}>
                Reject
              </button>
            </div>
          )}

          {/* always‑available actions */}
          <div className="button-row">
            <Link to={`/chat/${partner._id}`} className="btn btn-chat">
              💬 Chat
            </Link>
            {isMine && (
              <button className="btn btn-delete" onClick={() => deleteMatch(m._id)}>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* section */
  const Section = ({ title, list }) => (
    <>
      <h2 className="section-heading">{title}</h2>
      {list.length === 0 ? (
        <p className="none-text">(none)</p>
      ) : (
        <div className="match-list">
          {list.map((m, i) => (
            <Card key={m._id} m={m} idx={i} />
          ))}
        </div>
      )}
    </>
  );

  /* render */
  return (
    <div className="match-hero">
      <div className="match-overlay">
        <h1 className="match-title">My Matches</h1>
        {loading ? (
          <p className="loading">Loading…</p>
        ) : (
          <>
            <Section title="Pending"  list={group("pending")} />
            <Section title="Accepted" list={group("accepted")} />
            <Section title="Rejected" list={group("rejected")} />
          </>
        )}
      </div>
    </div>
  );
}
