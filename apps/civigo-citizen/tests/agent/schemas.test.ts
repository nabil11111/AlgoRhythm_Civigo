import { describe, it, expect } from "vitest";
import { AgentRequestSchema, AgentResponseSchema } from "@/lib/agent/schemas";

describe("Agent schemas", () => {
  it("valid AgentRequestSchema", () => {
    const parsed = AgentRequestSchema.safeParse({
      message: "Find slots",
      context: {
        serviceId: "svc-1",
        dateFromISO: new Date().toISOString(),
        dateToISO: new Date(Date.now() + 86400000).toISOString(),
      },
    });
    expect(parsed.success).toBe(true);
  });

  it("valid AgentResponseSchema", () => {
    const parsed = AgentResponseSchema.safeParse({ answer: "ok", actions: [] });
    expect(parsed.success).toBe(true);
  });
});
