import { randomUUID } from "node:crypto";
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
  save(user: User): Promise<void>;
  list(): Promise<User[]>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function newUser(input: { email: string; name: string }): User {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (!EMAIL_RE.test(email)) throw new DomainError("invalid email");
  if (name.length < 1 || name.length > 100) throw new DomainError("name must be 1-100 chars");
  return { id: randomUUID(), email, name, createdAt: new Date() };
}
