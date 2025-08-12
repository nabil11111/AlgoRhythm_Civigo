import { z } from "zod";

export const DepartmentCreateSchema = z.object({
  code: z.string().min(2).max(32),
  name: z.string().min(2).max(120),
});

export const DepartmentUpdateSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(2).max(32).optional(),
  name: z.string().min(2).max(120).optional(),
});

export const OfficerCreateSchema = z.object({
  full_name: z.string().min(2).max(120),
  email: z.string().email(),
});

export const OfficerAssignSchema = z.object({
  officer_id: z.string().uuid(),
  department_id: z.string().uuid(),
});

export const OfficerToggleSchema = z.object({
  officer_id: z.string().uuid(),
  department_id: z.string().uuid(),
  active: z.boolean(),
});

export type DepartmentCreateInput = z.infer<typeof DepartmentCreateSchema>;
export type DepartmentUpdateInput = z.infer<typeof DepartmentUpdateSchema>;
export type OfficerCreateInput = z.infer<typeof OfficerCreateSchema>;
export type OfficerAssignInput = z.infer<typeof OfficerAssignSchema>;
export type OfficerToggleInput = z.infer<typeof OfficerToggleSchema>;


