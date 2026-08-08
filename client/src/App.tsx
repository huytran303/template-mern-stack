import { useEffect, useState, type FormEvent } from "react";

interface User {
  id: string;
  email: string;
  name: string;
}

export function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");

  const load = () =>
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => setError("failed to load users"));

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const data = new FormData(form);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.get("email"), name: data.get("name") }),
    });
    if (!res.ok) {
      setError((await res.json()).error ?? "request failed");
      return;
    }
    form.reset();
    load();
  }

  return (
    <main style={{ maxWidth: 480, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>Users</h1>
      <form onSubmit={onSubmit} style={{ display: "flex", gap: 8 }}>
        <input name="name" placeholder="Name" required />
        <input name="email" type="email" placeholder="Email" required />
        <button>Add</button>
      </form>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
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
