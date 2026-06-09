import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface LoaderContextValue {
  activeRequests: number;
  beginLoading: () => void;
  endLoading: () => void;
}

// Concept: cross-cutting concern.
// What it means: loading state is not owned by one page; it is shared by HTTP and layout.
// Seen in app: the dark global loader line changes when axios requests run.
const LoaderContext = createContext<LoaderContextValue | null>(null);

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [activeRequests, setActiveRequests] = useState(0);

  // Concept: useMemo for context values.
  // What it means: avoid creating a new object unless activeRequests changes.
  // Seen in app: GlobalLoader reads this value without prop drilling.
  const value = useMemo<LoaderContextValue>(
    () => ({
      activeRequests,
      beginLoading: () => setActiveRequests((count) => count + 1),
      endLoading: () => setActiveRequests((count) => Math.max(0, count - 1))
    }),
    [activeRequests]
  );

  return <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>;
}

export function useLoader() {
  const value = useContext(LoaderContext);

  if (!value) {
    throw new Error("useLoader must be used inside LoaderProvider");
  }

  return value;
}


