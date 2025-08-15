import { describe, it, expect, vi, beforeEach } from "vitest";

const redirectMock = vi.fn();
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

vi.mock("@/utils/supabase/server", async (orig) => {
  const actual = await (orig as any)();
  return {
    ...actual,
    getServerClient: vi.fn(async () => ({
      from: () => ({
        select: () => ({
          eq: () => ({
            data: [
              { departments: { id: "d1", code: "IMMIG", name: "Immigration" } },
            ],
          }),
        }),
      }),
    })),
  };
});

describe("officer landing", () => {
  beforeEach(() => {
    redirectMock.mockReset();
  });

  it("module loads", async () => {
    const mod = await import("@/app/(protected)/officer/page");
    expect(mod).toBeTruthy();
  });
});
