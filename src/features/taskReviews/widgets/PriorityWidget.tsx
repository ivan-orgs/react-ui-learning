import { MetricWidget } from "../components/MetricWidget";
import { useTaskContext } from "../context/TaskContext";

export function PriorityWidget() {
  // Concept: domain-driven widget.
  // What it means: this component owns one business idea, task priority.
  // Seen in app: the first card on detail page shows priority assigned to the task.
  const { task } = useTaskContext();

  return (
    <MetricWidget
      title="Priority"
      value={task.queueRow.priority}
      helpText="Current task priority."
    />
  );
}





