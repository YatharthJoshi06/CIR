import React from "react";
import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// Configure API base URL from environment variable.
// Falls back to "/api" (for local dev with Vite proxy) if not set.
const baseUrl = import.meta.env.VITE_BASE_URL ?? "/api";
setBaseUrl(baseUrl);

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);