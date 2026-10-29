import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/app.css";

if (!import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
  document.getElementById("root").innerHTML =
    '<div style="max-width:480px;margin:80px auto;font-family:system-ui;text-align:center">' +
    '<h1 style="color:#c00">Configuration Error</h1>' +
    "<p>VITE_API_URL was not set at build time. Rebuild with the correct backend URL.</p></div>";
} else {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
