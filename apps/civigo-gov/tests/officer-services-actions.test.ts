import { describe, it, expect, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/utils/supabase/server", async (orig) => {
  const actual = await (orig as any)();
  return {
    ...actual,
    getProfile: vi.fn(async () => ({ id: "u1", role: "officer" })),
    getServerClient: vi.fn(async () => ({
      from: () => ({
        insert: () => ({
          select: () => ({ single: async () => ({ data: { id: "s1" } }) }),
        }),
        update: () => ({ eq: () => ({ eq: () => ({ error: null }) }) }),
        delete: () => ({ eq: () => ({ eq: () => ({ error: null }) }) }),
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: { id: "oa1" } }) }),
        }),
      }),
    })),
  };
});

describe("services actions", () => {
  it("createService ok", async () => {
    const { createService } = await import(
      "@/app/(protected)/officer/departments/[deptId]/services/_actions"
    );
    const res = await createService({ deptId: "d1", code: "X", name: "Name" });
    expect(res.ok).toBe(true);
  });
});
