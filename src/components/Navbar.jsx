// src/components/Navbar.jsx
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/Navbar.css";

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    window.location.reload(); // optional
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">ArtXchange</Link>

      <div className="links">
        {isAuthenticated ? (
          <>
            <Link to="/explore">Explore</Link>
            <Link to="/match">Match</Link>
            <Link to="/schedule">Schedule</Link>
            <Link to="/profile">Profile</Link>

            {/* 👇 Admin-only links */}
            {isAdmin && (
              <>
                <Link to="/admin/dashboard">Admin</Link>
                <Link to="/admin/users">Users</Link>
                <Link to="/admin/reports">Reports</Link>
                <Link to="/admin/sessions">Sessions</Link>
              </>
            )}

            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
