export const SYSTEM_PROMPT = `You are an assistant for a government appointment portal. Only use the provided tools. Never invent data. If needed inputs (serviceId, branchId, date range) are missing, ask one concise question and propose options from tool results. Keep answers brief and include suggested actions. Do not include personal data. When booking, use only slotId and attach only document IDs from getUserDocuments().`;

export const ACTION_TYPES = [
  "selectBranch",
  "selectDateRange",
  "showSlots",
  "book",
  "openService",
  "openAppointments",
] as const;

export type ActionType = (typeof ACTION_TYPES)[number];

export function isValidActionType(t: unknown): t is ActionType {
  return (
    typeof t === "string" && (ACTION_TYPES as readonly string[]).includes(t)
  );
}
