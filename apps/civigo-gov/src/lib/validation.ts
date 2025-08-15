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

// Branches
export const BranchCreateSchema = z.object({
  department_id: z.string().uuid(),
  code: z
    .string()
    .min(1)
    .max(32)
    .regex(/^[a-z0-9-]+$/i, { message: "Use letters, numbers, and hyphens" }),
  name: z.string().min(2).max(120),
  address: z.string().optional(),
  meta: z.record(z.string(), z.any()).optional().nullable(),
});

export const BranchUpdateSchema = z.object({
  id: z.string().uuid(),
  department_id: z.string().uuid(),
  code: z
    .string()
    .min(1)
    .max(32)
    .regex(/^[a-z0-9-]+$/i, { message: "Use letters, numbers, and hyphens" })
    .optional(),
  name: z.string().min(2).max(120).optional(),
  address: z.string().optional().nullable(),
  meta: z.record(z.string(), z.any()).optional().nullable(),
});

export const BranchDeleteSchema = z.object({
  id: z.string().uuid(),
  department_id: z.string().uuid(),
});

// Rich text JSON (Tiptap) for departments/services
export const DepartmentDescriptionSchema = z.object({
  id: z.string().uuid(),
  description_richtext: z.any(),
});

export const DepartmentLogoUploadSchema = z.object({
  deptId: z.string().uuid(),
  filename: z.string().min(1),
  contentType: z.string().regex(/^image\/(jpeg|png|gif|webp)$/i),
  size: z.number().int().positive().max(5_000_000), // 5MB
});

export const DepartmentDescriptionUpdateSchema = z.object({
  deptId: z.string().uuid(),
  description_richtext: z.any(),
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

export const OfficerAppointmentParam = z.object({
  deptId: z.string().uuid(),
  appointmentId: z.string().uuid(),
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
export type OfficerAppointmentParamInput = z.infer<
  typeof OfficerAppointmentParam
>;
export type ServiceCreateInput = z.infer<typeof ServiceCreateSchema>;
export type ServiceUpdateInput = z.infer<typeof ServiceUpdateSchema>;
export type ServiceDeleteInput = z.infer<typeof ServiceDeleteSchema>;

export type BranchCreateInput = z.infer<typeof BranchCreateSchema>;
export type BranchUpdateInput = z.infer<typeof BranchUpdateSchema>;
export type BranchDeleteInput = z.infer<typeof BranchDeleteSchema>;
export type DepartmentDescriptionInput = z.infer<
  typeof DepartmentDescriptionSchema
>;
