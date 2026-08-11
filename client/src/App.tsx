import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AppButton } from "@/components/ui/button/AppButton";
import { AppCard } from "@/components/ui/card/AppCard";
import { AppEmptyState } from "@/components/ui/empty-state/AppEmptyState";
import { AppInput } from "@/components/ui/input/AppInput";
import { AppToaster, appToast } from "@/components/ui/toast/AppToast";
import { STRINGS, type Locale } from "@/i18n";

interface User {
  id: string;
  email: string;
  name: string;
}

type Theme = "light" | "dark";

function initialTheme(): Theme {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function initialLocale(): Locale {
  const stored = localStorage.getItem("locale");
  return stored === "vi" ? "vi" : "en";
}

async function fetchUsers({ signal }: { signal: AbortSignal }): Promise<User[]> {
  const res = await fetch("/api/v1/users", { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body: { data: User[] } = await res.json();
  return body.data;
}

async function createUser(input: { email: FormDataEntryValue | null; name: FormDataEntryValue | null }): Promise<User> {
  const res = await fetch("/api/v1/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    // Error bodies aren't always JSON (proxy errors, HTML 404s) — don't let .json() throw.
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? "");
  }
  const body: { data: User } = await res.json();
  return body.data;
}

export function App() {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const t = STRINGS[locale];
  const queryClient = useQueryClient();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("locale", locale);
  }, [locale]);

  const usersQuery = useQuery({ queryKey: ["users"], queryFn: fetchUsers });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: async (created) => {
      // Server returns the created user — prepend into the cache, no refetch needed.
      // cancelQueries first so an in-flight GET can't resolve late and clobber it.
      await queryClient.cancelQueries({ queryKey: ["users"] });
      queryClient.setQueryData<User[]>(["users"], (prev = []) => [created, ...prev]);
    },
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    createMutation.mutate(
      { email: data.get("email"), name: data.get("name") },
      { onSuccess: () => form.reset() },
    );
  }

  const users = usersQuery.data ?? [];
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
        {users.length === 0 ? (
          <AppEmptyState message={t.noUsers} />
        ) : (
          <ul className="mt-4 flex flex-col gap-1">
            {users.map((u) => (
              <li key={u.id}>
                {u.name} — {u.email}
              </li>
            ))}
          </ul>
        )}
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
