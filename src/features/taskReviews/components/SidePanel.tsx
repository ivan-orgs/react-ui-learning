import { Button } from "../../../shared/ui/Button";
import { Surface } from "../../../shared/ui/Surface";
import { useReviewUI } from "../context/ReviewUIContext";
import styles from "./SidePanel.module.css";

export function SidePanel() {
  // Concept: context-driven side panel flow.
  // What it means: this component reads and changes UI state stored in ReviewUIContext.
  // Seen in app: Review/Log tabs switch content, and Reset view restores the default tab.
  const { panelTab, setPanelTab, resetUI } = useReviewUI();

  return (
    <Surface title="Review panel">
      <div className={styles.tabs} role="tablist" aria-label="Review panel tabs">
        <Button
          variant={panelTab === "review" ? "primary" : "secondary"}
          onClick={() => setPanelTab("review")}
        >
          Review
        </Button>
        <Button
          variant={panelTab === "log" ? "primary" : "secondary"}
          onClick={() => setPanelTab("log")}
        >
          Log
        </Button>
      </div>
      {/* Concept: aria-live.
          What it means: screen readers can announce this updated content politely.
          Seen in app: switching tabs changes this message. */}
      {panelTab === "review" ? (
        <p aria-live="polite">Review the suggested priority and choose whether evidence is enough.</p>
      ) : (
        <p aria-live="polite">Latest note: owner requested one more check screenshot.</p>
      )}
      <Button variant="ghost" onClick={resetUI}>
        Reset view
      </Button>
    </Surface>
  );
}



