/*  src/App.jsx  */
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

/* layout */
import SplashScreen from "./components/SplashScreen";
import Navbar       from "./components/Navbar";
import Background   from "./components/Background";

/* public pages */
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

/* protected pages */
import Home        from "./pages/Home";
import Explore     from "./pages/Explore";
import Match       from "./pages/Match";
import Schedule    from "./pages/Schedule";
import Profile     from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import CallRoom    from "./pages/CallRoom";
import ChatRoom    from "./pages/ChatRoom";

/* admin pages */
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersList      from "./pages/admin/UsersList";
import ReportsPage    from "./pages/admin/ReportsPage";
import SessionsList   from "./pages/admin/SessionsList";

export default function App() {
  const { isAuthenticated, isAdmin, ready } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  // Splash delay after auth ready
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(t);
  }, [ready]);

  if (showSplash) return <SplashScreen />;

  // Route guards
  const Private = ({ children }) =>
    isAuthenticated ? children : <Navigate to="/login" replace />;

  const PublicOnly = ({ children }) =>
    !isAuthenticated ? children : <Navigate to="/" replace />;

  const AdminOnly = ({ children }) =>
    isAuthenticated && isAdmin ? children : <Navigate to="/" replace />;

  return (
    <>
      <Background />
      {isAuthenticated && ready && <Navbar />}

      <Routes>
        {/* Public-only routes */}
        <Route path="/login"    element={<PublicOnly><Login /></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
        <Route path="/forgot"   element={<PublicOnly><ForgotPassword /></PublicOnly>} />

        {/* Authenticated routes */}
        <Route path="/"             element={<Private><Home /></Private>} />
        <Route path="/explore"      element={<Private><Explore /></Private>} />
        <Route path="/match"        element={<Private><Match /></Private>} />
        <Route path="/schedule"     element={<Private><Schedule /></Private>} />
        <Route path="/profile"      element={<Private><Profile /></Private>} />
        <Route path="/profile/:id"  element={<Private><Profile /></Private>} />
        <Route path="/profile/edit" element={<Private><EditProfile /></Private>} />
        <Route path="/call/:room"   element={<Private><CallRoom /></Private>} />
        <Route path="/chat/:partnerId" element={<Private><ChatRoom /></Private>} />

        {/* Admin-only routes */}
        <Route path="/admin/dashboard" element={<AdminOnly><AdminDashboard /></AdminOnly>} />
        <Route path="/admin/users"     element={<AdminOnly><UsersList /></AdminOnly>} />
        <Route path="/admin/reports"   element={<AdminOnly><ReportsPage /></AdminOnly>} />
        <Route path="/admin/sessions"  element={<AdminOnly><SessionsList /></AdminOnly>} />

        {/* Fallback route */}
        <Route
          path="*"
          element={
            isAuthenticated
              ? <Navigate to="/" replace />
              : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </>
  );
}
