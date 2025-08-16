import { redirect } from "next/navigation";
import Link from "next/link";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import { OfficerAppointmentParam } from "@/lib/validation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { markConfirmed, markCheckedIn, markStarted, markCompleted, markCancelled, markNoShow, getAppointmentDocumentUrls, sendChangeRequest } from "../../_actions";
import { AppointmentStatusManager } from "./_components/AppointmentStatusManager";
import { DocumentPreview } from "./_components/DocumentPreview";
import { RequestChangeForm } from "./_components/RequestChangeForm";

type PageProps = {
  params: Promise<{ deptId: string; appointmentId: string }>;
};

export default async function AppointmentDetailsPage({ params }: PageProps) {
  const p = await params;
  const parsed = OfficerAppointmentParam.safeParse(p);
  if (!parsed.success) redirect("/officer");

  const profile = await getProfile();
  if (!profile || profile.role !== "officer") redirect("/sign-in");

  const supabase = await getServerClient();

  // Guard: officer assigned to department and appointment belongs to this dept
  const { data: appt } = await supabase
    .from("appointments")
    .select(
      `id, status, no_show, appointment_at, confirmed_at, checked_in_at, started_at, completed_at, cancelled_at,
       citizen_id, citizen_gov_id,
       service:services(id, name, department_id)`
    )
    .eq("id", parsed.data.appointmentId)
    .maybeSingle();
  if (!appt || (appt.service as unknown as { department_id: string } | null)?.department_id !== parsed.data.deptId) redirect("/officer");

  const { data: assignment } = await supabase
    .from("officer_assignments")
    .select("id")
    .eq("officer_id", profile.id)
    .eq("department_id", parsed.data.deptId)
    .eq("active", true)
    .maybeSingle();
  if (!assignment) redirect("/officer");

  // Citizen profile (limited) via RLS policy
  const { data: citizen } = await supabase
    .from("profiles")
    .select("id, full_name, email, nic, phone, verified_status")
    .eq("id", appt.citizen_id as string)
    .maybeSingle();

  // Get document previews with signed URLs
  const documentUrlsResult = await getAppointmentDocumentUrls({
    appointmentId: appt.id as string,
    deptId: parsed.data.deptId,
  });

  const documentPreviews = documentUrlsResult.ok ? documentUrlsResult.data.documentPreviews : [];

  const apptId = appt.id as string;
  const deptId = parsed.data.deptId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointment Details</h1>
          <p className="text-gray-600 mt-1">Reference: <span className="font-mono text-sm">{apptId}</span></p>
        </div>
        <Link 
          href={`/officer/departments/${deptId}/appointments`} 
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          ← Back to Appointments
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Appointment & Citizen Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Appointment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Service</label>
                  <p className="text-gray-900 font-medium">{(appt.service as unknown as { name: string } | null)?.name || "Unknown Service"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Date & Time</label>
                  <p className="text-gray-900">{new Date(appt.appointment_at as string).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Reference Code</label>
                  <p className="text-gray-900 font-mono text-sm">{apptId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Current Status</label>
                  <p className="text-gray-900">
                    {String(appt.status).replace("_", " ")}
                    {appt.no_show ? " (No-show)" : ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Citizen Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Citizen Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {citizen ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <p className="text-gray-900">{citizen.full_name || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{citizen.email || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">NIC</label>
                    <p className="text-gray-900 font-mono text-sm">{citizen.nic || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{citizen.phone || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Verification Status</label>
                    <Badge variant={citizen.verified_status === "verified" ? "default" : "secondary"}>
                      {citizen.verified_status || "Unknown"}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Citizen details not available</p>
                  <p className="text-sm">May be restricted by RLS policies</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <DocumentPreview documentPreviews={documentPreviews} />
        </div>

        {/* Right Column - Status Management & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <AppointmentStatusManager
            appointment={{
              id: apptId,
              status: appt.status as string,
              no_show: appt.no_show || false,
              appointment_at: appt.appointment_at as string,
              confirmed_at: appt.confirmed_at,
              checked_in_at: appt.checked_in_at,
              started_at: appt.started_at,
              completed_at: appt.completed_at,
              cancelled_at: appt.cancelled_at
            }}
            deptId={deptId}
            markConfirmedAction={markConfirmed}
            markCheckedInAction={markCheckedIn}
            markStartedAction={markStarted}
            markCompletedAction={markCompleted}
            markCancelledAction={markCancelled}
            markNoShowAction={markNoShow}
          />
          
          {/* Change Request Form */}
          <RequestChangeForm
            appointmentId={apptId}
            deptId={deptId}
            sendChangeRequestAction={sendChangeRequest}
          />
        </div>
      </div>
    </div>
  );
}


