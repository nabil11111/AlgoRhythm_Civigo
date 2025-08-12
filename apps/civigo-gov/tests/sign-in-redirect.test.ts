import { describe, it, expect } from "vitest";

describe("sign-in page export", () => {
  it("module loads", async () => {
    const mod = await import("@/app/(auth)/sign-in/page");
    expect(mod).toBeTruthy();
  });
});


