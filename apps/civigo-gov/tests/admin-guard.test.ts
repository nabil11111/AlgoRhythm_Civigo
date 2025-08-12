import { requireAdmin } from "@/utils/supabase/server";

// Note: This is a lightweight test stub. In a full setup, you'd mock Supabase and Next redirect.
describe("admin guard", () => {
  it("exports requireAdmin function", () => {
    expect(typeof requireAdmin).toBe("function");
  });
});


