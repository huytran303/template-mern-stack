import { describe, expect, it } from "vitest";
import { DomainError } from "../../src/domain/errors.js";
import type { User, UserRepository } from "../../src/domain/user.js";
import { listUsers, registerUser } from "../../src/usecase/users.js";

// Mirrors the Mongo adapter's contract: unique email, newest first, returns copies.
function inMemoryRepo(): UserRepository {
  const users: User[] = [];
  return {
    async findByEmail(email) {
      const found = users.find((u) => u.email === email);
      return found ? { ...found } : null;
    },
    async save(user) {
      if (users.some((u) => u.email === user.email)) {
        throw new DomainError("email already registered");
      }
      users.push({ ...user });
    },
    async list() {
      return users.map((u) => ({ ...u })).sort((a, b) => +b.createdAt - +a.createdAt);
    },
  };
}

describe("registerUser", () => {
  it("creates a user with normalized email", async () => {
    const repo = inMemoryRepo();
    const user = await registerUser(repo, { email: "  Ana@Example.COM ", name: "Ana" });
    expect(user.email).toBe("ana@example.com");
    expect(user.id).toBeTruthy();
    expect(await listUsers(repo)).toHaveLength(1);
  });

  it("rejects invalid email", async () => {
    await expect(registerUser(inMemoryRepo(), { email: "nope", name: "Ana" })).rejects.toThrow(
      DomainError,
    );
  });

  it("rejects non-string body fields", async () => {
    await expect(
      registerUser(inMemoryRepo(), { email: ["a@b.co"], name: { x: 1 } }),
    ).rejects.toThrow(DomainError);
  });

  it("rejects duplicate email", async () => {
    const repo = inMemoryRepo();
    await registerUser(repo, { email: "a@b.co", name: "Ana" });
    await expect(registerUser(repo, { email: "a@b.co", name: "Bob" })).rejects.toThrow(
      "email already registered",
    );
  });
});
