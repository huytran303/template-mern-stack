import { DomainError } from "../domain/errors.js";
import { newUser, type User, type UserRepository } from "../domain/user.js";

export async function registerUser(
  repo: UserRepository,
  input: { email: string; name: string },
): Promise<User> {
  const user = newUser(input);
  if (await repo.findByEmail(user.email)) throw new DomainError("email already registered");
  await repo.save(user);
  return user;
}

export function listUsers(repo: UserRepository): Promise<User[]> {
  return repo.list();
}
