# AG Grid Notes

AG Grid is a feature-rich data grid library. This project uses the React wrapper (`ag-grid-react`) to display the task queue and checks table.

---

## How AG Grid works — the big picture

You give AG Grid two things:

```
rowData    → the array of objects to display (one object = one row)
columnDefs → a list of column definitions (what field to show, how to render it)
```

AG Grid handles all the rest: sorting, filtering, resizing, row selection.

---

## ColDef — defining a column

A `ColDef` is a plain object that describes one column. The minimum you need is `field` — the key on your row object to display.

```tsx
const columnDefs: ColDef<TaskGridRow>[] = [
  { field: 'id',    headerName: 'ID' },
  { field: 'team',  headerName: 'Team' },
  { field: 'owner', headerName: 'Owner' },
];
```

`field: 'team'` tells AG Grid: for each row object, look up `row.team` and display it in this column. `headerName` is the label shown in the column header.

The generic `ColDef<TaskGridRow>` lets TypeScript know what shape each row object is — so if you type `field: 'typo'`, TypeScript catches it.

---

## defaultColDef — shared settings for all columns

Instead of repeating `sortable: true` on every column, you set it once in `defaultColDef`. Every column inherits it automatically. Individual columns can still override it.

```tsx
const defaultColDef: ColDef<TaskGridRow> = {
  flex: 1,        // each column grows to fill available width equally
  minWidth: 140,  // but never shrinks below 140px
  sortable: true, // clicking the header sorts the column
  filter: true,   // a filter input appears on hover
  resizable: true // the column edge can be dragged to resize
};
```

Think of it as the default CSS class that all columns share — individual columns add their own overrides on top.

---

## Custom cell renderers — render JSX instead of plain text

By default, AG Grid renders the field value as plain text. A `cellRenderer` replaces that with any JSX you return.

```tsx
{
  field: 'priority',
  headerName: 'Priority',
  cellRenderer: ({ value }: { value: PriorityLevel }) => <PriorityBadge value={value} />
  //             ↑
  //   AG Grid calls this function for each row in this column
  //   value = the field value for that row (e.g. "HIGH")
  //   return any JSX — it renders inside the cell
}
```

Instead of showing the raw string `"HIGH"`, the cell shows a coloured `<PriorityBadge>` component.

The `cellRenderer` function receives `{ value, data, ... }`:
- `value` — the field value for this cell
- `data` — the entire row object (useful if you need other fields)

---

## Grid API — auto-size columns after load

**What is the Grid API?**

AG Grid has many built-in methods — things like "resize all columns", "export to CSV", "select a row programmatically". These methods live on an object called the **Grid API**. You call them when you want to control the grid from your code.

**Why can't you just call them immediately?**

Because the grid needs time to mount and render before it is ready to accept method calls. If you try to call `sizeColumnsToFit()` before the grid exists, you get an error.

AG Grid solves this with the `onGridReady` event — it fires **once**, exactly when the grid has finished mounting and is ready to use.

**How it works — step by step:**

```tsx
// Step 1 — write a function that receives the event
function autoSize(event: GridReadyEvent<TaskGridRow>) {

  // Step 2 — event.api is the Grid API object
  //          it is only available here, after the grid is ready
  event.api.sizeColumnsToFit();
  //        ↑
  //   this method tells AG Grid:
  //   "resize all columns so they together fill the container width exactly"
}

// Step 3 — pass your function to onGridReady
<AgGridReact
  onGridReady={autoSize}
  ...
/>
```

**What does `sizeColumnsToFit()` actually do?**

Without it:
```
| ID       | Team     | Owner    |              |   (empty space at the end)
```

With it:
```
| ID            | Team          | Owner         | Priority      |  (fills the full width)
```

It distributes the available container width across all columns. Combined with `flex: 1` in `defaultColDef`, each column gets an equal share and no empty space is left.

**The sequence in time:**

```
Page renders → <AgGridReact> mounts
    ↓
AG Grid finishes building the grid internally
    ↓
onGridReady fires → autoSize(event) is called
    ↓
event.api.sizeColumnsToFit() → columns fill the container  ✅
```

---


## Row shaping — mapping API data into grid rows

**The problem**

AG Grid needs `rowData` to be a simple flat array where each object's keys exactly match the `field` names in your `columnDefs`.

But the API returns much more data than the grid needs — full task details, checks, summary, dates, etc. If you hand the raw API response to AG Grid, the grid would have no idea what to show.

**What the API actually returns — `ApiTaskRow`**

```ts
// One row from the Spring Boot API:
{
  id: 'TASK-101',
  team: 'Alpha',
  owner: 'Priya',
  priority: 'HIGH',
  confidence: 'MEDIUM',      // raw value — null if not available
  suggestedPriority: null,   // optional, could be missing
  status: 'PENDING',
  summary: 'Long text...',   // not needed in the grid
  checks: [...],             // not needed in the grid
  updatedAt: '2024-05-01'    // not needed in the grid
}
```

**What AG Grid needs — `TaskGridRow`**

The grid only shows 6 columns. So the row object handed to it only needs 6 keys — exactly matching the `field` values in `columnDefs`:

