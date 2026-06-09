import { useState, type MouseEvent } from "react";
import { Surface, Text } from "../../components/wabi";
import styles from "./EventDelegationPlayground.module.css";

interface DemoTask {
  id: string;
  title: string;
  state: "Open" | "Complete" | "Snoozed" | "Assigned";
}

const initialTasks: DemoTask[] = [
  { id: "TASK-201", title: "Review copy changes", state: "Open" },
  { id: "TASK-202", title: "Check release notes", state: "Open" },
  { id: "TASK-203", title: "Confirm owner sign-off", state: "Open" }
];

export function EventDelegationPlayground() {
  const [tasks, setTasks] = useState(initialTasks);
  const [lastAction, setLastAction] = useState("No delegated action yet.");

  // Concept: event delegation with a React synthetic event.
  // What it means: one parent click handler receives a React MouseEvent from onClick and manages many child buttons by reading data attributes.
  // Seen in app: click Complete, Snooze, or Assign on any row; this single handler reads event.target and updates the right task.
  function handleTaskListClick(event: MouseEvent<HTMLUListElement>) {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-action]");

    if (!button) {
      return;
    }

    const taskId = button.dataset.taskId;
    const action = button.dataset.action as DemoTask["state"] | undefined;

    if (!taskId || !action) {
      return;
    }

    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, state: action } : task))
    );
    setLastAction(`${taskId} changed to ${action} by the parent <ul> handler.`);
  }

  return (
    <Surface title="Event delegation">
      <Text tone="muted">
        Synthetic event example: one React onClick handler is attached to the list, not to each
        button. The handler reads data-task-id and data-action from the clicked button.
      </Text>
      <ul className={styles.list} onClick={handleTaskListClick} aria-label="Delegated task actions">
        {tasks.map((task) => (
          <li key={task.id} className={styles.item}>
            <span>
              <strong>{task.id}</strong> {task.title}
            </span>
            <span className={styles.state}>{task.state}</span>
            <div className={styles.actions}>
              <button data-task-id={task.id} data-action="Complete">
                Complete
              </button>
              <button data-task-id={task.id} data-action="Snoozed">
                Snooze
              </button>
              <button data-task-id={task.id} data-action="Assigned">
                Assign
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p className={styles.log} aria-live="polite">
        {lastAction}
      </p>
    </Surface>
  );
}
