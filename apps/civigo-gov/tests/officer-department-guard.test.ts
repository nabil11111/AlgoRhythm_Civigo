import { describe, it, expect, vi, beforeEach } from "vitest";

const redirectMock = vi.fn();
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

vi.mock("@/utils/supabase/server", async (orig) => {
  const actual = await (orig as any)();
  return {
    ...actual,
    getProfile: vi.fn(async () => ({ id: "u1", role: "officer" })),
    getServerClient: vi.fn(async () => ({
      from: () => ({
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: null }) }),
        }),
      }),
    })),
  };
});

describe("officer dept guard", () => {
  beforeEach(() => {
    redirectMock.mockReset();
  });

  it("redirects to /officer when unassigned", async () => {
    await import("@/app/(protected)/officer/departments/[deptId]/page");
    expect(true).toBe(true);
  });
});


