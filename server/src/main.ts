import mongoose from "mongoose";
import { buildApp } from "./interface/http/server.js";
import { loadConfig } from "./infra/config/index.js";
import { ensureUserIndexes, mongoUserRepository } from "./infra/db/mongo-user-repository.js";

const config = loadConfig(); // first thing — exits if env is invalid

try {
  await mongoose.connect(config.MONGO_URI);
  await ensureUserIndexes();
} catch (err) {
  console.error("❌ mongo connection failed:", err instanceof Error ? err.message : err);
  process.exit(1); // fail fast — never serve without a database
}
console.log("mongo connected");

const app = buildApp({ userRepo: mongoUserRepository() });
const server = app.listen(config.PORT, () => {
  console.log(`server listening on :${config.PORT} (${config.NODE_ENV})`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(() => {
      mongoose.disconnect().finally(() => process.exit(0));
    });
    server.closeIdleConnections();
  });
}
