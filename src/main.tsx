import React from "react";
import ReactDOM from "react-dom/client";
import { FinanceApp } from "./FinanceApp";
import { LanguageProvider } from "./LanguageContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LanguageProvider>
      {" "}
      <FinanceApp />
    </LanguageProvider>
  </React.StrictMode>,
);
