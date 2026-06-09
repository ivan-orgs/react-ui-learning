import { Outlet } from "react-router-dom";
import { AppHeader } from "./components/sabi";
import { ErrorBoundary } from "./shared/errors/ErrorBoundary";
import { GlobalLoader } from "./shared/loading/GlobalLoader";
import styles from "./App.module.css";

export function App() {
  return (
    <div className={styles.shell}>
      {/* Concept: reusable app header and semantic layout.
          What it means: this is the shared UI for the layout route: header/nav at the top, routed content in main, and footer at the bottom.
          Seen in app: the top navigation and footer stay visible while Queue, Task detail, and Concepts change. */}
      <AppHeader />
      <GlobalLoader />
      <main className={styles.main}>
        {/* Concept: component ErrorBoundary.
            What it means: runtime component errors show a fallback instead of crashing the whole app.
            Seen in app: page content is protected while header/footer remain. */}
        <ErrorBoundary>
          {/* Concept: Outlet.
              What it means: child routes render here inside the parent layout route.
              Seen in app: Queue and Concepts appear in this main area. */}
          <Outlet />
        </ErrorBoundary>
      </main>
      {/* Concept: shared footer in a layout route.
          What it means: every child route gets the same footer because App wraps them all.
          Seen in app: navigating between pages changes the Outlet content, not this footer. */}
      <footer className={styles.footer}>Built for reading code first, then experimenting.</footer>
    </div>
  );
}


