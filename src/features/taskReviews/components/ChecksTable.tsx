import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import styles from "./ChecksTable.module.css";

interface CheckRow {
  name: string;
  complete: boolean;
}

// Concept: AG Grid in a detail widget.
// What it means: grids are reusable, not only for main queue pages.
// Seen in app: open an task, click "Check list", and this table appears.
const columnDefs: Array<ColDef<CheckRow>> = [
  { field: "name", headerName: "Check name", flex: 2 },
  {
    field: "complete",
    headerName: "Completeness",
    flex: 1,
    // Concept: custom cell renderer.
    // What it means: raw boolean data becomes readable display text.
    // Seen in app: true becomes "Complete" and false becomes "Needs work".
    cellRenderer: ({ value }: { value: boolean }) => (value ? "Complete" : "Needs work")
  }
];

export function ChecksTable({ checks }: { checks: CheckRow[] }) {
  return (
    <div className={`ag-theme-quartz ${styles.table}`}>
      <AgGridReact
        columnDefs={columnDefs}
        defaultColDef={{ resizable: true }}
        domLayout="autoHeight"
        rowData={checks}
      />
    </div>
  );
}



