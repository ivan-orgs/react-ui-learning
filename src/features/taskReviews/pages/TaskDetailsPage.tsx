import { Link, useParams } from "react-router-dom";
import { KeyValuePair } from "../../../shared/ui/KeyValuePair";
import { PageSkeleton } from "../../../shared/ui/Skeleton";
import { Surface } from "../../../shared/ui/Surface";
import { Button, Text } from "../../../components/wabi";
import { Time } from "../../../components/sabi";
import { useDocumentTitle } from "../../../shared/hooks/useDocumentTitle";
import { TaskProvider, useTaskContext } from "../context/TaskContext";
import { ReviewUIProvider, useReviewUI } from "../context/ReviewUIContext";
import { useTask } from "../hooks/useTasks";
import { saveTaskReview } from "../api/taskApi";
import { ShowMore } from "../components/ShowMore";
import { SidePanel } from "../components/SidePanel";
import { ChecksTable } from "../components/ChecksTable";
import { SuggestedPriorityEmptyState } from "../components/SuggestedPriorityEmptyState";
import { CheckCoverageWidget } from "../widgets/CheckCoverageWidget";
import { PriorityWidget } from "../widgets/PriorityWidget";
import { ConfidenceWidget } from "../widgets/ConfidenceWidget";
import type { TaskId } from "../types";
import styles from "./TaskDetailsPage.module.css";

export default function TaskDetailsPage() {
  // Concept: useParams and destructuring.
  // What it means: React Router gives route variables from the URL.
  // Seen in app: /task/TASK-101 makes taskId equal "TASK-101".
  const params = useParams();
  const taskId = params.taskId as TaskId;

  // Concept: route-specific data derivation.
  // What it means: the detail page asks for one record by id, but the hook can reuse cached queue data.
  // Seen in app: click a queue row, and detail data appears without a separate mock endpoint.
  const { data, isLoading, isError, error } = useTask(taskId);

  // Concept: custom useEffect hook for DOM side effects.
  // What it means: this updates document.title when the page changes.
  // Seen in app: browser tab title changes to the task id.
  useDocumentTitle(`Task ${taskId}`);

  if (isLoading) {
    return <PageSkeleton title="Loading task detail" />;
  }

  if (isError || !data) {
    return (
      <Surface title="Task failed to load">
        <p role="alert">{error?.message ?? "No task was returned."}</p>
        <Link to="/">Back to queue</Link>
      </Surface>
    );
  }

  return (
    // Concept: JSX boolean props.
    // What it means: loading={isLoading} passes a real boolean value; loading="true" would pass the string "true".
    // Seen in app: TaskProvider receives loading as true/false and the detail section uses it for aria-busy.
    // Concept: nested context providers.
    // What it means: the page provides data context and UI coordination context to all children.
    // Seen in app: widgets and side panel read shared state without prop drilling.
    <TaskProvider task={data} loading={isLoading} error={error}>
      <ReviewUIProvider>
        <TaskContent />
      </ReviewUIProvider>
    </TaskProvider>
  );
}

function TaskContent() {
  // Concept: useContext consumer hook.
  // What it means: read task data from the nearest TaskProvider.
  // Seen in app: widgets can display the same task without receiving props manually.
  const { task, loading, error } = useTaskContext();
  const { openSection, setOpenSection } = useReviewUI();

  // Concept: async/await, try/catch-ready API flow, and http.post.
  // What it means: clicking the button sends a write-style request through axios.
  // Seen in app: "Save approved review" triggers the mock POST and global loader.
  async function approve() {
    await saveTaskReview({
      id: task.id,
      review: "APPROVED",
      note: "Approved from the learning app."
    });
  }

  return (
    // Concept: aria-busy.
    // What it means: tells assistive technology this region is connected to loading state.
    // Seen in app: the detail section marks itself busy while data is loading.
    <section className={styles.page} aria-busy={loading}>
      {/* Concept: Link navigation.
          What it means: Link changes routes without doing a full browser page reload.
          Seen in app: this returns from /task/TASK-101 to the queue route. */}
      <Link to="/">Back to queue</Link>
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Task detail</p>
          <h2>{task.id}</h2>
        </div>
        <span>Status: {task.status}</span>
      </div>
      {error ? <Text tone="danger">{error.message}</Text> : null}
      {/* Concept: description list and reusable KeyValuePair.
          What it means: labels and values are semantic detail data.
          Seen in app: team, owner, and updated date appear under the heading. */}
      <dl className={styles.pairs}>
        <KeyValuePair label="Team" value={task.detailPairs[0][1]} />
        <KeyValuePair label="Owner" value={task.detailPairs[1][1]} />
        <KeyValuePair label="Updated" value={<Time value={task.updatedAt} />} />
      </dl>
      <div className={styles.layout}>
        <div className={styles.content}>
          {/* Concept: widget pattern.
              What it means: each domain block owns one small part of the page.
              Seen in app: three independent cards show priority/check information. */}
          <div className={styles.widgets}>
            <PriorityWidget />
            <ConfidenceWidget />
            <CheckCoverageWidget />
          </div>
          <Surface title="Suggested priority">
            {/* Concept: fallback rendering and empty state.
                What it means: missing suggested values show a purposeful message.
                Seen in app: TASK-102 has no suggested priority and shows the empty state. */}
            {task.suggestedPriority === "Not available" ? (
              <SuggestedPriorityEmptyState />
            ) : (
              <Text>{task.suggestedPriority}</Text>
            )}
          </Surface>
          <Surface title="Summary">
            <ShowMore text={task.summary} />
          </Surface>
          <Surface title="Checks">
            <div className={styles.sectionButtons}>
              {/* Concept: shared UI flow state.
                  What it means: these buttons update context state used by sibling UI.
                  Seen in app: switch between Priority notes and Check list. */}
              <button onClick={() => setOpenSection("priority")}>Priority notes</button>
              <button onClick={() => setOpenSection("checks")}>Check list</button>
            </div>
            {openSection === "checks" ? (
              <ChecksTable checks={task.checks} />
            ) : (
              <p>Open section: priority notes. This state is shared through context.</p>
            )}
          </Surface>
          <Button variant="primary" onClick={approve}>
            Save approved review
          </Button>
        </div>
        <aside>
          <SidePanel />
        </aside>
      </div>
    </section>
  );
}




