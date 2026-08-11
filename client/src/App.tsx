import { useEffect, useRef, useState, type FormEvent } from "react";

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

export function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const loadCtrl = useRef<AbortController | null>(null);
  const t = STRINGS[locale];

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("locale", locale);
  }, [locale]);

  useEffect(() => {
    // Abortable so a slow initial GET can't resolve late and clobber newer state
    // (after unmount, or after a POST already prepended a user).
    const ctrl = new AbortController();
    loadCtrl.current = ctrl;
    fetch("/api/v1/users", { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((body: { data: User[] }) => setUsers(body.data))
      .catch(() => {
        if (!ctrl.signal.aborted) setError(t.loadError);
      });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once on mount, same as before locale was added
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.get("email"), name: data.get("name") }),
      });
      if (!res.ok) {
        // Error bodies aren't always JSON (proxy errors, HTML 404s) — don't let .json() throw.
        const body = (await res.json().catch(() => null)) as { message?: string } | null;
        setError(body?.message ?? `${t.requestFailed} (${res.status})`);
        return;
      }
      const { data: created }: { data: User } = await res.json();
      loadCtrl.current?.abort(); // an in-flight initial GET is now stale — don't let it overwrite
      setUsers((prev) => [created, ...prev]); // server returns the created user — no refetch needed
      form.reset();
    } catch {
      setError(t.requestFailed);
    } finally {
      setPending(false);
    }
  }

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
