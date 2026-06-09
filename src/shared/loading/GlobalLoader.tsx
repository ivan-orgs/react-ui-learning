import { useLoader } from "./LoaderContext";
import styles from "./GlobalLoader.module.css";

export function GlobalLoader() {
  const { activeRequests } = useLoader();

  return (
    <div className={styles.loader} aria-live="polite">
      {activeRequests > 0 ? `Network requests running: ${activeRequests}` : "Network idle"}
    </div>
  );
}


