import { type ReactTable, type RowData } from "@tanstack/react-table";

import { AppButton } from "@/components/ui/button/AppButton";
import { cn } from "@/utils/cn";
import { type AppTableFeatures } from "./AppTable";

interface AppTablePaginationProps<T extends RowData> {
  table: ReactTable<AppTableFeatures, T>;
  /** Localized aria-labels — the buttons themselves show ‹ / ›. */
  prevLabel: string;
  nextLabel: string;
  className?: string;
}

export function AppTablePagination<T extends RowData>({
  table,
  prevLabel,
  nextLabel,
  className,
}: AppTablePaginationProps<T>) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
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
