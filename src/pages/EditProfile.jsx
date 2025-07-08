import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { setUser as cacheUser } from "../utils/auth";
import "../styles/ProfileEdit.css";

/* Master list of skills */
const ALL_SKILLS = [
  "Watercolor", "Acrylic", "Embroidery", "Calligraphy",
  "Charcoal Sketching", "Digital Art", "Resin Art", "Mandala Art",
];

// Dynamic image helper
const safe = (s) =>
  s?.startsWith("http") ? s : `${api.defaults.baseURL?.replace("/api", "")}${s || ""}`;

export default function EditProfile() {
  const nav = useNavigate();

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [teach, setTeach] = useState([]);
  const [learn, setLearn] = useState([]);

  useEffect(() => {
    api
      .get("/users/me")
      .then(({ data }) => {
        setUser(data);
        setName(data.name || "");
        setBio(data.bio || "");
        setTeach(data.skillsOffered || []);
        setLearn(data.skillsNeeded || []);
      })
      .catch(() => {
        alert("Failed to load profile. Please log in again.");
        nav("/login");
      });
  }, [nav]);

  const toggle = (setter) => (skill) =>
    setter((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("bio", bio.trim());
    if (avatarFile) fd.append("avatar", avatarFile);
    fd.append("skillsOffered", teach.join(","));
    fd.append("skillsNeeded", learn.join(","));

    try {
      const { data } = await api.put("/users/me", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      cacheUser(data);
      alert("Profile updated!");
      nav("/profile");
    } catch (err) {
      console.error("Update error:", err);
      alert("Update failed");
    }
  };

  if (!user) return <p className="loading">Loading…</p>;

  return (
    <div className="edit-wrapper">
      <form className="edit-card" onSubmit={submit}>
        <h2>Edit Profile</h2>

        <input
          type="text"
          className="name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Display name"
          required
        />

        <textarea
          className="bio-input"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Your bio (optional)"
        />

        <label className="avatar-edit-wrapper">
          <img
            className="edit-avatar"
            src={
              avatarFile
                ? URL.createObjectURL(avatarFile)
                : user.avatar
                ? safe(user.avatar)
                : "/creators/placeholder.jpg"
            }
            alt="avatar preview"
          />
          <input
            type="file"
            name="avatar"
            accept="image/*"
            hidden
            onChange={(e) => setAvatarFile(e.target.files[0])}
          />
        </label>

        <h3>Skills I Teach</h3>
        <div className="skills-list">
          {ALL_SKILLS.map((s) => (
            <span
              key={s}
              className={teach.includes(s) ? "skill selected" : "skill"}
              onClick={() => toggle(setTeach)(s)}
            >
              {s}
            </span>
          ))}
        </div>

        <h3 style={{ marginTop: 24 }}>Skills I Want to Learn</h3>
        <div className="skills-list">
          {ALL_SKILLS.map((s) => (
            <span
              key={s}
              className={learn.includes(s) ? "skill selected learn" : "skill"}
              onClick={() => toggle(setLearn)(s)}
            >
              {s}
            </span>
          ))}
        </div>

        <button type="submit" style={{ marginTop: 28 }}>
          Save Changes
        </button>
      </form>
    </div>
  );
}
