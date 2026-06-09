import { NavLink } from "react-router-dom";
import styles from "./AppHeader.module.css";

export function AppHeader() {
  return (
    // Concept: semantic HTML header.
    // What it means: <header> marks top-level page branding/navigation for people and tools.
    // Seen in app: this is the top bar on every route.
    <header className={styles.header}>
      <div>
        <p className={styles.eyebrow}>React UI Learning Lab</p>
        <h1>Priority task workspace</h1>
      </div>
      {/* Concept: semantic nav and NavLink.
          What it means: <nav> identifies navigation, and NavLink marks the active page.
          Seen in app: Queue or Concepts becomes highlighted based on current URL. */}
      <nav className={styles.nav} aria-label="Main navigation">
        <NavLink to="/">Queue</NavLink>
        <NavLink to="/concepts">Concepts</NavLink>
      </nav>
    </header>
  );
}


