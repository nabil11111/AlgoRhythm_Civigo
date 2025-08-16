import Link from "next/link";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import Navbar from "../_components/Navbar";

export default async function NotificationsPage() {
  const profile = await getProfile();
  const supabase = await getServerClient();

  // Get recent appointment status changes
  const { data: appointments } = await supabase
    .from("appointments")
    .select(
      "id, reference_code, service_id, appointment_at, status, updated_at"
    )
    .eq("citizen_id", profile?.id ?? "")
    .gte("appointment_at", new Date().toISOString())
    .order("updated_at", { ascending: false })
    .limit(10);

  // Fetch service names for titles
  const serviceIds = Array.from(
    new Set((appointments ?? []).map((a) => a.service_id).filter(Boolean))
  ) as string[];
  let serviceNameById = new Map<string, string>();
  if (serviceIds.length > 0) {
    const { data: services } = await supabase
      .from("services")
      .select("id, name")
      .in("id", serviceIds);
    for (const s of services ?? []) {
      serviceNameById.set(s.id as string, s.name as string);
    }
  }

  // Create notification items from appointments
  const notifications = (appointments ?? []).map((a) => ({
    id: a.id as string,
    title: `${
      serviceNameById.get(a.service_id as string) ?? "Appointment"
    } Status Update`,
    message: `Your appointment has been ${a.status}`,
    timestamp: a.updated_at as string,
    status: a.status as string,
    appointmentId: a.id as string,
  }));

  return (
    <div className="min-h-[100svh] flex flex-col bg-white">
      {/* Header with Back Button */}
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            aria-label="Back to Home"
            className="w-10 h-10 rounded-full border-2 border-[var(--color-primary)] grid place-items-center"
          >
            <BackArrowIcon />
          </Link>
        </div>
      </div>

      {/* Title Section */}
      <div className="bg-white border-b-2 border-[var(--color-primary)] rounded-b-2xl px-5 py-6">
        <div className="text-center">
          <h1 className="text-[20px] font-normal text-[#1d1d1d] leading-[28px]">
            Notifications
          </h1>
          <p className="text-[14px] text-[#828282] mt-2">
            Recent updates for your appointments
          </p>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 pb-28">
        {/* Notifications List */}
        {!notifications || notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                className="mx-auto"
              >
                <path
                  d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm6-6v-5a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <p className="text-[16px] text-[#666666] mb-2">
              No notifications yet
            </p>
            <p className="text-[14px] text-[#999999]">
              We'll notify you about appointment status changes here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Link
                key={notification.id}
                href={`/app/appointments/${notification.appointmentId}`}
                className="block"
              >
                <div className="border border-[var(--color-border)] rounded-[12px] p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-[14px] font-medium text-[#1d1d1d] leading-[20px]">
                      {notification.title}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-[20px] text-[8px] leading-[16px] ml-2 ${
                        notification.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : notification.status === "booked"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {notification.status === "confirmed"
                        ? "Confirmed"
                        : notification.status === "booked"
                        ? "Booked"
                        : notification.status}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#666666] mb-2">
                    {notification.message}
                  </p>
                  <p className="text-[10px] text-[#999999]">
                    {new Date(notification.timestamp).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Navbar activeTab="home" />
    </div>
  );
}

// Icons
function BackArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 18l-6-6 6-6"
        stroke="#0052A5"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
