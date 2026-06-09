// Concept: template literal type.
// What it means: only strings shaped like TASK-101 are valid TaskId values.
// Seen in app: route URLs and grid rows use ids such as /task/TASK-101.
export type TaskId = `TASK-${number}`;

// Concept: string literal unions.
// What it means: these variables can only be one of the listed strings.
// Seen in app: badges only accept LOW/MEDIUM/HIGH and APPROVED/PENDING/REJECTED states.
export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH";
export type ReviewStatus = "APPROVED" | "PENDING" | "REJECTED";

// Concept: backend filter DTO.
// What it means: UI filter state is converted into request params sent to the API layer.
// Seen in app: changing queue filters sends /tasks params to the Spring Boot backend.
export interface TaskFilters {
  priority?: PriorityLevel;
  status?: ReviewStatus;
}

// Concept: interface.
// What it means: describes the shape of a raw API row.
// Seen in app: Spring Boot task rows must match this shape before the UI can use them.
export interface ApiTaskRow {
  id: TaskId;
  team: string;
  owner: string;
  priority: PriorityLevel;
  confidence: PriorityLevel | null;
  suggestedPriority?: PriorityLevel | null;
  status: ReviewStatus;
  summary: string;
  checks: Array<{
    name: string;
    complete: boolean;
  }>;
  updatedAt: string;
}

export interface ApiTaskResponse {
  headers: readonly string[];
  rows: ApiTaskRow[];
}

// Concept: type guard and type narrowing.
// What it means: after this function returns true, TypeScript knows value is a PriorityLevel.
// Seen in app: QueuePage checks the row priority before navigating from AG Grid.
export function isPriorityLevel(value: unknown): value is PriorityLevel {
  return value === "LOW" || value === "MEDIUM" || value === "HIGH";
}




