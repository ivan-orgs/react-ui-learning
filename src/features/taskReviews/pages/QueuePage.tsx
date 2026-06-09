import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/ui/Button";
import { PageSkeleton } from "../../../shared/ui/Skeleton";
import { Surface } from "../../../shared/ui/Surface";
import { Text } from "../../../components/wabi";
import { isPriorityLevel, type TaskFilters, type ReviewStatus, type PriorityLevel } from "../types";
import { useTasks, useColumnarTasks } from "../hooks/useTasks";
import { AgTaskGrid, type TaskGridRow } from "../components/AgTaskGrid";
import styles from "./QueuePage.module.css";

type PriorityFilter = "ALL" | PriorityLevel;
type StatusFilter = "ALL" | ReviewStatus;

export default function QueuePage() {
  // Concept: useNavigate.
  // What it means: lets code move the browser to another route.
  // Seen in app: clicking an AG Grid row opens /task/TASK-101.
  const navigate = useNavigate();

  // Concept: useState with string literal unions.
  // What it means: filter state can only contain valid priority/status values.
  // Seen in app: filter buttons change the backend request params.
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  // Concept: backend filter request object.
  // What it means: UI state is converted to params for the API instead of filtering locally.
  // Seen in app: changing filters refetches /tasks with priority/status params.
  const filters = useMemo<TaskFilters>(
    () => ({
      ...(priorityFilter === "ALL" ? {} : { priority: priorityFilter }),
      ...(statusFilter === "ALL" ? {} : { status: statusFilter })
    }),
    [priorityFilter, statusFilter]
  );

  // Concept: custom hooks around React Query.
  // What it means: pages ask for filtered data with a readable hook instead of knowing HTTP details.
  // Seen in app: the queue shows rows returned by the Spring Boot backend for the current filters.
  const { data = [], isLoading, isFetching, isError, error } = useTasks(filters);
  const { data: columnarData } = useColumnarTasks(filters);

  // Concept: useMemo and map().
  // What it means: backend already filtered the rows; React only shapes records for AG Grid.
  // Seen in app: AG Grid receives exactly the rows returned from the API layer.
  const rows = useMemo(() => data.map((record) => record.queueRow), [data]);

  // Concept: useCallback.
  // What it means: keeps the row-click handler stable between renders.
  // Seen in app: AG Grid receives the same kind of callback whenever it needs to open a row.
  const openTask = useCallback(
    (row: TaskGridRow) => {
      // Concept: type narrowing with a type guard.
      // What it means: after isPriorityLevel, TypeScript knows priority is valid.
      // Seen in app: clicking a row safely navigates to its detail URL.
      if (isPriorityLevel(row.priority)) {
        navigate(`/task/${row.id}`);
      }
    },
    [navigate]
  );

  // Concept: loading state and skeleton UI.
  // What it means: show a lightweight placeholder while the first backend request is running.
  // Seen in app: on slow initial loads, the queue shows "Loading task queue".
  if (isLoading) {
    return <PageSkeleton title="Loading task queue" />;
  }

  // Concept: error state and aria role.
  // What it means: failed backend data gets a clear visible message.
  // Seen in app: if the API failed, this message would replace the grid.
  if (isError) {
    return (
      <Surface title="Queue failed to load">
        <p role="alert">{error.message}</p>
      </Surface>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.toolbar}>
        <div>
          <h2>Task queue</h2>
          <p>Click any row to navigate to a detail route.</p>
          {isFetching ? <Text tone="muted">Fetching filtered backend data...</Text> : null}
        </div>
        <div className={styles.actions}>
          {/* Concept: backend-driven filters.
              What it means: buttons update state, state changes query params, and backend returns matching rows.
              Seen in app: combine High priority with Pending/Approved/Rejected. */}
          <Button
            variant={priorityFilter === "ALL" ? "primary" : "secondary"}
            onClick={() => setPriorityFilter("ALL")}
          >
            All priorities
          </Button>
          <Button
            variant={priorityFilter === "HIGH" ? "primary" : "secondary"}
            onClick={() => setPriorityFilter("HIGH")}
          >
            High priority
          </Button>
          <Button
            variant={statusFilter === "ALL" ? "primary" : "secondary"}
            onClick={() => setStatusFilter("ALL")}
          >
            All statuses
          </Button>
          <Button
            variant={statusFilter === "PENDING" ? "primary" : "secondary"}
            onClick={() => setStatusFilter("PENDING")}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === "APPROVED" ? "primary" : "secondary"}
            onClick={() => setStatusFilter("APPROVED")}
          >
            Approved
          </Button>
          <Button
            variant={statusFilter === "REJECTED" ? "primary" : "secondary"}
            onClick={() => setStatusFilter("REJECTED")}
          >
            Rejected
          </Button>
        </div>
      </div>
      {/* Concept: empty state.
          What it means: if the backend returns no rows for a filter combination, show a friendly fallback.
          Seen in app: choose High priority + Approved to see no matching rows. */}
      {rows.length ? (
        <Surface>
          <AgTaskGrid rows={rows} onOpen={openTask} />
          {/* Concept: optional chaining and nullish coalescing.
              What it means: safely read nested data and show fallback text if it is missing.
              Seen in app: this line updates with the current backend-filtered result. */}
          <Text tone="muted">
            Backend returned {rows.length} row(s). Columnar wrapper sample: first owner is{" "}
            {columnarData?.rows[0]?.getStringValue("owner") ?? "not loaded yet"}.
          </Text>
        </Surface>
      ) : (
        <Surface title="No rows">
          <p>No tasks match the selected backend filters.</p>
        </Surface>
      )}
    </section>
  );
}



