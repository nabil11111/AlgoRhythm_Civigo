import { describe, it, expect, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/utils/supabase/server", () => ({
  getServiceRoleClient: () => ({
    auth: {
      admin: {
        listUsers: async () => ({ data: { users: [{ id: "11111111-1111-1111-1111-111111111111", email: "o@ex.com" }] } }),
        createUser: async () => ({ data: { user: { id: "11111111-1111-1111-1111-111111111111" } } }),
        updateUserById: async () => ({ data: {} }),
      },
    },
    from: (table: string) => {
      if (table === "profiles") {
        return { upsert: () => ({ select: () => ({ single: async () => ({ data: { id: "11111111-1111-1111-1111-111111111111" } }) }) }) } as any;
      }
      if (table === "officer_assignments") {
        return { insert: async () => ({ error: null }) } as any;
      }
      return {} as any;
    },
  }),
  getServerClient: async () => ({ from: () => ({ insert: async () => ({ error: null }) }) }),
}));

describe("officers actions", () => {
  it("assignOfficerToDepartment ok", async () => {
    const { assignOfficerToDepartment } = await import(
      "@/app/(protected)/admin/officers/_actions"
    );
    const res = await assignOfficerToDepartment({
      officer_id: "11111111-1111-1111-1111-111111111111",
      department_id: "22222222-2222-2222-2222-222222222222",
    });
    expect(res.ok).toBe(true);
  });
  it("createOfficerProfile with temp password passes to Admin API", async () => {
    const { createOfficerProfile } = await import("@/app/(protected)/admin/officers/_actions");
    const res = await createOfficerProfile({ full_name: "Name", email: "o@ex.com", temporaryPassword: "password123" });
    expect(res.ok).toBe(true);
  });
  it("resetOfficerPassword updates via Admin API", async () => {
    const { resetOfficerPassword } = await import("@/app/(protected)/admin/officers/_actions");
    const res = await resetOfficerPassword({ user_id: "11111111-1111-1111-1111-111111111111", newPassword: "newpassword123" });
    expect(res.ok).toBe(true);
  });
  it("duplicate assignment maps to unique_violation", async () => {
    vi.resetModules();
    vi.doMock("@/utils/supabase/server", () => ({
      getServerClient: async () => ({ from: () => ({ insert: async () => ({ error: { code: "23505", message: "duplicate" } }) }) }),
      getServiceRoleClient: () => null,
    }));
    const { assignOfficerToDepartment } = await import("@/app/(protected)/admin/officers/_actions");
    const res = await assignOfficerToDepartment({ officer_id: "11111111-1111-1111-1111-111111111111", department_id: "22222222-2222-2222-2222-222222222222" });
    expect(res.ok).toBe(false);
    expect(res.error).toBe("unique_violation");
  });
});
