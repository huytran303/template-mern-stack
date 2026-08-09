import express from "express";
import type { UserRepository } from "../../domain/user.js";
import { errorHandler, requestLogger } from "./middleware.js";
import { openApiDocument } from "./openapi.js";
import { userRoutes } from "./user-routes.js";

// Serialized once — the document never changes after boot.
const openApiJson = JSON.stringify(openApiDocument);

// ponytail: Swagger UI from CDN (version pinned) — vendor swagger-ui-dist locally if offline dev matters.
const docsHtml = `<!doctype html>
<html>
<head>
  <title>${openApiDocument.info.title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" />
</head>
<body>
  <div id="swagger"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
  <script>SwaggerUIBundle({ url: "/docs/openapi.json", dom_id: "#swagger" });</script>
</body>
</html>`;

export function buildApp(deps: { userRepo: UserRepository; dbReady: () => boolean }) {
  const app = express();
  app.use(requestLogger); // before body parsing, so requests the parser rejects still get a log line
  app.use(express.json());
  app.get("/api/v1/health", (_req, res) => {
    const ok = deps.dbReady(); // 503 when the DB is down, so orchestrators stop routing here
    res.status(ok ? 200 : 503).json({ ok });
  });
  app.use("/api/v1", userRoutes(deps.userRepo));
  app.get("/docs/openapi.json", (_req, res) => {
    res.type("json").send(openApiJson);
  });
  app.get("/docs", (_req, res) => {
    res.type("html").send(docsHtml);
  });
  app.use((_req, res) => {
    res.status(404).json({ error: "not found" }); // keep the {error} JSON contract on unknown paths
  });
  app.use(errorHandler);
  return app;
}
