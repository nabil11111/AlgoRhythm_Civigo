"use server";

import { revalidatePath } from "next/cache";
import {
  getProfile,
  getServerClient,
  getServiceRoleClient,
} from "@/utils/supabase/server";

export async function getAppointmentFeedback(appointmentId: string) {
  const supabase = await getServerClient();
  const profile = await getProfile();

  if (!profile) {
    return { ok: false, error: "unauthorized" } as const;
  }

  // Check if user owns this appointment
  const { data: appointment } = await supabase
    .from("appointments")
    .select("id, citizen_id")
    .eq("id", appointmentId)
    .eq("citizen_id", profile.id)
    .maybeSingle();

  if (!appointment) {
    return { ok: false, error: "appointment_not_found" } as const;
  }

  // Get existing feedback
  const { data: feedback, error } = await supabase
    .from("appointment_feedback")
    .select("*")
    .eq("appointment_id", appointmentId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "not found"
    return { ok: false, error: "database_error" } as const;
  }

  return { ok: true, data: feedback } as const;
}

export async function submitAppointmentFeedback(
  prevState: any,
  formData: FormData
) {
  const supabase = await getServerClient();
  const serviceSupabase = getServiceRoleClient();
  const profile = await getProfile();

  if (!profile) {
    return { ok: false, error: "unauthorized" } as const;
  }

  if (!serviceSupabase) {
    return { ok: false, error: "server_misconfigured" } as const;
  }

  const appointmentId = formData.get("appointmentId") as string;
  const rating = parseInt(formData.get("rating") as string);
  const comment = formData.get("comment") as string;
  const imageCount = parseInt((formData.get("image_count") as string) || "0");

  // Validate input
  if (!appointmentId) {
    return { ok: false, error: "appointment_id_required" } as const;
  }

  if (!rating || rating < 1 || rating > 5) {
    return { ok: false, error: "invalid_rating" } as const;
  }

  // Check if user owns this appointment and it's completed
  const { data: appointment } = await supabase
    .from("appointments")
    .select("id, citizen_id, status")
    .eq("id", appointmentId)
    .eq("citizen_id", profile.id)
    .maybeSingle();

  if (!appointment) {
    return { ok: false, error: "appointment_not_found" } as const;
  }

  if (appointment.status !== "completed") {
    return { ok: false, error: "appointment_not_completed" } as const;
  }

  try {
    // Upload images to feedback bucket if provided
    let uploadedPaths: string[] = [];
    const uploadErrors: string[] = [];

    if (imageCount > 0) {
      for (let i = 0; i < imageCount; i++) {
        const file = formData.get(`image_${i}`) as File;
        if (!file || file.size === 0) continue;

        const timestamp = Date.now();
        const fileExt = file.type.includes("png") ? "png" : "jpg";
        const fileName = `${appointment.id}-${timestamp}-${i}.${fileExt}`;

        const { error: uploadError } = await serviceSupabase.storage
          .from("feedback")
          .upload(fileName, file, {
            contentType: file.type || "application/octet-stream",
            upsert: false,
          });

        if (uploadError) {
          uploadErrors.push(
            `Failed to upload image ${i + 1}: ${uploadError.message}`
          );
        } else {
          uploadedPaths.push(fileName);
        }
      }
    }

    // Prepare media data
    const mediaData =
      uploadedPaths.length > 0 ? { images: uploadedPaths } : null;

    // Check if feedback already exists for this appointment
    const { data: existingFeedback } = await supabase
      .from("appointment_feedback")
      .select("id")
      .eq("appointment_id", appointmentId)
      .maybeSingle();

    let result;

    if (existingFeedback) {
      // Update existing feedback
      const { data: updatedFeedback, error: updateError } = await supabase
        .from("appointment_feedback")
        .update({
          rating,
          comment: comment?.trim() || null,
          media: mediaData,
        })
        .eq("appointment_id", appointmentId)
        .select("id")
        .single();

      if (updateError) {
        // Clean up uploaded files if database update fails
        for (const path of uploadedPaths) {
          await serviceSupabase.storage.from("feedback").remove([path]);
        }
        return {
          ok: false,
          error: `Database error: ${updateError.message}`,
        } as const;
      }

      result = updatedFeedback;
    } else {
      // Create new feedback
      const { data: newFeedback, error: insertError } = await supabase
        .from("appointment_feedback")
        .insert({
          appointment_id: appointmentId,
          rating,
          comment: comment?.trim() || null,
          media: mediaData,
        })
        .select("id")
        .single();

      if (insertError) {
        // Clean up uploaded files if database insert fails
        for (const path of uploadedPaths) {
          await serviceSupabase.storage.from("feedback").remove([path]);
        }
        return {
          ok: false,
          error: `Database error: ${insertError.message}`,
        } as const;
      }

      result = newFeedback;
    }

    revalidatePath(`/app/appointments/${appointmentId}`);

    return {
      ok: true,
      id: result.id,
      uploaded: uploadedPaths.length,
      errors: uploadErrors.length > 0 ? uploadErrors : undefined,
    } as const;
  } catch (error) {
    return {
      ok: false,
      error: `Unexpected error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    } as const;
  }
}

export async function getFeedbackImages(imagePaths: string[]) {
  const serviceSupabase = getServiceRoleClient();

  if (!serviceSupabase) {
    return { ok: false, error: "server_misconfigured" } as const;
  }

  try {
    const imageUrls: string[] = [];

    for (const path of imagePaths) {
      // Use signed URLs for private bucket access (expires in 1 hour)
      const { data, error } = await serviceSupabase.storage
        .from("feedback")
        .createSignedUrl(path, 3600); // 1 hour expiry

      if (error) {
        console.error(`Failed to create signed URL for ${path}:`, error);
        continue; // Skip this image but continue with others
      }

      if (data?.signedUrl) {
        imageUrls.push(data.signedUrl);
      }
    }

    return { ok: true, data: imageUrls } as const;
  } catch (error) {
    return {
      ok: false,
      error: `Failed to get image URLs: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    } as const;
  }
}
