import { useEffect, useRef, useState, type FormEvent } from "react";

interface User {
  id: string;
  email: string;
  name: string;
}

export function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
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
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>Users</h1>
      <form onSubmit={onSubmit} style={{ display: "flex", gap: 8 }}>
        <input name="name" placeholder="Name" required />
        <input name="email" type="email" placeholder="Email" required />
        <button>Add</button>
      </form>
      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.name} — {u.email}
          </li>
        ))}
      </ul>
    </main>
  );
}
