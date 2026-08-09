import { randomUUID } from "node:crypto";
import { z } from "zod";
import { DomainError } from "./errors.js";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// Port — implemented by infra, used by usecases. Lives here so domain owns the contract.
export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  /** Throws DomainError("email already registered") on duplicate email. */
  save(user: User): Promise<void>;
  /** Newest first. */
  list(): Promise<User[]>;
}

// Single source of truth for the create-user contract — enforced here, published by openapi.ts.
export const CreateUser = z.object({
  email: z.string().trim().toLowerCase().email("invalid email"),
  name: z.string().trim().min(1, "name must be 1-100 chars").max(100, "name must be 1-100 chars"),
});

export function newUser(input: unknown): User {
  const parsed = CreateUser.safeParse(input);
  if (!parsed.success) throw new DomainError(parsed.error.issues[0]?.message ?? "invalid input");
  return { id: randomUUID(), ...parsed.data, createdAt: new Date() };
}
