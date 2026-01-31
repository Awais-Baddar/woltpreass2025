import { useEffect, useState } from "react";
import { DopcPage } from "./pages/DopcPage";
import "./styles/theme.css";

function getInitialDarkMode() {
  // Safe for tests + browsers
  if (typeof window === "undefined") return false;
  if (typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function ThemeToggle() {
  const [dark, setDark] = useState(getInitialDarkMode());

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  return (
    <button
      className="themeToggle"
      type="button"
      onClick={() => setDark((v) => !v)}
      aria-label="Toggle theme"
    >
      {dark ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}

export default function App() {
  return (
    <div className="app">
      <header className="hero">
        <ThemeToggle />
        <div className="shell heroLayout">
          <div className="heroGlass">
            <h1 className="heroTitle">Delivery Order Price Calculator</h1>
            <p className="heroSubtitle">
              Calculate delivery fees, distance and total price using venue data
              from the Home Assignment API.
            </p>
          </div>
          <img className="heroImage" src="/hero.webp" alt="" />
        </div>
      </header>

      {/* IMPORTANT: main className for spacing */}
      <main className="main">
        <DopcPage />
      </main>
    </div>
  );
}
