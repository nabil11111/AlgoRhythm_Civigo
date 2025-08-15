import { z } from "zod";

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type SignInInput = z.infer<typeof SignInSchema>;

export const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type SignUpInput = z.infer<typeof SignUpSchema>;

export const SlotSelectSchema = z.object({
  slot_id: z.string().uuid(),
});
export type SlotSelectInput = z.infer<typeof SlotSelectSchema>;

export const BookAppointmentSchema = z.object({
  slot_id: z.string().uuid(),
  notes: z.string().max(1000).optional(),
});
export type BookAppointmentInput = z.infer<typeof BookAppointmentSchema>;


