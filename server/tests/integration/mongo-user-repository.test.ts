// Needs a real Mongo (docker compose up -d). Skipped when MONGO_URI is not set.
import mongoose from "mongoose";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { newUser } from "../../src/domain/user.js";
import { mongoUserRepository } from "../../src/infra/db/mongo-user-repository.js";

const uri = process.env.MONGO_URI;

describe.skipIf(!uri)("mongoUserRepository", () => {
  beforeAll(async () => {
    await mongoose.connect(`${uri}-test`);
    await mongoose.connection.dropDatabase();
  });
  afterAll(async () => {
    await mongoose.disconnect();
  });

  it("saves and finds a user", async () => {
    const repo = mongoUserRepository();
    const user = newUser({ email: "it@example.com", name: "IT" });
    await repo.save(user);
    const found = await repo.findByEmail("it@example.com");
    expect(found?.id).toBe(user.id);
    expect(await repo.list()).toHaveLength(1);
  });
});
