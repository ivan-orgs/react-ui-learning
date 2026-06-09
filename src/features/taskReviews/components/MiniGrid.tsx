import type { ReactNode } from "react";
import styles from "./MiniGrid.module.css";

export interface ColumnDef<T> {
  key: keyof T;
  header: string;
  render?: (row: T) => ReactNode;
}

interface MiniGridProps<T extends { id: string }> {
  columns: Array<ColumnDef<T>>;
  rows: T[];
  onRowClick: (row: T) => void;
}

export function MiniGrid<T extends { id: string }>({ columns, rows, onRowClick }: MiniGridProps<T>) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} scope="col">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} onClick={() => onRowClick(row)} tabIndex={0}>
              {columns.map((column) => (
                <td key={String(column.key)}>
                  {column.render ? column.render(row) : String(row[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}



