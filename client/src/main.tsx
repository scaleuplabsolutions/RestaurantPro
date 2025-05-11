import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Helmet, HelmetProvider } from "react-helmet-async";

// PWA support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch((error) => {
      console.log("Service worker registration failed:", error);
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <Helmet>
      <meta name="theme-color" content="#8D4E00" />
      <meta name="application-name" content="Paul's Restaurant" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Paul's Restaurant" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-TileColor" content="#8D4E00" />
    </Helmet>
    <App />
  </HelmetProvider>
);
