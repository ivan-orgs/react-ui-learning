import { createContext, useContext, type ReactNode } from "react";
import type { TaskReviewRecord } from "../model/TaskReviewRecord";

interface TaskContextValue {
  task: TaskReviewRecord;
  loading: boolean;
  error: Error | null;
}

// Concept: createContext.
// What it means: creates a shared data channel for components below the provider.
// Seen in app: widgets read the task without props being passed through every layer.
const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({
  task,
  loading = false,
  error = null,
  children
}: {
  task: TaskReviewRecord;
  loading?: boolean;
  error?: Error | null;
  children: ReactNode;
}) {
  return (
    // Concept: Context Provider.
    // What it means: all children can consume task, loading, and error state.
    // Seen in app: detail widgets and side content all agree on the selected task.
    <TaskContext.Provider value={{ task, loading, error }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  // Concept: Context Consumer through a custom hook.
  // What it means: components call one hook instead of importing the raw context everywhere.
  // Seen in app: PriorityWidget calls this to read current task data.
  const value = useContext(TaskContext);

  if (!value) {
    throw new Error("useTaskContext must be used inside TaskProvider");
  }

  return value;
}



