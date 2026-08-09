import type { Request, Response } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "../../src/domain/errors.js";
import { errorHandler } from "../../src/interface/http/middleware.js";

function run(err: unknown) {
  const out = { status: 0, body: undefined as unknown };
  const res = {
    headersSent: false,
    status(code: number) {
      out.status = code;
      return this;
    },
    json(body: unknown) {
      out.body = body;
    },
  };
  errorHandler(err, {} as Request, res as unknown as Response, () => undefined);
  return out;
}

describe("errorHandler", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps DomainError kinds to statuses with the domain message", () => {
    expect(run(new DomainError("invalid email"))).toEqual({
      status: 400,
      body: { error: "invalid email" },
    });
    expect(run(new DomainError("email already registered", "conflict")).status).toBe(409);
    expect(run(new DomainError("user not found", "not_found")).status).toBe(404);
  });

  it("keeps framework 4xx statuses but never echoes err.message, and logs the cause", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const err = Object.assign(new Error('Unexpected token, "SECRET" is not valid JSON'), {
      status: 400,
    });
    expect(run(err)).toEqual({ status: 400, body: { error: "bad request" } });
    expect(warn).toHaveBeenCalledOnce();
  });

  it("maps everything else to a generic 500 and logs it", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(run(new Error("db exploded"))).toEqual({
      status: 500,
      body: { error: "internal server error" },
    });
    expect(error).toHaveBeenCalledOnce();
  });
});
