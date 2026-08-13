import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { createColumnHelper, useTable, type PaginationState } from "@tanstack/react-table";

import { AppButton } from "@/components/ui/button/AppButton";
import { AppCard } from "@/components/ui/card/AppCard";
import { AppEmptyState } from "@/components/ui/empty-state/AppEmptyState";
import { AppInput } from "@/components/ui/input/AppInput";
import { AppSearchInput } from "@/components/ui/search-input/AppSearchInput";
import { AppTable, appTableFeatures } from "@/components/ui/table/AppTable";
import { AppTableColumnToggle } from "@/components/ui/table/AppTableColumnToggle";
import { AppTableLimitSelect } from "@/components/ui/table/AppTableLimitSelect";
import { AppPagination } from "@/components/ui/pagination/AppPagination";
import { AppToaster, appToast } from "@/components/ui/toast/AppToast";
import { useCreateUser, useUsers } from "@/hooks/useUsers";
import { STRINGS, type Locale } from "@/i18n";
import { type User } from "@/services/users";
import { formatDate } from "@/utils/formatDate";

type Theme = "light" | "dark";

const columnHelper = createColumnHelper<typeof appTableFeatures, User>();
// Stable fallback — a fresh [] every render would rebuild the table's row models.
const NO_USERS: User[] = [];

function initialTheme(): Theme {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function initialLocale(): Locale {
  const stored = localStorage.getItem("locale");
  return stored === "vi" ? "vi" : "en";
}

export function App() {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const t = STRINGS[locale];

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("locale", locale);
  }, [locale]);

  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  // Server-side pagination: each page is its own request, sized by the select.
  const usersQuery = useUsers(search, pagination.pageSize, pagination.pageIndex * pagination.pageSize);
  const createMutation = useCreateUser();

  // A new search means a new result set — jump back to its first page.
  const onSearch = useCallback((value: string) => {
    setSearch(value);
    setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
  }, []);
  const onPageSize = useCallback((value: number) => {
    setPagination({ pageIndex: 0, pageSize: value });
  }, []);

  const users = usersQuery.data?.items ?? NO_USERS;
  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("name", { header: t.namePlaceholder }),
        columnHelper.accessor("email", { header: t.emailPlaceholder }),
        // ISO strings sort chronologically as text, so the default sortFn is correct.
        columnHelper.accessor("createdAt", {
          header: t.createdAtHeader,
          cell: (info) => formatDate(info.getValue(), locale),
        }),
      ]),
    [t, locale],
  );
  const table = useTable({
    features: appTableFeatures,
    data: users,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    // The server pages; the table only reports page count from the server's total.
    manualPagination: true,
    rowCount: usersQuery.data?.total ?? 0,
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    createMutation.mutate(
      { email: String(data.get("email")), name: String(data.get("name")) },
      { onSuccess: () => form.reset() },
    );
  }

  const error = createMutation.isError
    ? createMutation.error.message || t.requestFailed
    : usersQuery.isError
      ? t.loadError
      : "";
  const pending = createMutation.isPending;

  return (
    <main className="mx-auto my-8 max-w-[480px] font-sans">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">{t.title}</h1>
        <div className="flex gap-2">
          <AppButton variant="secondary" onClick={() => setTheme((p) => (p === "dark" ? "light" : "dark"))}>
            {theme === "dark" ? "☀️" : "🌙"}
          </AppButton>
          <AppButton variant="secondary" onClick={() => setLocale((p) => (p === "en" ? "vi" : "en"))}>
            {locale === "en" ? "VI" : "EN"}
          </AppButton>
        </div>
      </div>
      <AppCard className="mt-4">
        <form onSubmit={onSubmit} className="flex flex-wrap gap-2">
          <AppInput name="name" placeholder={t.namePlaceholder} required />
          <AppInput name="email" type="email" placeholder={t.emailPlaceholder} required />
          <AppButton disabled={pending}>{t.add}</AppButton>
        </form>
        {error && <p className="mt-2 text-danger-app">{error}</p>}
        <AppSearchInput className="mt-4 w-full" placeholder={t.searchPlaceholder} onSearch={onSearch} />
        <div className="mt-4 flex flex-col gap-2">
          <AppTableColumnToggle table={table} />
          <AppTable table={table} emptyMessage={search ? t.noResults : t.noUsers} />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <AppTableLimitSelect value={pagination.pageSize} onChange={onPageSize} label={t.limitLabel} />
            <AppPagination
              pageIndex={pagination.pageIndex}
              pageCount={table.getPageCount()}
              onPageChange={(pageIndex) => setPagination((p) => ({ ...p, pageIndex }))}
              prevLabel={t.previousPage}
              nextLabel={t.nextPage}
            />
          </div>
        </div>
      </AppCard>

      <h2 className="mt-8 text-lg font-semibold">{t.componentDemo}</h2>
      <div className="mt-4 flex flex-col gap-4">
        <AppCard>
          <p className="text-sm font-medium">AppButton</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <AppButton>{t.primary}</AppButton>
            <AppButton variant="secondary">{t.secondary}</AppButton>
            <AppButton disabled>{t.disabled}</AppButton>
          </div>
        </AppCard>
        <AppCard>
          <p className="text-sm font-medium">AppInput</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <AppInput placeholder={t.typeSomething} />
            <AppInput placeholder={t.disabled} disabled />
          </div>
        </AppCard>
        <AppCard>
          <p className="text-sm font-medium">AppEmptyState</p>
          <div className="mt-2">
            <AppEmptyState message={t.nothingHere} />
          </div>
        </AppCard>
        <AppCard>
          <p className="text-sm font-medium">AppToast</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <AppButton onClick={() => appToast.success(t.toastSuccess)}>{t.success}</AppButton>
            <AppButton onClick={() => appToast.danger(t.toastDanger)}>{t.danger}</AppButton>
            <AppButton onClick={() => appToast.warning(t.toastWarning)}>{t.warning}</AppButton>
          </div>
        </AppCard>
      </div>
      <AppToaster theme={theme} />
    </main>
  );
}
