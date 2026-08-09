import { Router } from "express";
import type { UserRepository } from "../../domain/user.js";
import { listUsers, registerUser } from "../../usecase/users.js";

export function userRoutes(repo: UserRepository): Router {
  const router = Router();

  router.get("/users", async (_req, res) => {
    res.json(await listUsers(repo));
  });

  router.post("/users", async (req, res) => {
    const user = await registerUser(repo, req.body); // validated against CreateUser in the domain
    res.status(201).json(user);
  });

  return router;
}
