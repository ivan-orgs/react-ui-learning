import { Surface } from "../../../shared/ui/Surface";
import { useTaskContext } from "../context/TaskContext";

export function CheckCoverageWidget() {
  const { task } = useTaskContext();

  // Concept: reduce/filter-style derived data.
  // What it means: calculate a display number from an array of checks.
  // Seen in app: the check environment card shows complete checks over total checks.
  const completeChecks = task.checks.filter((check) => check.complete).length;

  return (
    <Surface title="Check environment">
      <strong>
        {completeChecks} / {task.checks.length}
      </strong>
      <p>Complete checks in this task.</p>
    </Surface>
  );
}



