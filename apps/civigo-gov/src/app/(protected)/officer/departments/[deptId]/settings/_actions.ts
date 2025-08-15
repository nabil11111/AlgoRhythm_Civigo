"use server";

import { getProfile, getServerClient } from "@/utils/supabase/server";
import { DepartmentLogoUploadSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function uploadDepartmentLogo(formData: FormData) {
  const profile = await getProfile();
  if (!profile || profile.role !== "officer") {
    throw new Error("Unauthorized");
  }

  const file = formData.get("file") as File;
  const deptId = formData.get("deptId") as string;

  if (!file || !deptId) {
    throw new Error("Missing required fields");
  }

  // Validate the input
  const validation = DepartmentLogoUploadSchema.safeParse({
    deptId,
    filename: file.name,
    contentType: file.type,
    size: file.size,
  });

  if (!validation.success) {
    throw new Error(`Validation failed: ${validation.error.message}`);
  }

  const supabase = await getServerClient();

  // Verify officer has access to this department
  const { data: assignment } = await supabase
    .from("officer_assignments")
    .select("id")
    .eq("officer_id", profile.id)
    .eq("department_id", deptId)
    .eq("active", true)
    .maybeSingle();

  if (!assignment) {
    throw new Error("Access denied to this department");
  }

  // Get department code for filename
  const { data: department } = await supabase
    .from("departments")
    .select("code")
    .eq("id", deptId)
    .single();

  if (!department) {
    throw new Error("Department not found");
  }

  try {
    // Generate filename with department code and trim spaces
    const extension = file.name.split('.').pop();
    const deptCode = department.code.trim().replace(/\s+/g, '-'); // Replace spaces with hyphens
    const filename = `logo-${deptCode}.${extension}`;
    const path = `logos/${filename}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("departments")
      .upload(path, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Update the department record with just the file path
    const { error: updateError } = await supabase
      .from("departments")
      .update({ logo_path: path })
      .eq("id", deptId);

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    revalidatePath(`/officer/departments/${deptId}/settings`);
    revalidatePath(`/officer/departments/${deptId}`);
    
    return { success: true, logoPath: path };
  } catch (error) {
    console.error("Logo upload error:", error);
    throw error;
  }
}

export async function updateDepartmentDescription(formData: FormData) {
  const profile = await getProfile();
  if (!profile || profile.role !== "officer") {
    throw new Error("Unauthorized");
  }

  const description = formData.get("description") as string;
  const deptId = formData.get("deptId") as string;

  if (!deptId) {
    throw new Error("Missing department ID");
  }

  const supabase = await getServerClient();

  // Verify officer has access to this department
  const { data: assignment } = await supabase
    .from("officer_assignments")
    .select("id")
    .eq("officer_id", profile.id)
    .eq("department_id", deptId)
    .eq("active", true)
    .maybeSingle();

  if (!assignment) {
    throw new Error("Access denied to this department");
  }

  try {
    // Create simple rich text structure
    const richTextContent = {
      type: "doc",
      content: description ? [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: description
            }
          ]
        }
      ] : []
    };

    // Update the department record
    const { error: updateError } = await supabase
      .from("departments")
      .update({ 
        description_richtext: richTextContent,
        description_updated_at: new Date().toISOString()
      })
      .eq("id", deptId);

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    revalidatePath(`/officer/departments/${deptId}/settings`);
    revalidatePath(`/officer/departments/${deptId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Description update error:", error);
    throw error;
  }
}

export async function removeDepartmentLogo(deptId: string) {
  const profile = await getProfile();
  if (!profile || profile.role !== "officer") {
    throw new Error("Unauthorized");
  }

  const supabase = await getServerClient();

  // Verify officer has access to this department
  const { data: assignment } = await supabase
    .from("officer_assignments")
    .select("id")
    .eq("officer_id", profile.id)
    .eq("department_id", deptId)
    .eq("active", true)
    .maybeSingle();

  if (!assignment) {
    throw new Error("Access denied to this department");
  }

  try {
    // Get current logo path
    const { data: dept } = await supabase
      .from("departments")
      .select("logo_path")
      .eq("id", deptId)
      .single();

    // Remove from storage if exists
    if (dept?.logo_path) {
      // logo_path is now stored as just the file path (e.g., "logos/dept-id/logo.123.jpg")
      await supabase.storage
        .from("departments")
        .remove([dept.logo_path]);
    }

    // Update the department record
    const { error: updateError } = await supabase
      .from("departments")
      .update({ logo_path: null })
      .eq("id", deptId);

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    revalidatePath(`/officer/departments/${deptId}/settings`);
    revalidatePath(`/officer/departments/${deptId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Logo removal error:", error);
    throw error;
  }
}
