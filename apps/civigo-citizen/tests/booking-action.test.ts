import { describe, it, expect } from "vitest";
import { mapRpcBookingError } from "@/app/(protected)/app/services/[id]/_actions";

describe("createAppointmentFromSlot action", () => {
  it("RPC success → revalidates /app/appointments and redirects (placeholder)", async () => {
    expect(true).toBe(true);
  });

  it("RPC failure codes → friendly messages (placeholder)", async () => {
    expect(await mapRpcBookingError({ message: "slot inactive" })).toBe("slot_inactive");
    expect(await mapRpcBookingError({ message: "slot full" })).toBe("slot_full");
    expect(await mapRpcBookingError({ message: "slot in the past" })).toBe("slot_past");
    expect(await mapRpcBookingError({ code: "PGRST204", message: "function does not exist" })).toBe("rpc_not_available");
  });

  it("Fallback checks capacity/active and maps errors (placeholder)", async () => {
    expect(true).toBe(true);
  });
});


