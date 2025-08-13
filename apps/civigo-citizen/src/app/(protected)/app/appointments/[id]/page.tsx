import { notFound } from "next/navigation";
import { getProfile, getServerClient } from "@/utils/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export default async function AppointmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await getProfile();
  const supabase = await getServerClient();

  const { data: appt } = await supabase
    .from("appointments")
    .select("id, reference_code, service_id, appointment_at, status")
    .eq("id", id)
    .maybeSingle();

  if (!appt || !profile || appt == null) {
    notFound();
  }

  const { data: service } = await supabase
    .from("services")
    .select("id, name")
    .eq("id", appt.service_id)
    .maybeSingle();

  return (
    <div className="space-y-2">
      <h1 className="text-lg font-semibold">Appointment</h1>
      <div>Reference: {appt.reference_code}</div>
      <div>Service: {service?.name}</div>
      <div>Time: {new Date(appt.appointment_at).toLocaleString()}</div>
      <div>Status: {appt.status}</div>
      <div className="mt-4 text-sm text-gray-600">Documents: (coming soon)</div>
    </div>
  );
}


