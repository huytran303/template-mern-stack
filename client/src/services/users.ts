export interface User {
  id: string;
  email: string;
  name: string;
}

export async function fetchUsers({ search, signal }: { search?: string; signal: AbortSignal }): Promise<User[]> {
  const qs = search ? `?${new URLSearchParams({ search })}` : "";
  const res = await fetch(`/api/v1/users${qs}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body: { data: User[] } = await res.json();
  return body.data;
}

export async function createUser(input: { email: string; name: string }): Promise<User> {
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
