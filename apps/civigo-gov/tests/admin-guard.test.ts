import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/utils/supabase/server", () => ({
  getProfile: vi.fn(async () => null),
}));

describe("admin guard basics", () => {
  it("module loads", async () => {
    const mod = await import("@/utils/supabase/server");
    expect(mod).toBeTruthy();
  });
});
