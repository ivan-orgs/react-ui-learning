import type { ApiTaskResponse, ApiTaskRow } from "../types";

// Concept: row wrapper around columnar encoded data.
// What it means: values are stored by position, and headers explain what each position means.
// Seen in app: QueuePage reads first owner with getStringValue("owner").
export class ColumnarTaskRow {
  constructor(
    private readonly headers: readonly string[],
    private readonly values: readonly string[]
  ) {}

  getStringValue(header: string) {
    const index = this.headers.indexOf(header);
    return index >= 0 ? this.values[index] : undefined;
  }
}

// Concept: API response abstraction.
// What it means: ColumnarTaskData hides the raw headers/rows format behind a useful model.
// Seen in app: useColumnarTasks returns this instead of exposing raw API response data.
export class ColumnarTaskData {
  readonly headers: readonly string[];
  readonly rows: ColumnarTaskRow[];

  constructor(response: ApiTaskResponse) {
    this.headers = response.headers;
    this.rows = response.rows.map((row) => new ColumnarTaskRow(this.headers, encodeRow(row)));
  }
}

// Concept: columnar data encoding.
// What it means: an object row becomes an ordered value array matching the headers array.
// Seen in app: headers [id,team,owner,status] map to these values.
function encodeRow(row: ApiTaskRow) {
  return [row.id, row.team, row.owner, row.status] as const;
}



