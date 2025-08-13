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
  temporaryPassword: z.string().min(8).optional(),
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

export const OfficerResetPasswordSchema = z.object({
  user_id: z.string().uuid(),
  newPassword: z.string().min(8),
});

export const OfficerDepartmentParam = z.object({
  deptId: z.string().uuid(),
});

export const ServiceCreateSchema = z.object({
  deptId: z.string().uuid(),
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
});

export const ServiceUpdateSchema = z.object({
  id: z.string().uuid(),
  deptId: z.string().uuid(),
  code: z.string().min(1).max(50).optional(),
  name: z.string().min(1).max(200).optional(),
});

export const ServiceDeleteSchema = z.object({
  id: z.string().uuid(),
  deptId: z.string().uuid(),
});

export type DepartmentCreateInput = z.infer<typeof DepartmentCreateSchema>;
export type DepartmentUpdateInput = z.infer<typeof DepartmentUpdateSchema>;
export type OfficerCreateInput = z.infer<typeof OfficerCreateSchema>;
export type OfficerAssignInput = z.infer<typeof OfficerAssignSchema>;
export type OfficerToggleInput = z.infer<typeof OfficerToggleSchema>;
export type OfficerResetPasswordInput = z.infer<
  typeof OfficerResetPasswordSchema
>;
export type OfficerDepartmentParamInput = z.infer<
  typeof OfficerDepartmentParam
>;
export type ServiceCreateInput = z.infer<typeof ServiceCreateSchema>;
export type ServiceUpdateInput = z.infer<typeof ServiceUpdateSchema>;
export type ServiceDeleteInput = z.infer<typeof ServiceDeleteSchema>;
