import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ConfigNeeded from "./components/ConfigNeeded";
import "./index.css";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {apiKey ? <App /> : <ConfigNeeded />}
  </React.StrictMode>
);
