/*  src/pages/Profile.jsx  */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../utils/api";
import ArtworkUpload from "../components/ArtworkUpload";
import toast from "react-hot-toast";
import "../styles/Profile.css";

/* ✅ Dynamic safe image/file path */
const safe = (s) => {
  const base = api.defaults.baseURL?.replace(/\/api$/, "") || "";
  return s?.startsWith("http") ? s : `${base}${s || ""}`;
};

export default function Profile() {
  const { id } = useParams();
  const [me, setMe] = useState(null);
  const [user, setUser] = useState(null);
  const [follow, setFollow] = useState(false);
  const [matchStatus, setMatchStatus] = useState("none");
  const [lightbox, setLight] = useState(null);
  const [loading, setLoad] = useState(true);
  const [error, setErr] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const { data: meData } = await api.get("/users/me");
        if (cancel) return;
        setMe(meData);

        const endpoint = id ? `/users/${id}` : "/users/me";
        const { data: target } = await api.get(endpoint);
        if (cancel) return;

        target.followers ??= [];
        target.following ??= [];
        target.posts ??= [];

        setFollow(id && target.followers.includes(meData._id));
        setUser(target);

        if (id && id !== meData._id) {
          try {
            const { data } = await api.get(`/matches/with/${id}`);
            setMatchStatus(data.status ?? "none");
          } catch {
            setMatchStatus("none");
          }
        }
      } catch (err) {
        const code = err.response?.status;
        setErr(code === 404 ? "User not found." : "Failed to load profile.");
      } finally {
        if (!cancel) setLoad(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [id]);

  const toggleFollow = async () => {
    try {
      const url = `/users/${user._id}/follow`;
      if (follow) {
        await api.delete(url);
        setUser((u) => ({ ...u, followers: u.followers.filter((f) => f !== me._id) }));
        setFollow(false);
      } else {
        await api.post(url);
        setUser((u) => ({ ...u, followers: [...u.followers, me._id] }));
        setFollow(true);
      }
    } catch {
      toast.error("Unable to update follow status");
    }
  };

  const requestMatch = async () => {
    if (!user || !me) return;
    const overlap = (user.skillsOffered || []).filter((s) =>
      (me.skillsNeeded || []).includes(s)
    );
    let skill = overlap[0];

    if (!skill) {
      skill = prompt(
        `Which of their skills do you want to learn?\nPartner offers: ${(
          user.skillsOffered || []
        ).join(", ")}`
      );
    }
    if (!skill) return;

    try {
      await api.post("/matches", { targetId: user._id, skill });
      toast.success("Match requested!");
      setMatchStatus("pending");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Could not send match request.");
    }
  };

  const handleAvatarChange = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("avatar", file);
    const { data } = await api.put("/users/me", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setUser((u) => ({ ...u, avatar: data.avatar }));
  };

  const addPost = (p) => me && user._id === me._id &&
    setUser((u) => ({ ...u, posts: [...u.posts, p] }));

  const deletePost = async (idx) => {
    if (!me || user._id !== me._id) return;
    await api.delete(`/users/me/posts/${idx}`);
    setUser((u) => ({ ...u, posts: u.posts.filter((_, i) => i !== idx) }));
  };

  if (loading) return <p className="loading">Loading…</p>;
  if (error) return <p className="error">{error}</p>;
  if (!user) return null;

  const isSelf = !id || id === me._id;

  return (
    <div className="profile-wrapper">
      <div className="profile-card animate">
        <div className="ig-header">
          <label className="ig-avatar-wrapper">
            <img src={safe(user.avatar)} className="ig-avatar" alt="avatar" />
            {isSelf && (
              <>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleAvatarChange(e.target.files[0])}
                />
                <span className="ig-avatar-overlay">📷</span>
              </>
            )}
          </label>

          <div className="ig-user-info">
            <h2 className="ig-name">{user.name}</h2>
            <p className="ig-email">{user.email}</p>
            {user.bio && <p className="ig-bio">{user.bio}</p>}

            <ul className="ig-stats">
              <li><strong>{user.posts.length}</strong> posts</li>
              <li><strong>{user.followers.length}</strong> followers</li>
              <li><strong>{user.following.length}</strong> following</li>
            </ul>

            {isSelf ? (
              <Link to="/profile/edit" className="ig-edit-btn">Edit profile</Link>
            ) : (
              <div className="btn-row">
                <button
                  className={`ig-follow-btn ${follow ? "following" : ""}`}
                  onClick={toggleFollow}
                >
                  {follow ? "Following ✓" : "Follow"}
                </button>

                {matchStatus === "none" && (
                  <button className="ig-match-btn" onClick={requestMatch}>
                    Match
                  </button>
                )}
                {matchStatus === "pending" && (
                  <button className="ig-match-btn disabled">Requested ✓</button>
                )}
                {matchStatus === "accepted" && (
                  <button className="ig-match-btn disabled">Matched ✓</button>
                )}
              </div>
            )}
          </div>
        </div>

        <SkillBlock title="Skills I Teach" skills={user.skillsOffered} />
        <SkillBlock title="Skills I Want to Learn" skills={user.skillsNeeded} variant="learn" />

        <div className="profile-section">
          <h3>My Artworks</h3>
          {isSelf && <ArtworkUpload onAdd={addPost} />}
          {user.posts.length ? (
            <div className="artwork-grid">
              {user.posts.map((p, i) => (
                <div className="artwork-card" key={i}>
                  <img src={safe(p.image)} alt="" onClick={() => setLight(safe(p.image))} />
                  {p.caption && <p>{p.caption}</p>}
                  {isSelf && (
                    <button
                      onClick={() => deletePost(i)}
                      className="delete-post"
                    >
                      🗑
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-posts">
              {isSelf ? "You haven’t posted any artwork yet." : "No artworks posted yet."}
            </p>
          )}
        </div>
      </div>

      {lightbox && (
        <div className="lightbox" onClick={() => setLight(null)}>
          <img src={lightbox} alt="full" />
        </div>
      )}
    </div>
  );
}

function SkillBlock({ title, skills = [], variant = "" }) {
  const unique = [...new Set(skills)];
  return (
    <div className="profile-section">
      <h3>{title}</h3>
      <div className="skill-chips">
        {unique.length ? (
          unique.map((s, i) => (
            <span key={`${s}-${i}`} className={`chip ${variant}`}>
              {s}
            </span>
          ))
        ) : (
          <span className="chip none">Not listed</span>
        )}
      </div>
    </div>
  );
}
