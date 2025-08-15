import { redirect } from "next/navigation";
import Link from "next/link";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import { OfficerAppointmentParam } from "@/lib/validation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, FileText } from "lucide-react";
import { markCheckedIn, markStarted, markCompleted, markCancelled, markNoShow } from "../../_actions";
import { AppointmentStatusManager } from "./_components/AppointmentStatusManager";

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
      `id, status, no_show, appointment_at, checked_in_at, started_at, completed_at, cancelled_at,
       citizen_id, citizen_gov_id,
       service:services(id, name, department_id)`
    )
    .eq("id", parsed.data.appointmentId)
    .maybeSingle();
  if (!appt || appt.service?.department_id !== parsed.data.deptId) redirect("/officer");

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

  // Linked documents
  const { data: docLinks } = await supabase
    .from("appointment_documents")
    .select("documents:document_id(id, title, mime_type, size_bytes)")
    .eq("appointment_id", appt.id as string);

  type DocItem = { documents: { id: string; title: string; mime_type: string | null; size_bytes: number | null } | null };
  const docs = (docLinks as DocItem[] | null ?? [])
    .map((d) => d.documents)
    .filter((x): x is NonNullable<DocItem["documents"]> => Boolean(x));

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
                  <p className="text-gray-900 font-medium">{appt.service?.name || "Unknown Service"}</p>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents
                <Badge variant="secondary" className="ml-2">
                  {docs.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {docs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No documents uploaded</p>
                  <p className="text-sm">Documents will appear here when uploaded by the citizen</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doc.title}</p>
                          <p className="text-sm text-gray-500">
                            {doc.mime_type || "unknown"} • {((doc.size_bytes || 0) / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Status Management */}
        <div className="lg:col-span-1">
          <AppointmentStatusManager
            appointment={{
              id: apptId,
              status: appt.status as string,
              no_show: appt.no_show || false,
              appointment_at: appt.appointment_at as string,
              checked_in_at: appt.checked_in_at,
              started_at: appt.started_at,
              completed_at: appt.completed_at,
              cancelled_at: appt.cancelled_at
            }}
            deptId={deptId}
            markCheckedInAction={markCheckedIn}
            markStartedAction={markStarted}
            markCompletedAction={markCompleted}
            markCancelledAction={markCancelled}
            markNoShowAction={markNoShow}
          />
        </div>
      </div>
    </div>
  );
}


