import { MetricWidget } from "../components/MetricWidget";
import { useTaskContext } from "../context/TaskContext";

export function ConfidenceWidget() {
  // Concept: isolated widget.
  // What it means: delivery confidence can change internally without rewriting the whole detail page.
  // Seen in app: the second detail card shows delivery confidence.
  const { task } = useTaskContext();

  return (
    <MetricWidget
      title="Delivery confidence"
      value={task.queueRow.confidence}
      helpText="Confidence in completing the task smoothly."
    />
  );
}





