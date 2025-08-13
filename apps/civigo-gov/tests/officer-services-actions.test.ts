import { describe, it, expect, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/utils/supabase/server", async (orig) => {
  const actual = await (orig as any)();
  function chainAssignment() {
    const o: any = {};
    o.eq = () => o;
    o.maybeSingle = async () => ({ data: { id: "oa1" } });
    return o;
  }
  return {
    ...actual,
    getProfile: vi.fn(async () => ({ id: "u1", role: "officer" })),
    getServerClient: vi.fn(async () => ({
      from: (table: string) => {
        if (table === "officer_assignments") return { select: () => chainAssignment() } as any;
        if (table === "services")
          return {
            insert: () => ({ select: () => ({ single: async () => ({ data: { id: "s1" } }) }) }),
            update: () => ({ eq: () => ({ eq: () => ({ error: null }) }) }),
            delete: () => ({ eq: () => ({ eq: () => ({ error: null }) }) }),
          } as any;
        return {} as any;
      },
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
