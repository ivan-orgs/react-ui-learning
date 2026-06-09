import type { TaskFilters, TaskId } from "../types";

// Concept: stable queryKey design.
// What it means: all cache keys are created in one file so they stay predictable.
// Seen in app: queue filters become part of the cache key, so each backend-filtered result is cached separately.
export const taskQueryKeys = {
  all: ["tasks"] as const,
  list: (filters: TaskFilters) => ["tasks", "list", filters] as const,
  columnar: (filters: TaskFilters) => ["tasks", "columnar", filters] as const,
  detail: (id: TaskId) => ["tasks", "detail", id] as const
};



