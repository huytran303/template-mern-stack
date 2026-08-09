import type { NextFunction, Request, Response } from "express";
import { DomainError } from "../../domain/errors.js";

// Performance/access log: one JSON line per request with duration.
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = performance.now();
  const { method, originalUrl } = req; // captured now — express rewrites req.path per router
  res.on("finish", () => {
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        method,
        path: originalUrl,
        status: res.statusCode,
        duration_ms: Math.round(performance.now() - start),
      }),
    );
  });
  next();
}

function clientErrorStatus(err: unknown): number | undefined {
  if (typeof err !== "object" || err === null) return undefined;
  const { status, statusCode } = err as { status?: unknown; statusCode?: unknown };
  const code = typeof status === "number" ? status : statusCode;
  return typeof code === "number" && code >= 400 && code < 500 ? code : undefined;
}

export function errorHandler(err: unknown, _req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) return next(err); // too late to write a body — let express close the socket
  if (err instanceof DomainError) {
    res.status(400).json({ error: err.message });
    return;
  }
  // Framework 4xx (body-parser 400/413/415, http-errors) carry status/statusCode — keep them 4xx.
  const status = clientErrorStatus(err);
  if (status !== undefined) {
    res.status(status).json({ error: err instanceof Error ? err.message : "bad request" });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "internal server error" });
}
