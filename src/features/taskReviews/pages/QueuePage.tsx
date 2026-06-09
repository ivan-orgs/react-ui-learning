import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageSkeleton } from "../../../shared/ui/Skeleton";
import { Surface } from "../../../shared/ui/Surface";
import { Text } from "../../../components/wabi";
import { isPriorityLevel, type TaskFilters, type ReviewStatus, type PriorityLevel } from "../types";
import { useTasks, useColumnarTasks, useFilterOptions } from "../hooks/useTasks";
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
  // Seen in app: filter dropdowns change the backend request params.
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  // Concept: server-driven filter options.
  // What it means: GET /tasks/filters is called once on mount and cached permanently.
  // The dropdown option lists come entirely from the backend, not from hard-coded arrays.
  const { data: filterOptions, isLoading: filtersLoading } = useFilterOptions();

  // Concept: backend filter request object.
  // What it means: UI state is converted to params for the API instead of filtering locally.
  // Seen in app: changing filters refetches /tasks with priority/status params.
  const filters = useMemo<TaskFilters>(
    () => ({
      ...(priorityFilter === "ALL" ? {} : { priority: priorityFilter }),
      ...(statusFilter === "ALL" ? {} : { status: statusFilter }),
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
  if (isLoading || filtersLoading) {
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

  const isFiltered = priorityFilter !== "ALL" || statusFilter !== "ALL";

  return (
    <section className={styles.page}>
      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div className={styles.filterBar}>
        <div className={styles.filterBarLeft}>
          <h2 className={styles.pageTitle}>Task Queue</h2>
          <p className={styles.pageSubtitle}>Click any row to view task details.</p>
        </div>

        <div className={styles.filters}>
          {/* Concept: server-driven filter dropdowns.
              What it means: option lists come from GET /tasks/filters, so they always
              reflect the real values that exist in the backend data. */}
          <div className={styles.filterGroup}>
            <label htmlFor="priority-filter" className={styles.filterLabel}>
              Priority
            </label>
            <select
              id="priority-filter"
              className={styles.filterSelect}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
            >
              <option value="ALL">All priorities</option>
              {filterOptions?.priorities.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="status-filter" className={styles.filterLabel}>
              Status
            </label>
            <select
              id="status-filter"
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="ALL">All statuses</option>
              {filterOptions?.statuses.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          {isFiltered && (
            <button
              className={styles.clearBtn}
              onClick={() => {
                setPriorityFilter("ALL");
                setStatusFilter("ALL");
              }}
              aria-label="Clear all filters"
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Status strip ─────────────────────────────────────────────────── */}
      {isFetching && (
        <div className={styles.fetchingBanner} role="status">
          Fetching filtered data from server…
        </div>
      )}

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
          <p>No tasks match the selected filters.</p>
        </Surface>
      )}
    </section>
  );
}
