import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./context/AuthContext";
import { Toaster } from "react-hot-toast";       // ✅ import Toaster
import "./styles/App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <>
        <App />
        <Toaster position="top-center" />        {/* ✅ add this */}
      </>
    </AuthProvider>
  </BrowserRouter>
);
