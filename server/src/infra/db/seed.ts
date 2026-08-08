// Rebuilds a demo database in one command: npm run seed (constitution: Defense readiness)
import mongoose from "mongoose";
import { newUser } from "../../domain/user.js";
import { loadConfig } from "../config/index.js";
import { mongoUserRepository } from "./mongo-user-repository.js";

const config = loadConfig();
await mongoose.connect(config.MONGO_URI);

const repo = mongoUserRepository();
const demo = [
  { email: "ana@example.com", name: "Ana" },
  { email: "bob@example.com", name: "Bob" },
  { email: "carol@example.com", name: "Carol" },
];

for (const input of demo) {
  if (!(await repo.findByEmail(input.email))) await repo.save(newUser(input));
}

console.log(`seeded ${demo.length} users into ${config.MONGO_URI}`);
await mongoose.disconnect();
