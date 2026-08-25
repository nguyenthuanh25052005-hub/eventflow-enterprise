import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

import "./styles/app.css";
import "./styles/public.css";
import "./styles/public-enhancements.css";
import "./styles/customer.css";
import "./styles/customer-workflow.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
