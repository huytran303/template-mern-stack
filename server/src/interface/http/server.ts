import express from "express";
import type { UserRepository } from "../../domain/user.js";
import { errorHandler, requestLogger } from "./middleware.js";
import { userRoutes } from "./user-routes.js";

export function buildApp(deps: { userRepo: UserRepository }) {
  const app = express();
  app.use(express.json());
  app.use(requestLogger);
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });
  app.use("/api", userRoutes(deps.userRepo));
  app.use(errorHandler);
  return app;
}
