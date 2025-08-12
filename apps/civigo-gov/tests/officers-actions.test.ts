import { describe, it, expect, vi } from "vitest";

vi.mock("@/utils/supabase/server", () => ({
  getServiceRoleClient: () => ({
    auth: {
      admin: {
        listUsers: async () => ({
          data: { users: [{ id: "u1", email: "o@ex.com" }] },
        }),
      },
    },
    from: () => ({
      upsert: () => ({
        select: () => ({ single: async () => ({ data: { id: "u1" } }) }),
      }),
    }),
  }),
  getServerClient: async () => ({ from: () => ({}) }),
}));

describe("officers actions", () => {
  it("assignOfficerToDepartment ok", async () => {
    const { assignOfficerToDepartment } = await import(
      "@/app/(protected)/admin/officers/_actions"
    );
    const res = await assignOfficerToDepartment({
      officer_id: "u1",
      department_id: "d1",
    });
    expect(res.ok).toBe(true);
  });
});
