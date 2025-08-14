import { describe, it, expect } from "vitest";
import { nicSchema } from "@/app/(auth)/onboarding/nic/_actions";

describe("NIC validation", () => {
  it("accepts old NIC with V/X", () => {
    expect(nicSchema.safeParse({ nic: "123456789V" }).success).toBe(true);
    expect(nicSchema.safeParse({ nic: "123456789x" }).success).toBe(true);
  });
  it("accepts new 12-digit NIC", () => {
    expect(nicSchema.safeParse({ nic: "199012341234" }).success).toBe(true);
  });
  it("rejects invalid formats", () => {
    expect(nicSchema.safeParse({ nic: "ABC" }).success).toBe(false);
  });
});


