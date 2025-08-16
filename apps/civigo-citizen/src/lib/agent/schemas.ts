import { z } from "zod";

export const ServiceIdSchema = z.string().min(1);
export const BranchIdSchema = z.string().min(1);
export const SlotIdSchema = z.string().uuid();
export const IsoDateSchema = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid ISO date");

export const AgentContextSchema = z.object({
  serviceId: ServiceIdSchema.optional(),
  branchId: BranchIdSchema.optional(),
  dateFromISO: IsoDateSchema.optional(),
  dateToISO: IsoDateSchema.optional(),
});

export const AgentRequestSchema = z.object({
  message: z.string().min(1),
  context: AgentContextSchema.optional(),
});

export const AgentActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("selectBranch"),
    params: z.object({ branchId: z.string(), branchName: z.string() }),
  }),
  z.object({
    type: z.literal("selectDateRange"),
    params: z.object({ fromISO: IsoDateSchema, toISO: IsoDateSchema }),
  }),
  z.object({
    type: z.literal("showSlots"),
    params: z.object({
      serviceId: ServiceIdSchema,
      branchId: BranchIdSchema.optional(),
      fromISO: IsoDateSchema,
      toISO: IsoDateSchema,
    }),
  }),
  z.object({
    type: z.literal("book"),
    params: z.object({ slotId: SlotIdSchema }),
  }),
  z.object({
    type: z.literal("openService"),
    params: z.object({ serviceId: ServiceIdSchema }),
  }),
  z.object({
    type: z.literal("openAppointments"),
    params: z.record(z.unknown()).optional(),
  }),
]);

export const AgentResponseSchema = z.object({
  answer: z.string(),
  actions: z.array(AgentActionSchema),
  missing: z
    .object({
      serviceId: z.boolean().optional(),
      branchId: z.boolean().optional(),
      dateRange: z.boolean().optional(),
    })
    .optional(),
});
