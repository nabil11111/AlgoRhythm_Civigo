import { describe, it, expect, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/utils/supabase/server", () => ({
  getServiceRoleClient: () => ({
    auth: {
      admin: {
        listUsers: async () => ({ data: { users: [{ id: "u1", email: "o@ex.com" }] } }),
        createUser: async () => ({ data: { user: { id: "u1" } } }),
        updateUserById: async () => ({ data: {} }),
      },
    },
    from: () => ({ upsert: () => ({ select: () => ({ single: async () => ({ data: { id: "u1" } }) }) }) }),
  }),
  getServerClient: async () => ({ from: () => ({ insert: async () => ({ error: null }) }) }),
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
  it("createOfficerProfile with temp password passes to Admin API", async () => {
    const { createOfficerProfile } = await import("@/app/(protected)/admin/officers/_actions");
    const res = await createOfficerProfile({ full_name: "Name", email: "o@ex.com", temporaryPassword: "password123" });
    expect(res.ok).toBe(true);
  });
  it("resetOfficerPassword updates via Admin API", async () => {
    const { resetOfficerPassword } = await import("@/app/(protected)/admin/officers/_actions");
    const res = await resetOfficerPassword({ user_id: "u1", newPassword: "newpassword123" });
    expect(res.ok).toBe(true);
  });
  it("duplicate assignment maps to unique_violation", async () => {
    vi.resetModules();
    vi.doMock("@/utils/supabase/server", () => ({
      getServerClient: async () => ({ from: () => ({ insert: async () => ({ error: { code: "23505", message: "duplicate" } }) }) }),
      getServiceRoleClient: () => null,
    }));
    const { assignOfficerToDepartment } = await import("@/app/(protected)/admin/officers/_actions");
    const res = await assignOfficerToDepartment({ officer_id: "u1", department_id: "d1" });
    expect(res.ok).toBe(false);
    expect(res.error).toBe("unique_violation");
  });
});
