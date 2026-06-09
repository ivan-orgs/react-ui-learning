import { normalizeLabel } from "../../../shared/utils/format";
import type { ReviewStatus, PriorityLevel } from "../types";
import styles from "./PriorityBadge.module.css";

type BadgeTone = PriorityLevel | ReviewStatus | "EMPTY";

export function PriorityBadge({ value }: { value: BadgeTone | string }) {
  // Concept: fallback rendering.
  // What it means: unknown values use the EMPTY style instead of breaking the UI.
  // Seen in app: "Not available" appears as a neutral badge.
  const tone = value in styles ? value : "EMPTY";

  // Concept: derived display label.
  // What it means: API-style labels like PENDING become user-friendly text.
  // Seen in app: grid cells show "Pending" instead of "PENDING".
  return <span className={`${styles.badge} ${styles[tone]}`}>{normalizeLabel(value)}</span>;
}



