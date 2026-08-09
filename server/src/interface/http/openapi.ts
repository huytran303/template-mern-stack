import { z } from "zod";
import { createDocument } from "zod-openapi";
import { CreateUser, ListUsersQuery, type User as DomainUser } from "../../domain/user.js";

// Wire shape of a domain type: Dates serialize to ISO strings in JSON.
type Wire<T> = { [K in keyof T]: T[K] extends Date ? string : T[K] };

// `satisfies` links this schema to the domain entity — adding a field to User breaks the build here.
const User = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.string().datetime(),
}) satisfies z.ZodType<Wire<DomainUser>>;

const ApiError = z.object({ error: z.string() });
const Health = z.object({ ok: z.boolean() });

export const openApiDocument = createDocument({
  openapi: "3.1.0",
  info: { title: "MERN Template API", version: "1.0.0" },
  servers: [{ url: "/api/v1" }],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: Health } },
          },
          "503": {
            description: "Database unreachable",
            content: { "application/json": { schema: Health } },
          },
        },
      },
    },
    "/users": {
      get: {
        summary: "List users",
        requestParams: { query: ListUsersQuery },
        responses: {
          "200": {
            description: "Newest users first, at most `limit` (default 20, max 100)",
            content: { "application/json": { schema: z.array(User) } },
          },
          "400": {
            description: "Invalid limit",
            content: { "application/json": { schema: ApiError } },
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
          "409": {
            description: "Email already registered",
            content: { "application/json": { schema: ApiError } },
          },
        },
      },
    },
  },
});
