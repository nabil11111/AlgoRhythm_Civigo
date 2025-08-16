import Link from "next/link";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import Navbar from "./_components/Navbar";
import GovIdCard from "./_components/GovIdCard";
import QuickActions from "./_components/QuickActions";
import UpcomingAppointments from "./_components/UpcomingAppointments";
import ApplicationStatus from "./_components/ApplicationStatus";

export default async function HomePage() {
  const profile = await getProfile();
  const supabase = await getServerClient();

  // Upcoming 2 appointments for the user, booked/confirmed, ascending
  const { data: upcoming } = await supabase
    .from("appointments")
    .select("id, reference_code, service_id, appointment_at, status")
    .eq("citizen_id", profile?.id ?? "")
    .in("status", ["booked", "confirmed"])
    .gte("appointment_at", new Date().toISOString())
    .order("appointment_at", { ascending: true })
    .limit(2);

  // Fetch service names for titles
  const serviceIds = Array.from(
    new Set((upcoming ?? []).map((a) => a.service_id).filter(Boolean))
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

  // Map for component consumption
  const appointments = (upcoming ?? []).map((a) => ({
    id: a.id as string,
    title: (serviceNameById.get(a.service_id as string) ??
      "Appointment") as string,
    appointmentAt: a.appointment_at as string,
    location: "",
    status: a.status as string,
  }));

  const firstName =
    profile?.full_name?.split(" ")[0] ?? profile?.full_name ?? "";

  return (
    <div className="min-h-[100svh] flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="text-base">
          <p className="text-[var(--color-muted)] text-sm">Hello,</p>
          <h1 className="text-xl font-semibold text-[var(--color-primary)]">
            {firstName || profile?.id
              ? `${firstName || profile?.id}!`
              : "Citizen!"}
          </h1>
        </div>
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="relative p-2 rounded-full border border-[var(--color-border)]"
        >
          <span className="sr-only">Notifications</span>
          {/* Bell icon */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm6-6v-5a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z"
              fill="#0052A5"
            />
          </svg>
        </Link>
      </div>

      <div className="flex-1 pb-28">
        <div className="space-y-6">
          <div className="px-4">
            <GovIdCard profile={profile} />
          </div>
          <QuickActions />
          <UpcomingAppointments appointments={appointments} />
          <ApplicationStatus />
        </div>
      </div>

      <Navbar activeTab="home" />
    </div>
  );
}
