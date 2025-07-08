import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../utils/api";
import "../../styles/Admin.css";

export default function UsersList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/admin/users").then(res => setUsers(res.data));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await api.delete(`/admin/users/${id}`);
    setUsers((u) => u.filter((x) => x._id !== id));
  };

  return (
    <AdminLayout>
      <section className="admin-card">
        <h3>All Users</h3>

        <div className="admin-search">
          {/* optional search UI */}
          <input placeholder="Search by name / email…" />
          <button>Search</button>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className="admin-pill">
                    {u.isAdmin ? "Admin" : "Artist"}
                  </span>
                </td>
                <td>
                  <button
                    className="admin-btn danger"
                    onClick={() => handleDelete(u._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminLayout>
  );
}
