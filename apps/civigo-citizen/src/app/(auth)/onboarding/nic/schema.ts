import { z } from "zod";

export const oldNic = z.string().regex(/^[0-9]{9}[VXvx]$/);
export const newNic = z.string().regex(/^[0-9]{12}$/);
export const nicSchema = z.object({ nic: z.union([oldNic, newNic]) });