```ts
// What AG Grid needs:
{
  id: 'TASK-101',
  team: 'Alpha',
  owner: 'Priya',
  priority: 'HIGH',
  confidence: 'MEDIUM',  // formatted — "Not available" if null
  status: 'PENDING'
  // summary, checks, updatedAt are gone — grid doesn't need them
}
```

**Where the shaping happens — `TaskReviewRecord.queueRow`**

The `TaskReviewRecord` class wraps each API row and provides a `queueRow` getter that returns exactly what the grid needs:

```ts
// TaskReviewRecord.ts
get queueRow() {
  return {
    id:         this.row.id,
    team:       this.row.team,
    owner:      this.row.owner,
    priority:   this.row.priority,
    confidence: this.displayMetric(this.row.confidence),
    //          ↑ converts null → "Not available", keeps the string if it exists
    status:     this.row.status
  };
}
```

**Then in QueuePage — one line to shape all rows:**

```tsx
const rows = useMemo(
  () => data.map((record) => record.queueRow),
  //              ↑ each record is a TaskReviewRecord
  //                         ↑ .queueRow returns the shaped object
  [data]
);

<AgTaskGrid rows={rows} onOpen={openTask} />
// rows is now TaskGridRow[] — exactly what AG Grid expects
```

**The full flow:**

```
Spring Boot returns ApiTaskRow[]
    ↓
Each row is wrapped in a TaskReviewRecord
    ↓
QueuePage calls record.queueRow on each one  (picks only what the grid needs)
    ↓
AG Grid receives TaskGridRow[]  →  renders the 6 columns correctly  ✅
```

**Why not just pass the raw API data directly?**

```tsx
// ❌ If you did this:
<AgTaskGrid rows={data} />

// AG Grid would look for data[0].confidence
// but the raw value is null — the grid would show blank or crash
// Also, extra fields like 'summary' and 'checks' would just be ignored silently
// — messy and hard to track
```

By shaping the data first, the grid is fully decoupled from the API — you can change the API response shape without touching the grid, and vice versa.

---


## Row click navigation

AG Grid fires an `onRowClicked` event when the user clicks a row. You use this to navigate to a detail page.

```tsx
function handleRowClick(event: RowClickedEvent<TaskGridRow>) {
  if (event.data) {
    onOpen(event.data); // event.data = the full row object for the clicked row
  }
}

<AgGridReact
  onRowClicked={handleRowClick}
  rowSelection={{ mode: 'singleRow' }} // highlights the clicked row
  ...
/>
```

In the queue page, `onOpen` calls `navigate('/task/' + row.id)` — so clicking a row is the same as navigating to a route.

```tsx
// QueuePage.tsx
const openTask = useCallback(
  (row: TaskGridRow) => {
    navigate(`/task/${row.id}`);
  },
  [navigate]
);

<AgTaskGrid rows={rows} onOpen={openTask} />
```

---

## Checks table — a second, simpler grid

AG Grid is reusable — it is not only for the main queue page. The task detail page has a `ChecksTable` that uses the same pattern but simpler:

```tsx
// CheckRow shape — just two fields
interface CheckRow {
  name: string;
  complete: boolean;
}

const columnDefs: ColDef<CheckRow>[] = [
  { field: 'name',     headerName: 'Check name',   flex: 2 },
  {
    field: 'complete',
    headerName: 'Completeness',
    flex: 1,
    // cellRenderer turns a boolean into readable text
    cellRenderer: ({ value }: { value: boolean }) => (value ? 'Complete' : 'Needs work')
  }
];
```

No `onRowClicked`, no `onGridReady` — just column definitions and row data. The same `<AgGridReact>` component works for both cases because you only add what you need.

---

## Putting it all together

```
API returns data
    ↓
QueuePage maps it to TaskGridRow[] (row shaping)
    ↓
AgTaskGrid receives rows and onOpen
    ↓
columnDefs tell each column what field to show and how to render it
defaultColDef gives all columns shared settings (sortable, filterable, flex)
    ↓
onGridReady → event.api.sizeColumnsToFit() → columns fill the container
    ↓
User clicks a row → onRowClicked → navigate('/task/TASK-101')
```

---

## Quick Reference

| Concept | What it does | Where in this project |
|---|---|---|
| `ColDef` | Defines one column — field, header, renderer | `AgTaskGrid.tsx`, `ChecksTable.tsx` |
| `defaultColDef` | Shared settings applied to all columns | `AgTaskGrid.tsx` |
| `cellRenderer` | Replace plain text with JSX in a cell | Priority, confidence, status columns |
| `onGridReady` | Fires once after grid mounts — access `event.api` | `autoSize` in `AgTaskGrid.tsx` |
| `sizeColumnsToFit()` | Resize all columns to fill the container | Called in `autoSize` |
| Row shaping | Map API data to the flat shape AG Grid expects | `record.queueRow` in `QueuePage.tsx` |
| `onRowClicked` | Fires when a row is clicked — `event.data` = row object | `handleRowClick` in `AgTaskGrid.tsx` |
| `ChecksTable` | A second grid for task checks — simpler, no navigation | `ChecksTable.tsx` |
