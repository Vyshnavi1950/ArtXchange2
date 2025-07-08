// src/components/AdminSidebar.jsx
import { NavLink } from "react-router-dom";
import "../styles/Admin.css";

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <h2>Admin</h2>

      <nav className="admin-nav">
        <NavLink to="/admin/dashboard">Dashboard</NavLink>
        <NavLink to="/admin/users">Users</NavLink>
        <NavLink to="/admin/sessions">Sessions</NavLink>
        <NavLink to="/admin/reports">Reports</NavLink>
      </nav>
    </aside>
  );
}
