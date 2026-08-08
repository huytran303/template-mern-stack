import { describe, expect, it } from "vitest";
import { openApiDocument } from "../../src/interface/http/openapi.js";

describe("openapi document", () => {
  it("describes every /api/v1 route", () => {
    expect(Object.keys(openApiDocument.paths ?? {})).toEqual(["/health", "/users"]);
    expect(openApiDocument.servers?.[0]?.url).toBe("/api/v1");
  });
});
