import { describe, expect, it } from "vitest";
import { DomainError } from "../../src/domain/errors.js";
import type { User, UserRepository } from "../../src/domain/user.js";
import { listUsers, registerUser } from "../../src/usecase/users.js";

function inMemoryRepo(): UserRepository {
  const users: User[] = [];
  return {
    async findByEmail(email) {
      return users.find((u) => u.email === email) ?? null;
    },
    async save(user) {
      users.push(user);
    },
    async list() {
      return [...users];
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

  it("rejects duplicate email", async () => {
    const repo = inMemoryRepo();
    await registerUser(repo, { email: "a@b.co", name: "Ana" });
    await expect(registerUser(repo, { email: "a@b.co", name: "Bob" })).rejects.toThrow(
      "email already registered",
    );
  });
});
