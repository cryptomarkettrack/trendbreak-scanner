import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";
// Import polyfills for Node.js modules used by ccxt
import "./utils/nodePolyfills";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);
