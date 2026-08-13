import { type ReactTable, type RowData } from "@tanstack/react-table";

import { type AppTableFeatures } from "./AppTable";

interface AppTableColumnToggleProps<T extends RowData> {
  table: ReactTable<AppTableFeatures, T>;
}

export function AppTableColumnToggle<T extends RowData>({ table }: AppTableColumnToggleProps<T>) {
  return (
    <div className="flex flex-wrap gap-3">
      {table
        .getAllLeafColumns()
        .filter((column) => column.getCanHide())
        .map((column) => (
          <label key={column.id} className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={column.getIsVisible()}
              onChange={column.getToggleVisibilityHandler()}
            />
            {typeof column.columnDef.header === "string" ? column.columnDef.header : column.id}
          </label>
        ))}
    </div>
  );
}
