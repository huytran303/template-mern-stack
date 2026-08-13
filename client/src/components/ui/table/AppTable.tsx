import {
  columnVisibilityFeature,
  createPaginatedRowModel,
  rowPaginationFeature,
  tableFeatures,
  type ReactTable,
  type RowData,
} from "@tanstack/react-table";

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
}

export function AppTable<T extends RowData>({ table }: AppTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-border-app">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-2 py-1 text-left font-medium text-muted-app">
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-border-app">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-2 py-1">
                  <table.FlexRender cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
