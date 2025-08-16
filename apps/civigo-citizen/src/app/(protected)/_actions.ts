"use server";

import { redirect } from "next/navigation";
import { getServerClient } from "@/utils/supabase/server";
import { getServiceRoleClient } from "@/utils/supabase/server";

export async function signOut() {
  const supabase = await getServerClient();
  await supabase.auth.signOut();
  redirect("/onboarding/welcome");
}

export async function getUserNicImages() {
  const supabase = await getServerClient();
  // Note: We use the regular client first to check auth, then service role for storage access

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" } as const;

  // Get user's NIC document entries
  const { data: docs } = await supabase
    .from("documents")
    .select("title, storage_path")
    .eq("owner_user_id", user.id)
    .in("title", ["NIC Front Image", "NIC Back Image"]);

  if (!docs || docs.length === 0) {
    return { ok: false, error: "no_nic_images" } as const;
  }

  // Generate signed URLs for the images using service role client to bypass RLS
  const serviceSupabase = getServiceRoleClient();
  if (!serviceSupabase) {
    return { ok: false, error: "server_misconfigured" } as const;
  }

  const signedUrls: Record<string, string> = {};
  const errors: string[] = [];

  for (const doc of docs) {
    const { data: signed, error } = await serviceSupabase.storage
      .from("nic-media")
      .createSignedUrl(doc.storage_path, 3600); // 1 hour expiry

    if (error) {
      errors.push(`Failed to sign ${doc.title}: ${error.message}`);
      continue;
    }

    if (signed?.signedUrl) {
      const key = doc.title === "NIC Front Image" ? "front" : "back";
      signedUrls[key] = signed.signedUrl;
    } else {
      errors.push(`No signed URL returned for ${doc.title}`);
    }
  }

  // If we have some signed URLs, return them even if some failed
  if (Object.keys(signedUrls).length > 0) {
    return {
      ok: true,
      images: signedUrls,
      warnings: errors.length > 0 ? errors : undefined,
    } as const;
  }

  // If no signed URLs were generated, return error
  return {
    ok: false,
    error: errors.length > 0 ? errors.join("; ") : "failed_to_generate_urls",
  } as const;
}

export async function getUserDocuments() {
  const supabase = await getServerClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" } as const;

  // Get user's documents
  const { data: docs, error } = await supabase
    .from("documents")
    .select("id, title, storage_path, mime_type, created_at")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false, error: "fetch_failed" } as const;
  }

  // Transform documents for UI
  const documents: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    created_at: string;
  }> = [];

  // Check if we have NIC images but no main NIC document
  const nicImages =
    docs?.filter(
      (doc) => doc.title === "NIC Front Image" || doc.title === "NIC Back Image"
    ) || [];

  const hasMainNicDoc = docs?.some((doc) => doc.title === "Identity: NIC");

  // If we have NIC images but no main document, create a virtual main document
  if (nicImages.length > 0 && !hasMainNicDoc) {
    documents.push({
      id: "nic-virtual", // Virtual ID to identify this as the main NIC document
      name: "National Identity Card (NIC)",
      type: "identity",
      status: "verified",
      created_at: nicImages[0].created_at,
    });
  }

  // Process all other documents
  docs?.forEach((doc) => {
    let type = "document";
    let displayName = doc.title;

    // Categorize documents based on title
    if (
      doc.title.toLowerCase().includes("nic") ||
      doc.title.toLowerCase().includes("identity")
    ) {
      type = "identity";
      if (doc.title === "Identity: NIC") {
        displayName = "National Identity Card (NIC)";
      } else if (
        doc.title === "NIC Front Image" ||
        doc.title === "NIC Back Image"
      ) {
        // Skip individual image entries, they'll be shown within the main NIC document
        return;
      }
    } else if (doc.title.toLowerCase().includes("license")) {
      type = "license";
    } else if (doc.title.toLowerCase().includes("passport")) {
      type = "travel";
    }

    documents.push({
      id: doc.id,
      name: displayName,
      type,
      status: "verified", // All documents in the system are verified
      created_at: doc.created_at,
    });
  });

  return { ok: true, documents } as const;
}

export async function getAppointmentDocuments(appointmentId: string) {
  const supabase = await getServerClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" } as const;

  // Verify appointment belongs to user
  const { data: appointment } = await supabase
    .from("appointments")
    .select("id")
    .eq("id", appointmentId)
    .eq("citizen_id", user.id)
    .maybeSingle();

  if (!appointment) {
    return { ok: false, error: "appointment_not_found" } as const;
  }

  // Get appointment documents with document details
  const { data: appointmentDocs, error } = await supabase
    .from("appointment_documents")
    .select(
      `
      id,
      documents:document_id (
        id,
        title,
        storage_path,
        mime_type,
        created_at
      )
    `
    )
    .eq("appointment_id", appointmentId);

  if (error) {
    return { ok: false, error: "fetch_failed" } as const;
  }

  // Transform for UI
  const documents =
    appointmentDocs?.map((ad: any) => ({
      appointmentDocumentId: ad.id,
      id: ad.documents.id,
      name: ad.documents.title,
      type: ad.documents.title.includes("NIC") ? "identity" : "document",
      status: "attached",
      created_at: ad.documents.created_at,
    })) || [];

  return { ok: true, documents } as const;
}

