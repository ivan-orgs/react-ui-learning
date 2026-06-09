import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridReadyEvent, RowClickedEvent } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { PriorityBadge } from "./PriorityBadge";
import type { TaskId, ReviewStatus, PriorityLevel } from "../types";
import styles from "./AgTaskGrid.module.css";

// Concept: AG Grid module registration.
// What it means: AG Grid enables features through registered modules.
// Seen in app: the queue uses sorting, filtering, row clicks, and AG Grid styling.
ModuleRegistry.registerModules([AllCommunityModule]);

export interface TaskGridRow {
  id: TaskId;
  team: string;
  owner: string;
  priority: PriorityLevel;
  confidence: string;
  status: ReviewStatus;
}

interface AgTaskGridProps {
  rows: TaskGridRow[];
  onOpen: (row: TaskGridRow) => void;
}

// Concept: AG Grid default column definition.
// What it means: shared options apply to every column unless a column overrides them.
// Seen in app: all queue columns are sortable, filterable, resizable, and flex to fill width.
const defaultColDef: ColDef<TaskGridRow> = {
  flex: 1,
  minWidth: 140,
  sortable: true,
  filter: true,
  resizable: true
};

export function AgTaskGrid({ rows, onOpen }: AgTaskGridProps) {
  // Concept: AG Grid ColDef and custom cell renderers.
  // What it means: columnDefs tell the grid what fields to show and how to render special cells.
  // Seen in app: priority/status columns render colored PriorityBadge components instead of plain text.
  const columnDefs: Array<ColDef<TaskGridRow>> = [
    { field: "id", headerName: "ID" },
    { field: "team", headerName: "Team" },
    { field: "owner", headerName: "Owner" },
    {
      field: "priority",
      headerName: "Priority",
      cellRenderer: ({ value }: { value: PriorityLevel }) => <PriorityBadge value={value} />
    },
    {
      field: "confidence",
      headerName: "Delivery confidence",
      cellRenderer: ({ value }: { value: string }) => <PriorityBadge value={value} />
    },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: ({ value }: { value: ReviewStatus }) => <PriorityBadge value={value} />
    }
  ];

  // Concept: AG Grid API.
  // What it means: event.api lets code call grid methods after the grid is ready.
  // Seen in app: sizeColumnsToFit auto-sizes columns when the queue grid loads.
  function autoSize(event: GridReadyEvent<TaskGridRow>) {
    event.api.sizeColumnsToFit();
  }

  // Concept: row navigation / click-to-route behavior.
  // What it means: a grid row can behave like an app navigation target.
  // Seen in app: clicking a row opens its task details page.
  function handleRowClick(event: RowClickedEvent<TaskGridRow>) {
    if (event.data) {
      onOpen(event.data);
    }
  }

  return (
    <div className={`ag-theme-quartz ${styles.grid}`} aria-label="AG Grid task queue">
      <AgGridReact
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        domLayout="autoHeight"
        rowData={rows}
        rowSelection={{ mode: "singleRow" }}
        onGridReady={autoSize}
        onRowClicked={handleRowClick}
      />
    </div>
  );
}



