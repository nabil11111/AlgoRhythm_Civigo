import { describe, it, expect, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/utils/supabase/server", () => ({
  getServerClient: async () => ({
    from: () => ({
      insert: () => ({
        select: () => ({ single: async () => ({ data: { id: "x" } }) }),
      }),
    }),
  }),
}));

describe("departments actions", () => {
  it("createDepartment returns ok", async () => {
    const { createDepartment } = await import(
      "@/app/(protected)/admin/departments/_actions"
    );
    const res = await createDepartment({ code: "IMMIG", name: "Immigration" });
    expect(res.ok).toBe(true);
  });
});
