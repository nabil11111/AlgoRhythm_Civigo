import { describe, it, expect, vi } from "vitest";
import { runAgent } from "@/app/api/agent/route";

vi.mock("@/app/(protected)/_agent_tools", () => ({
  getUserAppointments: vi.fn(async () => [{ id: "a1", appointment_at: new Date().toISOString(), status: "booked", reference_code: "REF1", service_id: "svc", slot_id: null }]),
  searchSlots: vi.fn(async () => [{ id: "s1", slot_at: new Date().toISOString(), capacity: 2, branch_id: "b1" }]),
  getServiceInstructions: vi.fn(async () => ({ serviceName: "Passport", branches: [], instructions_richtext: {}, instructions_pdf_url: undefined })),
  getUserDocuments: vi.fn(async () => [{ id: "d1", name: "NIC", type: "identity", created_at: new Date().toISOString() }]),
}));

describe("runAgent", () => {
  it("answers appointments", async () => {
    const res = await runAgent("What appointments do I have?", {});
    expect(res.answer).toMatch(/You have/);
  });

  it("answers slots", async () => {
    const from = new Date().toISOString();
    const to = new Date(Date.now() + 86400000).toISOString();
    const res = await runAgent("find slots", { serviceId: "svc", dateFromISO: from, dateToISO: to });
    expect(res.actions[0].type).toBe("showSlots");
  });

  it("answers documents/instructions", async () => {
    const res = await runAgent("What documents or instructions are needed?", { serviceId: "svc" });
    expect(res.actions.find((a) => a.type === "openService")).toBeTruthy();
  });
});


