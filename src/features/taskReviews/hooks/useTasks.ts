import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTasks, fetchFilterOptions } from "../api/taskApi";
import { taskQueryKeys } from "../api/queryKeys";
import { TaskReviewRecord } from "../model/TaskReviewRecord";
import { ColumnarTaskData } from "../model/ColumnarTaskData";
import type { TaskFilters, TaskId } from "../types";

export function useTasks(filters: TaskFilters = {}) {
  // Concept: useQuery with backend filters in the key.
  // What it means: when filters change, React Query treats it as a new backend request/cache entry.
  // Seen in app: selecting High priority or Approved refetches /tasks with params.
  return useQuery({
    queryKey: taskQueryKeys.list(filters),
    queryFn: () => fetchTasks(filters),
    // Concept: select transforms server data for UI.
    // What it means: raw rows become wrapper objects before components receive them.
    // Seen in app: QueuePage uses record.queueRow instead of raw API fields.
    select: (data) => data.rows.map((row) => new TaskReviewRecord(row))
  });
}

export function useColumnarTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: taskQueryKeys.columnar(filters),
    queryFn: () => fetchTasks(filters),
    // Concept: fetch once, derive multiple views.
    // What it means: the same filtered endpoint can power both normal rows and columnar wrapper examples.
    // Seen in app: QueuePage shows the first owner from the backend-filtered ColumnarTaskData.
    select: (data) => new ColumnarTaskData(data)
  });
}

export function useTask(id: TaskId) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: taskQueryKeys.detail(id),
    queryFn: async () => {
      // Concept: ensureQueryData.
      // What it means: reuse cached unfiltered queue data if available, otherwise fetch it once.
      // Seen in app: detail pages derive one row from the task list.
      const data = await queryClient.ensureQueryData({
        queryKey: taskQueryKeys.list({}),
        queryFn: () => fetchTasks({})
      });
      const row = data.rows.find((item) => item.id === id);

      if (!row) {
        throw new Error(`Task ${id} was not found`);
      }

      return new TaskReviewRecord(row);
    }
  });
}

// Concept: server-driven filter options hook.
// What it means: calls GET /tasks/filters once on mount and caches the result permanently
// for the session (staleTime: Infinity). QueuePage uses this to populate filter dropdowns
// with the actual priority/status values that exist in the backend data.
export function useFilterOptions() {
  return useQuery({
    queryKey: taskQueryKeys.filterOptions,
    queryFn: fetchFilterOptions,
    staleTime: Infinity,
  });
}



