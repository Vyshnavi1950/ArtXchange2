import { useEffect, useState } from "react";
import api from "../../utils/api";
import "../../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    if (tab === "users") {
      api.get("/admin/users").then((r) => setUsers(r.data));
    } else {
      api.get("/admin/matches").then((r) => setMatches(r.data));
    }
  }, [tab]);

  /* actions */
  const flipAdmin = async (id) => {
    const { data } = await api.patch(`/admin/users/${id}/admin`);
    setUsers((u) => u.map((usr) => (usr._id === id ? data : usr)));
  };
  const deleteUser = async (id) => {
    if (!confirm("Delete user?")) return;
    await api.delete(`/admin/users/${id}`);
    setUsers((u) => u.filter((usr) => usr._id !== id));
  };
  const deleteMatch = async (id) => {
    if (!confirm("Delete match?")) return;
    await api.delete(`/admin/matches/${id}`);
    setMatches((m) => m.filter((mt) => mt._id !== id));
  };

  return (
    <div className="admin-wrapper">
      <h1>Admin Dashboard</h1>
      <nav>
        <button onClick={() => setTab("users")}   className={tab==="users"?"active":""}>Users</button>
        <button onClick={() => setTab("matches")} className={tab==="matches"?"active":""}>Matches</button>
      </nav>

      {tab === "users" ? (
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Admin</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.isAdmin ? "Yes" : "No"}</td>
                <td>
                  <button onClick={() => flipAdmin(u._id)}>Toggle Admin</button>
                  <button onClick={() => deleteUser(u._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table>
          <thead><tr><th>Participants</th><th>Skill</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {matches.map((m) => (
              <tr key={m._id}>
                <td>{m.participants.join(", ")}</td>
                <td>{m.skill}</td>
                <td>{m.status}</td>
                <td><button onClick={() => deleteMatch(m._id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
