import { redirect } from "next/navigation";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import { OfficerDepartmentParam } from "@/lib/validation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Save } from "lucide-react";
import Link from "next/link";
import { ServiceInstructionsManager } from "./_components/ServiceInstructionsManager";
import { upsertServiceInstructions, uploadServiceInstructionsPdf } from "./_actions";
import { deleteServiceInstructionsPdf } from "../_actions";

type PageProps = {
  params: Promise<{ deptId: string; serviceId: string }>;
};

export default async function ServiceDetailPage({ params }: PageProps) {
  const p = await params;
  const parsed = OfficerDepartmentParam.safeParse({ deptId: p.deptId });
  if (!parsed.success) redirect("/officer");

  const profile = await getProfile();
  if (!profile || profile.role !== "officer") redirect("/sign-in");
  const supabase = await getServerClient();
  const { data: assignment } = await supabase
    .from("officer_assignments")
    .select("id")
    .eq("officer_id", profile.id)
    .eq("department_id", parsed.data.deptId)
    .eq("active", true)
    .maybeSingle();
  if (!assignment) redirect("/officer");

  const { data: service } = await supabase
    .from("services")
    .select("id, name, instructions_richtext, instructions_pdf_path")
    .eq("id", p.serviceId)
    .eq("department_id", parsed.data.deptId)
    .maybeSingle();
  if (!service) redirect(`/officer/departments/${parsed.data.deptId}/services`);

  // Server actions
  async function saveInstructions(data: { instructions_richtext: any }) {
    "use server";
    await upsertServiceInstructions({
      deptId: parsed.data.deptId,
      serviceId: p.serviceId,
      instructions_richtext: data.instructions_richtext,
    });
  }

  async function uploadPdf(formData: FormData) {
    "use server";
    const file = formData.get("file") as File | null;
    if (!file) {
      throw new Error("No file provided");
    }
    
    try {
      const result = await uploadServiceInstructionsPdf({
        deptId: parsed.data.deptId,
        serviceId: p.serviceId,
        file,
      });
      
      if (!result.ok) {
        throw new Error(result.message || result.error);
      }
      
      return result;
    } catch (error) {
      console.error("PDF upload error:", error);
      throw error;
    }
  }

  async function deletePdf() {
    "use server";
    try {
      const result = await deleteServiceInstructionsPdf({ 
        deptId: parsed.data.deptId, 
        serviceId: p.serviceId 
      });
      
      if (!result.ok) {
        throw new Error(result.message || result.error);
      }
      
      return result;
    } catch (error) {
      console.error("PDF delete error:", error);
      throw error;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Instructions</h1>
          <p className="text-gray-600 mt-1">{service?.name}</p>
        </div>
        <Link 
          href={`/officer/departments/${parsed.data.deptId}/services`} 
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </Link>
      </div>

      {/* Instructions Manager */}
      <ServiceInstructionsManager
        service={service}
        deptId={parsed.data.deptId}
        serviceId={p.serviceId}
        onSaveInstructions={saveInstructions}
        onUploadPdf={uploadPdf}
        onDeletePdf={deletePdf}
      />
    </div>
  );
}


