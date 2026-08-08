import type { NextFunction, Request, Response } from "express";
import { DomainError } from "../../domain/errors.js";

// Performance/access log: one JSON line per request with duration.
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = performance.now();
  res.on("finish", () => {
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration_ms: Math.round(performance.now() - start),
      }),
    );
  });
  next();
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof DomainError) {
    res.status(400).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "internal server error" });
}
