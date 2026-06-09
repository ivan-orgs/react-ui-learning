import { displayValue } from "../../../shared/utils/format";
import type { ApiTaskRow, PriorityLevel } from "../types";

// Concept: data access wrapper class.
// What it means: components use friendly methods/getters instead of raw API details.
// Seen in app: QueuePage reads record.queueRow and detail widgets read task.suggestedPriority.
export class TaskReviewRecord {
  constructor(private readonly row: ApiTaskRow) {}

  get id() {
    return this.row.id;
  }

  get summary() {
    return this.row.summary;
  }

  get checks() {
    return this.row.checks;
  }

  get updatedAt() {
    return this.row.updatedAt;
  }

  get status() {
    return this.row.status;
  }

  // Concept: grid row shaping.
  // What it means: convert domain data into the exact fields a grid needs.
  // Seen in app: AG Grid receives queueRow objects as rowData.
  get queueRow() {
    return {
      id: this.row.id,
      team: this.row.team,
      owner: this.row.owner,
      priority: this.row.priority,
      confidence: this.displayMetric(this.row.confidence),
      status: this.row.status
    };
  }

  // Concept: derived display values.
  // What it means: format raw data once instead of repeating formatting in components.
  // Seen in app: detail page shows labeled team, owner, and date.
  get detailPairs() {
    return [
      ["Team", this.row.team],
      ["Owner", this.row.owner],
      ["Updated", new Intl.DateTimeFormat("en-IN").format(new Date(this.row.updatedAt))]
    ] as const;
  }

  // Concept: fallback display pattern.
  // What it means: null/undefined values become readable UI text.
  // Seen in app: missing confidence/suggested priority shows "Not available".
  displayMetric(value: PriorityLevel | null | undefined) {
    return displayValue(value);
  }

  get suggestedPriority() {
    return this.displayMetric(this.row.suggestedPriority);
  }
}




