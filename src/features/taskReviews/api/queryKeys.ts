import type { TaskFilters, TaskId } from "../types";

// Concept: stable queryKey design.
// All cache keys are created in one file so they stay predictable.
export const taskQueryKeys = {
  all: ["tasks"] as const,
  list: (filters: TaskFilters) => ["tasks", "list", filters] as const,
  columnar: (filters: TaskFilters) => ["tasks", "columnar", filters] as const,
  detail: (id: TaskId) => ["tasks", "detail", id] as const,
  // Cached independently — never changes unless the server data changes.
  filterOptions: ["tasks", "filterOptions"] as const,
};



