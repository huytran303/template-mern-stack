import { type ReactTable, type RowData } from "@tanstack/react-table";

import { AppButton } from "@/components/ui/button/AppButton";
import { type AppTableFeatures } from "./AppTable";

interface AppTablePaginationProps<T extends RowData> {
  table: ReactTable<AppTableFeatures, T>;
  /** Localized aria-labels — the buttons themselves show ‹ / ›. */
  prevLabel: string;
  nextLabel: string;
}

export function AppTablePagination<T extends RowData>({ table, prevLabel, nextLabel }: AppTablePaginationProps<T>) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <AppButton
        variant="secondary"
        aria-label={prevLabel}
        disabled={!table.getCanPreviousPage()}
        onClick={() => table.previousPage()}
      >
        ‹
      </AppButton>
      <span className="text-sm text-muted-app">
        {table.state.pagination.pageIndex + 1} / {Math.max(1, table.getPageCount())}
      </span>
      <AppButton
        variant="secondary"
        aria-label={nextLabel}
        disabled={!table.getCanNextPage()}
        onClick={() => table.nextPage()}
      >
        ›
      </AppButton>
    </div>
  );
}
