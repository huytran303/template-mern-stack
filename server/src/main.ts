import mongoose from "mongoose";
import { buildApp } from "./interface/http/server.js";
import { loadConfig } from "./infra/config/index.js";
import { mongoUserRepository } from "./infra/db/mongo-user-repository.js";

const config = loadConfig(); // first thing — exits if env is invalid

await mongoose.connect(config.MONGO_URI);
console.log("mongo connected");

const app = buildApp({ userRepo: mongoUserRepository() });
app.listen(config.PORT, () => {
  console.log(`server listening on :${config.PORT} (${config.NODE_ENV})`);
});
