import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/utils/supabase/server", () => ({
  getProfile: vi.fn(async () => null),
  requireOfficer: vi.fn(async () => {
    const { getProfile } = await import("@/utils/supabase/server");
    const p = await (getProfile as unknown as () => Promise<any>)();
    if (!p || p.role !== "officer") return { ok: false as const, error: "forbidden" };
    return { ok: true as const, profile: p };
  }),
}));

describe("requireOfficer helper", () => {
  beforeEach(async () => {
    const mod = await import("@/utils/supabase/server");
    (mod.getProfile as unknown as ReturnType<typeof vi.fn>).mockReset();
  });

  it("returns forbidden when unauthenticated", async () => {
    const mod = await import("@/utils/supabase/server");
    (mod.getProfile as any).mockResolvedValueOnce(null);
    const res = await mod.requireOfficer();
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe("forbidden");
  });

  it("returns forbidden for admin", async () => {
    const mod = await import("@/utils/supabase/server");
    (mod.getProfile as any).mockResolvedValueOnce({ id: "u1", role: "admin" });
    const res = await mod.requireOfficer();
    expect(res.ok).toBe(false);
  });

  it("returns ok for officer", async () => {
    const mod = await import("@/utils/supabase/server");
    (mod.getProfile as any).mockResolvedValueOnce({
      id: "u2",
      role: "officer",
    });
    const res = await mod.requireOfficer();
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.profile.role).toBe("officer");
  });
});
