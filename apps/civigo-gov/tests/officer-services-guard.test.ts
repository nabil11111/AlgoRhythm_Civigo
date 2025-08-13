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

describe("services guard", () => {
  beforeEach(() => {
    redirectMock.mockReset();
  });

  it("module loads", async () => {
    const mod = await import(
      "@/app/(protected)/officer/departments/[deptId]/services/page"
    );
    expect(mod).toBeTruthy();
  });
});
