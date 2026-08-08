import express from "express";
import type { UserRepository } from "../../domain/user.js";
import { errorHandler, requestLogger } from "./middleware.js";
import { openApiDocument } from "./openapi.js";
import { userRoutes } from "./user-routes.js";

// ponytail: Swagger UI from CDN — vendor swagger-ui-dist locally if offline dev matters.
const docsHtml = `<!doctype html>
<html>
<head>
  <title>StarCi Shop API</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>SwaggerUIBundle({ url: "/docs/openapi.json", dom_id: "#swagger" });</script>
</body>
</html>`;

export function buildApp(deps: { userRepo: UserRepository }) {
  const app = express();
  app.use(express.json());
  app.use(requestLogger);
  app.get("/api/v1/health", (_req, res) => {
    res.json({ ok: true });
  });
  app.use("/api/v1", userRoutes(deps.userRepo));
  app.get("/docs/openapi.json", (_req, res) => {
    res.json(openApiDocument);
  });
  app.get("/docs", (_req, res) => {
    res.type("html").send(docsHtml);
  });
  app.use(errorHandler);
  return app;
}