export async function addDocumentToAppointment(
  appointmentId: string,
  documentId: string
) {
  const supabase = await getServerClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" } as const;

  // Verify appointment belongs to user
  const { data: appointment } = await supabase
    .from("appointments")
    .select("id")
    .eq("id", appointmentId)
    .eq("citizen_id", user.id)
    .maybeSingle();

  if (!appointment) {
    return { ok: false, error: "appointment_not_found" } as const;
  }

  // Verify document belongs to user
  const { data: document } = await supabase
    .from("documents")
    .select("id")
    .eq("id", documentId)
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (!document) {
    return { ok: false, error: "document_not_found" } as const;
  }

  // Check if already linked
  const { data: existing } = await supabase
    .from("appointment_documents")
    .select("id")
    .eq("appointment_id", appointmentId)
    .eq("document_id", documentId)
    .maybeSingle();

  if (existing) {
    return { ok: false, error: "already_linked" } as const;
  }

  // Link document to appointment
  const { error } = await supabase.from("appointment_documents").insert({
    appointment_id: appointmentId,
    document_id: documentId,
  });

  if (error) {
    return { ok: false, error: "link_failed" } as const;
  }

  return { ok: true } as const;
}

export async function removeDocumentFromAppointment(
  appointmentDocumentId: string
) {
  const supabase = await getServerClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" } as const;

  // Verify appointment document belongs to user
  const { data: appointmentDoc } = await supabase
    .from("appointment_documents")
    .select(
      `
      id,
      appointments!inner (
        id,
        citizen_id
      )
    `
    )
    .eq("id", appointmentDocumentId)
    .maybeSingle();

  if (
    !appointmentDoc ||
    (appointmentDoc as any).appointments.citizen_id !== user.id
  ) {
    return { ok: false, error: "not_found" } as const;
  }

  // Remove the link
  const { error } = await supabase
    .from("appointment_documents")
    .delete()
    .eq("id", appointmentDocumentId);

  if (error) {
    return { ok: false, error: "delete_failed" } as const;
  }

  return { ok: true } as const;
}

export async function createDocument(formData: FormData) {
  const supabase = await getServerClient();
  const serviceSupabase = getServiceRoleClient();

  if (!serviceSupabase) {
    return { ok: false, error: "server_misconfigured" } as const;
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" } as const;

  const title = formData.get("title") as string;
  const imageCount = parseInt((formData.get("image_count") as string) || "0");

  if (!title?.trim()) {
    return { ok: false, error: "title_required" } as const;
  }

  if (imageCount === 0) {
    return { ok: false, error: "images_required" } as const;
  }

  try {
    // Upload images to storage
    const uploadedPaths: string[] = [];
    const uploadErrors: string[] = [];

    for (let i = 0; i < imageCount; i++) {
      const file = formData.get(`image_${i}`) as File;
      if (!file) continue;

      const timestamp = Date.now();
      const fileExt = file.type.includes("png") ? "png" : "jpg";
      const fileName = `${user.id}-${timestamp}-${i}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await serviceSupabase.storage
        .from("nic-media") // Reusing existing bucket for now
        .upload(filePath, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (uploadError) {
        uploadErrors.push(
          `Failed to upload image ${i + 1}: ${uploadError.message}`
        );
      } else {
        uploadedPaths.push(filePath);
      }
    }

    if (uploadedPaths.length === 0) {
      return {
        ok: false,
        error: `No images uploaded successfully. Errors: ${uploadErrors.join(
          "; "
        )}`,
      } as const;
    }

    // Create document record with comma-separated storage paths
    const { data: document, error: dbError } = await supabase
      .from("documents")
      .insert({
        owner_user_id: user.id,
        title: title.trim(),
        storage_path: uploadedPaths.join(","), // Comma-separated paths
        mime_type: "image/jpeg", // Generic type for multiple images
        size_bytes: null,
      })
      .select("id")
      .single();

    if (dbError) {
      // Clean up uploaded files if database insert fails
      for (const path of uploadedPaths) {
        await serviceSupabase.storage.from("nic-media").remove([path]);
      }
      return {
        ok: false,
        error: `Database error: ${dbError.message}`,
      } as const;
    }

    return {
      ok: true,
      id: document.id,
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

export async function getDocumentImages(documentId: string) {
  const supabase = await getServerClient();
  const serviceSupabase = getServiceRoleClient();

  if (!serviceSupabase) {
    return { ok: false, error: "server_misconfigured" } as const;
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" } as const;

  // Get the document record
  const { data: doc, error: docError } = await supabase
    .from("documents")
    .select("storage_path, title")
    .eq("id", documentId)
    .eq("owner_user_id", user.id)
    .single();

  if (docError || !doc) {
    return { ok: false, error: "document_not_found" } as const;
  }

  // Split comma-separated paths
  const imagePaths = doc.storage_path
    .split(",")
    .map((path) => path.trim())
    .filter(Boolean);

  if (imagePaths.length === 0) {
    return { ok: false, error: "no_images" } as const;
  }

  // Generate signed URLs for all images
  const signedUrls: string[] = [];
  const errors: string[] = [];

  for (const path of imagePaths) {
    const { data: signed, error } = await serviceSupabase.storage
      .from("nic-media")
      .createSignedUrl(path, 3600); // 1 hour expiry

    if (error) {
      errors.push(`Failed to sign ${path}: ${error.message}`);
    } else if (signed?.signedUrl) {
      signedUrls.push(signed.signedUrl);
    } else {
      errors.push(`No signed URL returned for ${path}`);
    }
  }

  if (signedUrls.length === 0) {
    return {
      ok: false,
      error: errors.length > 0 ? errors.join("; ") : "failed_to_generate_urls",
    } as const;
  }

  return {
    ok: true,
    images: signedUrls,
    title: doc.title,
    warnings: errors.length > 0 ? errors : undefined,
  } as const;
}
