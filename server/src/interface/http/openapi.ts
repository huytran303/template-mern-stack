import { z } from "zod";
import { createDocument } from "zod-openapi";

const User = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.string().datetime(),
});

const CreateUser = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

const ApiError = z.object({ error: z.string() });

export const openApiDocument = createDocument({
  openapi: "3.1.0",
  info: { title: "StarCi Shop API", version: "1.0.0" },
  servers: [{ url: "/api/v1" }],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: z.object({ ok: z.boolean() }) } },
          },
        },
      },
    },
    "/users": {
      get: {
        summary: "List users",
        responses: {
          "200": {
            description: "All users",
            content: { "application/json": { schema: z.array(User) } },
          },
        },
      },
      post: {
        summary: "Register a user",
        requestBody: {
          content: { "application/json": { schema: CreateUser } },
        },
        responses: {
          "201": {
            description: "Created user",
            content: { "application/json": { schema: User } },
          },
          "400": {
            description: "Validation error",
            content: { "application/json": { schema: ApiError } },
          },
        },
      },
    },
  },
});
