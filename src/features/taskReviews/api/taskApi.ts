import { http } from "../../../shared/api/httpClient";
import type {
  ApiTaskResponse,
  TaskFilters,
  TaskId,
  ReviewStatus
} from "../types";

// Concept: API request function with backend filters.
// What it means: filter values are sent as request params instead of filtering only in React.
// Seen in app: QueuePage changes priority/status filters, and this function calls /tasks with params.
export async function fetchTasks(filters: TaskFilters = {}) {
  const response = await http.get<ApiTaskResponse>("/tasks", { params: filters });
  return response.data;
}

// Concept: http.post for write actions.
// What it means: POST sends a payload to create/update something.
// Seen in app: click "Save approved review" on a detail page.
export async function saveTaskReview(input: {
  id: TaskId;
  review: ReviewStatus;
  note: string;
}) {
  const response = await http.post<{ saved: boolean }>("/reviews", input);
  return response.data;
}



