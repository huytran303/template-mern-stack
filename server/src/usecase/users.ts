import { newListQuery, newUser, type User, type UserRepository } from "../domain/user.js";

export async function registerUser(repo: UserRepository, input: unknown): Promise<User> {
  const user = newUser(input);
  await repo.save(user); // uniqueness is the repo's contract (unique index) — a pre-check here would race
  return user;
}

export async function listUsers(repo: UserRepository, query: unknown = {}): Promise<User[]> {
  return repo.list(newListQuery(query).limit); // async so a validation throw always rejects
}
