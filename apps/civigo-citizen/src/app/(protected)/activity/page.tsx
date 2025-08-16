import React from "react";
import { getServerClient, getProfile } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "../_components/Navbar";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Grid3X3,
  List,
  HelpCircle,
} from "lucide-react";

type PageProps = {
  searchParams?: Promise<{
    search?: string;
    page?: string;
  }>;
};

export default async function ActivityPage({ searchParams }: PageProps) {
  const supabase = await getServerClient();
  const profile = await getProfile();

  if (!profile) {
    redirect("/onboarding/welcome");
  }

  const searchParamsData = await searchParams;
  const searchQuery = searchParamsData?.search || "";
  const currentPage = parseInt(searchParamsData?.page || "1");
  const pageSize = 10;
  const offset = (currentPage - 1) * pageSize;

  // Fetch upcoming appointments - simplified like home page
  const { data: upcoming } = await supabase
    .from("appointments")
    .select("id, reference_code, service_id, appointment_at, status")
    .eq("citizen_id", profile.id)
    .in("status", ["booked", "confirmed"])
    .gte("appointment_at", new Date().toISOString())
    .order("appointment_at", { ascending: true });

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
  const upcomingAppointments = (upcoming ?? []).map((a) => ({
    id: a.id as string,
    title: (serviceNameById.get(a.service_id as string) ??
      "Appointment") as string,
    appointmentAt: a.appointment_at as string,
    status: a.status as string,
  }));

  // Fetch past appointments (all statuses for now to see what's available)
  let pastQuery = supabase
    .from("appointments")
    .select(
      `
      id,
      reference_code,
      appointment_at,
      status,
      service_id,
      services:service_id (
        id,
        name,
        departments:department_id (
          id,
          name,
          logo_path
        )
      ),
      service_slots:slot_id (
        id,
        branch_id,
        branches:branch_id (
          id,
          name,
          address
        )
      )
    `
    )
    .eq("citizen_id", profile.id)
    .lt("appointment_at", new Date().toISOString())
    .order("appointment_at", { ascending: false });

  if (searchQuery) {
    pastQuery = pastQuery.or(
      `services.name.ilike.%${searchQuery}%,services.departments.name.ilike.%${searchQuery}%`
    );
  }

  const { data: pastAppointments } = await pastQuery.range(0, pageSize - 1);

  // Update service names mapping to include past appointments
  const pastServiceIds = Array.from(
    new Set((pastAppointments ?? []).map((a) => a.service_id).filter(Boolean))
  ) as string[];

  if (pastServiceIds.length > 0) {
    const { data: pastServices } = await supabase
      .from("services")
      .select("id, name")
      .in("id", pastServiceIds);
    for (const s of pastServices ?? []) {
      serviceNameById.set(s.id as string, s.name as string);
    }
  }

  // Format date and time helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { color: "bg-green-100 text-green-800", label: "Confirmed" },
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
      completed: { color: "bg-blue-100 text-blue-800", label: "Completed" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-orange-100 text-orange-800",
      label: "Processing",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  // Mock stepper for past applications (you can enhance this with real data)
  const getStepperProgress = (status: string) => {
    const steps = [
      { number: 1, completed: true },
      { number: 2, completed: true },
      { number: 3, completed: status === "completed" },
      { number: 4, completed: false },
    ];

    return (
      <div className="flex items-center gap-1 mt-2">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                step.completed
                  ? "bg-[var(--color-primary)] text-white"
                  : step.number === 3 && status !== "completed"
                  ? "border-2 border-[var(--color-secondary)] text-[var(--color-secondary)]"
                  : "border-2 border-gray-300 text-gray-300"
              }`}
            >
              {step.number}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-5 h-0.5 ${
                  step.completed ? "bg-[var(--color-primary)]" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-[100svh] flex flex-col bg-white">
      {/* Header */}
      <div className="w-full px-6 py-4">
        <h1 className="text-[20px] font-bold text-[var(--color-primary)]">
          Activity
        </h1>
      </div>

      {/* Quick Actions Section */}
      <div className="w-full bg-white py-6 border-b-2 border-[var(--color-primary)] rounded-b-2xl">
        <div className="px-5">
          <h2 className="text-[20px] font-normal text-[#1d1d1d] mb-6">
            Quick Actions
          </h2>
          <div className="flex justify-between items-center">
            {/* Departments */}
            <Link
              href="/app"
              className="flex flex-col items-center gap-3 flex-1"
            >
              <div className="w-[50px] h-[50px] bg-[var(--color-secondary)] rounded-full flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              <span className="text-[12px] text-[#282828] text-center leading-tight">
                Departments
              </span>
            </Link>

            {/* Categories */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="w-[50px] h-[50px] bg-[var(--color-secondary)] rounded-full flex items-center justify-center">
                <List className="w-6 h-6 text-white" />
              </div>
              <span className="text-[12px] text-[#282828] text-center leading-tight">
                Categories
              </span>
            </div>

            {/* Nearby Offices */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="w-[50px] h-[50px] bg-[var(--color-secondary)] rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="text-[12px] text-[#282828] text-center leading-tight">
                Nearby Offices
              </span>
            </div>

            {/* Help */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="w-[50px] h-[50px] bg-[var(--color-secondary)] rounded-full flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-[12px] text-[#282828] text-center leading-tight">
                Help
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-5 py-6 pb-28">
        {/* Search and Filter */}
        <form method="GET" action="/activity" className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              name="search"
              placeholder="Search activity"
              defaultValue={searchQuery}
              className="w-full px-5 py-3 border-2 border-[var(--color-primary)] rounded-full text-[16px] text-[#828282] pr-12"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 transform -translate-y-1/2"
            >
              <Search className="w-5 h-5 text-[var(--color-primary)]" />
            </button>
          </div>
          <button
            type="button"
            className="w-[50px] h-[50px] border-2 border-[var(--color-primary)] rounded-full flex items-center justify-center"
          >
            <Filter className="w-6 h-6 text-[var(--color-primary)]" />
          </button>
        </form>

        {/* Upcoming Section */}
        <div className="mb-8">
          <h2 className="text-[20px] font-normal text-[#1d1d1d] mb-4">
            Upcoming
          </h2>
          {upcomingAppointments.length === 0 ? (
            <div className="w-full text-center py-12">
              <div className="max-w-sm mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-[18px] font-medium text-[#282828] mb-2">
                  No Upcoming Appointments
                </h3>
                <p className="text-[14px] text-gray-500 mb-6">
                  You don't have any appointments scheduled. Book a service to
                  get started.
                </p>
                <Link
                  href="/app"
                  className="inline-flex items-center px-4 py-2 bg-[var(--color-primary)] text-white text-[14px] font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Services
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="min-w-[280px] flex-shrink-0 bg-white border-2 border-[var(--color-secondary)] rounded-xl p-4"
                >
                  {/* Service Name */}
                  <div className="border-b border-gray-200 pb-3 mb-4">
                    <h3 className="text-[16px] font-normal text-[#282828]">
                      {appointment.title}
                    </h3>
                  </div>

                  {/* Appointment Details */}
                  <div className="space-y-3">
                    {/* Date */}
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-[var(--color-secondary)]" />
                      <span className="text-[12px] text-[#282828]">
                        {formatDate(appointment.appointmentAt)}
                      </span>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-[var(--color-secondary)]" />
                      <span className="text-[12px] text-[#282828]">
                        {formatTime(appointment.appointmentAt)}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-[12px] text-[#282828] capitalize">
                        {appointment.status}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-end mt-4">
                    <Link
                      href={`/app/appointments/${appointment.id}`}
                      className="w-6 h-6 text-[var(--color-secondary)] hover:opacity-75"
                    >
                      <ArrowRight className="w-6 h-6" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Section */}
        <div>
          <h2 className="text-[20px] font-normal text-[#1d1d1d] mb-4">
            Past Appointments
          </h2>
          {pastAppointments?.length === 0 ? (
            <div className="w-full text-center py-12">
              <div className="max-w-sm mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-[18px] font-medium text-[#282828] mb-2">
                  No Past Appointments
                </h3>
                <p className="text-[14px] text-gray-500">
                  Your past appointments will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5">
              {pastAppointments?.map((appointment) => (
                <div
                  key={appointment.id}
                  className="min-w-[280px] flex-shrink-0 bg-white border-2 border-[var(--color-secondary)] rounded-xl p-4"
                >
                  {/* Service Name and Status */}
                  <div className="border-b border-gray-200 pb-3 mb-4 flex justify-between items-center">
                    <h3 className="text-[16px] font-normal text-[#282828]">
                      {serviceNameById.get(appointment.service_id as string) ||
                        "Appointment"}
                    </h3>
                    {getStatusBadge(appointment.status)}
                  </div>

                  {/* Appointment Details */}
                  <div className="space-y-3 mb-4">
                    {/* Date */}
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-[var(--color-secondary)]" />
                      <span className="text-[12px] text-[#282828]">
                        {formatDate(appointment.appointment_at)}
                      </span>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-[var(--color-secondary)]" />
                      <span className="text-[12px] text-[#282828]">
                        {formatTime(appointment.appointment_at)}
                      </span>
                    </div>

                    {/* Reference Code */}
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded bg-[var(--color-secondary)] flex items-center justify-center">
                        <span className="text-[8px] text-white font-bold">
                          #
                        </span>
                      </div>
                      <span className="text-[12px] text-[#282828]">
                        Ref: {appointment.reference_code}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {appointment.status === "completed" ? (
                    <div className="flex items-center gap-2 mb-4 p-2 bg-green-50 rounded-lg">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden
                        >
                          <path
                            d="M20 6 9 17l-5-5"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span className="text-[12px] text-green-700 font-medium">
                        Service Completed
                      </span>
                    </div>
                  ) : appointment.status === "cancelled" ? (
                    <div className="flex items-center gap-2 mb-4 p-2 bg-red-50 rounded-lg">
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden
                        >
                          <path
                            d="M18 6 6 18M6 6l12 12"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span className="text-[12px] text-red-700 font-medium">
                        Appointment Cancelled
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
                      <div className="w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center">
                        <Clock className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-[12px] text-gray-700 font-medium">
                        Status: {appointment.status}
                      </span>
                    </div>
                  )}

                  {/* Arrow */}
                  <div className="flex justify-end">
                    <Link
                      href={`/app/appointments/${appointment.id}`}
                      className="w-6 h-6 text-[var(--color-secondary)] hover:opacity-75"
                    >
                      <ArrowRight className="w-6 h-6" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Removed AI Assistant FAB */}

      {/* Bottom Navigation */}
      <Navbar activeTab="activity" />
    </div>
  );
}
