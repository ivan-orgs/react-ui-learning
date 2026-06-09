import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

// Concept: type alias for UI state.
// What it means: panelTab can only be review or log.
// Seen in app: the side panel has exactly those two tabs.
type PanelTab = "review" | "log";

interface ReviewUIContextValue {
  openSection: string;
  panelTab: PanelTab;
  setOpenSection: (section: string) => void;
  setPanelTab: (tab: PanelTab) => void;
  resetUI: () => void;
}

// Concept: shared UI state context.
// What it means: sibling components can coordinate without passing props up and down.
// Seen in app: detail checks and side panel share reset/open-section behavior.
const ReviewUIContext = createContext<ReviewUIContextValue | null>(null);

export function ReviewUIProvider({ children }: { children: ReactNode }) {
  const [openSection, setOpenSection] = useState("priority");
  const [panelTab, setPanelTab] = useState<PanelTab>("review");

  // Concept: useCallback for stable reset handlers.
  // What it means: resetUI keeps the same identity unless dependencies change.
  // Seen in app: clicking Reset view restores priority section and review tab.
  const resetUI = useCallback(() => {
    setOpenSection("priority");
    setPanelTab("review");
  }, []);

  return (
    <ReviewUIContext.Provider
      value={{ openSection, panelTab, setOpenSection, setPanelTab, resetUI }}
    >
      {children}
    </ReviewUIContext.Provider>
  );
}

export function useReviewUI() {
  const value = useContext(ReviewUIContext);

  if (!value) {
    throw new Error("useReviewUI must be used inside ReviewUIProvider");
  }

  return value;
}



