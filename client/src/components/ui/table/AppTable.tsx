import {
  columnVisibilityFeature,
  createPaginatedRowModel,
  rowPaginationFeature,
  tableFeatures,
  type ReactTable,
  type RowData,
} from "@tanstack/react-table";

import { AppEmptyState } from "@/components/ui/empty-state/AppEmptyState";

// One feature set for every App table — v9 only ships APIs for registered features,
// so the whole ui/table/ kit (pagination, column toggle) types against this.
export const appTableFeatures = tableFeatures({
  columnVisibilityFeature,
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});
export type AppTableFeatures = typeof appTableFeatures;

interface AppTableProps<T extends RowData> {
  table: ReactTable<AppTableFeatures, T>;
  /** Rendered inside the body when there are no rows — header stays visible. */
  emptyMessage: string;
}

export function AppTable<T extends RowData>({ table, emptyMessage }: AppTableProps<T>) {
  const rows = table.getRowModel().rows;
  return (
    <div className="overflow-x-auto rounded-lg border border-border-app">
      <table className="w-full text-sm">
        <thead className="bg-surface-app">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-3 py-2 text-left font-medium text-muted-app">
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr className="border-t border-border-app">
              <td colSpan={table.getVisibleLeafColumns().length} className="px-3 py-8 text-center">
                <AppEmptyState message={emptyMessage} />
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="border-t border-border-app hover:bg-surface-app">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2">
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
