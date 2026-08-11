import { useEffect, useRef, useState, type FormEvent } from "react";

import { AppButton } from "@/components/ui/button/AppButton";
import { AppCard } from "@/components/ui/card/AppCard";
import { AppEmptyState } from "@/components/ui/empty-state/AppEmptyState";
import { AppInput } from "@/components/ui/input/AppInput";

interface User {
  id: string;
  email: string;
  name: string;
}

export function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const loadCtrl = useRef<AbortController | null>(null);

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
        if (!ctrl.signal.aborted) setError("failed to load users");
      });
    return () => ctrl.abort();
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
        setError(body?.message ?? `request failed (${res.status})`);
        return;
      }
      const { data: created }: { data: User } = await res.json();
      loadCtrl.current?.abort(); // an in-flight initial GET is now stale — don't let it overwrite
      setUsers((prev) => [created, ...prev]); // server returns the created user — no refetch needed
      form.reset();
    } catch {
      setError("request failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto my-8 max-w-[480px] font-sans">
      <h1 className="text-lg font-semibold">Users</h1>
      <AppCard className="mt-4">
        <form onSubmit={onSubmit} className="flex gap-2">
          <AppInput name="name" placeholder="Name" required />
          <AppInput name="email" type="email" placeholder="Email" required />
          <AppButton disabled={pending}>Add</AppButton>
        </form>
        {error && <p className="mt-2 text-danger-app">{error}</p>}
        {users.length === 0 ? (
          <AppEmptyState message="No users yet." />
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

      <h2 className="mt-8 text-lg font-semibold">Component demo</h2>
      <div className="mt-4 flex flex-col gap-4">
        <AppCard>
          <p className="text-sm font-medium">AppButton</p>
          <div className="mt-2 flex gap-2">
            <AppButton>Primary</AppButton>
            <AppButton variant="secondary">Secondary</AppButton>
            <AppButton disabled>Disabled</AppButton>
          </div>
        </AppCard>
        <AppCard>
          <p className="text-sm font-medium">AppInput</p>
          <div className="mt-2 flex gap-2">
            <AppInput placeholder="Type something" />
            <AppInput placeholder="Disabled" disabled />
          </div>
        </AppCard>
        <AppCard>
          <p className="text-sm font-medium">AppEmptyState</p>
          <div className="mt-2">
            <AppEmptyState message="Nothing here yet." />
          </div>
        </AppCard>
      </div>
    </main>
  );
}
