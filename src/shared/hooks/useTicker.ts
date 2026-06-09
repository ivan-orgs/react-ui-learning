import { useEffect, useState } from "react";

// Concept: custom hook naming.
// What it means: hooks are just functions that start with "use".
// Rules: call hooks at the top of the component or custom hook; never inside if blocks, loops, or nested functions.
// Seen in app: useTicker is called inside ConceptsPage like any other hook.
export function useTicker() {
  const [now, setNow] = useState(() => new Date());

  // Concept: useEffect for timers and cleanup.
  // What it means: start a timer after render, then clean it up when the component unmounts.
  // Seen in app: /concepts time updates once per second without leaking timers.
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(id);
  }, []);

  return now;
}


