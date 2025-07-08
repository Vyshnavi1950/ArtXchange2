// frontend/myapp/src/components/SplashScreen.jsx
import React, { useEffect, useState } from "react";
import "../styles/SplashScreen.css";

export default function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 2500); // 2.5 sec
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="splash-screen">
      <img src="/logo.png" alt="ArtXchange Logo" />
      <h1>Welcome to ArtXchange</h1>
    </div>
  );
}
