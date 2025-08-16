import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import Navbar from "../../../_components/Navbar";
import DepartmentLogo from "../../_components/DepartmentLogo";
import QRCodeComponent from "../../booking/success/_components/QRCodeComponent";
import AddToCalendarButton from "../../booking/success/_components/AddToCalendarButton";
import GetDirectionsButton from "../../booking/success/_components/GetDirectionsButton";
import PDFDownload from "../../services/[id]/_components/PDFDownload";
import AppointmentDocumentManager from "./_components/AppointmentDocumentManager";
import AppointmentFeedback from "./_components/AppointmentFeedback";

type PageProps = { params: Promise<{ id: string }> };

// Helper function to render rich text (simplified for now)
function renderRichText(richText: any): string {
  if (!richText) return "";

  // If it's a string, try to parse it as JSON first
  if (typeof richText === "string") {
    try {
      const parsed = JSON.parse(richText);
      return renderRichText(parsed); // Recursively process the parsed JSON
    } catch {
      // If parsing fails, it's just a plain string
      return richText;
    }
  }

  // If it's already an object
  if (typeof richText === "object") {
    // Handle different rich text formats
    if (richText.type === "text" && richText.content) return richText.content;
    if (richText.content && typeof richText.content === "string")
      return richText.content;
    if (Array.isArray(richText)) {
      return richText.map((item) => renderRichText(item)).join(" ");
    }
    // Try to extract text from nested structures (Quill format)
    if (richText.ops && Array.isArray(richText.ops)) {
      return richText.ops
        .map((op: any) => {
          if (typeof op.insert === "string") return op.insert;
          return "";
        })
        .join("");
    }
    // If it has a plain text property
    if (richText.text) return richText.text;

    // Fallback: return empty string for complex objects
    return "";
  }

  return "";
}

export default async function AppointmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await getProfile();
  const supabase = await getServerClient();

  // Fetch comprehensive appointment data including timeline timestamps
  const { data: appointment } = await supabase
    .from("appointments")
    .select(
      `
      id,
      reference_code,
      appointment_at,
      status,
      created_at,
      confirmed_at,
      checked_in_at,
      started_at,
      completed_at,
      cancelled_at,
      services:service_id (
        id,
        name,
        department_id,
        instructions_richtext,
        instructions_pdf_path,
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
          address,
          meta
        )
      )
    `
    )
    .eq("id", id)
    .eq("citizen_id", profile?.id ?? "")
    .maybeSingle();

  if (!appointment || !profile) {
    notFound();
  }

  const service = Array.isArray(appointment.services)
    ? appointment.services[0]
    : appointment.services;
  const department = Array.isArray(service?.departments)
    ? service.departments[0]
    : service?.departments;
  const slot = Array.isArray(appointment.service_slots)
    ? appointment.service_slots[0]
    : appointment.service_slots;
  const branch = Array.isArray(slot?.branches)
    ? slot.branches[0]
    : slot?.branches;

  // Extract meta data from branch
  const branchMeta = branch?.meta as {
    phone?: string;
    location_url?: string;
  } | null;
  const locationUrl = branchMeta?.location_url;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Helper functions for calendar integration
  const getAppointmentDateString = () => {
    const date = new Date(appointment.appointment_at);
    return date.toISOString().split("T")[0]; // YYYY-MM-DD format
  };

  const getStartTimeString = () => {
    const date = new Date(appointment.appointment_at);
    return date.toTimeString().slice(0, 5); // HH:MM format
  };

  const getEndTimeString = () => {
    const startDate = new Date(appointment.appointment_at);
    // Assume 30 minutes duration for appointments
    const endDate = new Date(startDate.getTime() + 30 * 60000);
    return endDate.toTimeString().slice(0, 5); // HH:MM format
  };

  // Status configuration
  const getStatusConfig = (status: string) => {
    const statusConfig = {
      booked: { color: "bg-blue-100 text-blue-800", label: "Booked", step: 1 },
      confirmed: {
        color: "bg-green-100 text-green-800",
        label: "Confirmed",
        step: 2,
      },
      in_progress: {
        color: "bg-yellow-100 text-yellow-800",
        label: "In Progress",
        step: 3,
      },
      completed: {
        color: "bg-purple-100 text-purple-800",
        label: "Completed",
        step: 4,
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        label: "Cancelled",
        step: 0,
      },
    };

    return (
      statusConfig[status as keyof typeof statusConfig] || {
        color: "bg-gray-100 text-gray-800",
        label: "Unknown",
        step: 1,
      }
    );
  };

  const statusConfig = getStatusConfig(appointment.status);

  return (
    <div className="min-h-[100svh] flex flex-col bg-white">
      {/* Header with Back Button */}
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/activity"
            aria-label="Back to Activity"
            className="w-10 h-10 rounded-full border-2 border-[var(--color-primary)] grid place-items-center"
          >
            <BackArrowIcon />
          </Link>
        </div>
      </div>

      {/* Service Info Section */}
      <div className="bg-white border-b-2 border-[var(--color-primary)] rounded-b-2xl px-5 py-6">
        <div className="text-center">
          {/* Department Logo */}
          <DepartmentLogo
            logoPath={department?.logo_path}
            departmentName={department?.name || ""}
            size="large"
          />

          {/* Service Name */}
          <h1 className="text-[14px] font-bold text-[#1d1d1d] leading-[20px] mb-2">
            {service?.name}
          </h1>

          {/* Department Name */}
          {department && (
            <p className="text-[12px] text-gray-600">{department.name}</p>
          )}
        </div>
      </div>

      <div className="flex-1 px-5 py-6 pb-28">
        {/* Status Header with Timeline */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-[20px] font-bold text-black">
              Appointment Details
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>
          </div>

          {/* Timeline */}
          <div className="mb-6">
            <h3 className="text-[14px] font-medium text-[#4f4f4f] mb-3">
              Timeline:
            </h3>
            <AppointmentTimeline appointment={appointment} />
          </div>
        </div>

        {/* QR Code Section */}
        <div className="border border-[#e0e0e0] rounded-lg p-5 mb-4 text-center">
          <QRCodeComponent referenceCode={appointment.reference_code} />
          <p className="text-[14px] text-[#333333] mt-4 leading-[20px]">
            Reference: {appointment.reference_code}
            <br />
            Show this QR at reception
          </p>
        </div>

        {/* Appointment Details */}
        <div className="border border-[#e0e0e0] rounded-lg p-4 mb-6">
          <div className="space-y-4">
            {/* Appointment Type */}
            <div className="border border-[#e0e0e0] p-4">
              <div className="flex justify-between items-center">
                <span className="text-[16px] font-bold text-[#282828]">
                  Service:
                </span>
                <span className="text-[14px] text-[#282828]">
                  {service?.name}
                </span>
              </div>
            </div>

            {/* Branch */}
            <div className="border border-[#e0e0e0] p-4">
              <div className="flex justify-between items-center">
                <span className="text-[16px] font-bold text-[#282828]">
                  Branch:
                </span>
                <span className="text-[14px] text-[#282828]">
                  {branch?.name}
                </span>
              </div>
            </div>

            {/* Date */}
            <div className="border border-[#e0e0e0] p-4">
              <div className="flex justify-between items-center">
                <span className="text-[16px] font-bold text-[#282828]">
                  Date:
                </span>
                <span className="text-[14px] text-[#282828]">
                  {formatDate(appointment.appointment_at)}
                </span>
              </div>
            </div>

            {/* Time */}
            <div className="border border-[#e0e0e0] p-4">
              <div className="flex justify-between items-center">
                <span className="text-[16px] font-bold text-[#282828]">
                  Time:
                </span>
                <span className="text-[14px] text-[#282828]">
                  {formatTime(appointment.appointment_at)}
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="border border-[#e0e0e0] p-4">
              <div className="flex justify-between items-center">
                <span className="text-[16px] font-bold text-[#282828]">
                  Status:
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                >
                  {statusConfig.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements and Instructions */}
        {service &&
          ((service.instructions_richtext &&
            Object.keys(service.instructions_richtext).length > 0) ||
            service.instructions_pdf_path) && (
            <div className="border border-[#e0e0e0] rounded-lg p-4 mb-6">
              <h3 className="text-[16px] font-bold text-[#282828] mb-4">
                Requirements and Instructions (read carefully)
              </h3>

              {/* Requirements Section */}
              <div className="mb-4">
                <h4 className="text-[14px] font-bold text-[#282828] mb-2">
                  Requirements:
                </h4>
                <div className="text-[12px] text-black leading-[20px]">
                  {service.instructions_richtext &&
                    Object.keys(service.instructions_richtext).length > 0 && (
                      <div className="mb-3">
                        {renderRichText(service.instructions_richtext)}
                      </div>
                    )}
                  {service.instructions_pdf_path && (
                    <PDFDownload
                      pdfPath={service.instructions_pdf_path}
                      fileName={`${service.name}-instructions.pdf`}
                    />
                  )}
                </div>
              </div>

              {/* Instructions Section */}
              <div>
                <h4 className="text-[14px] font-bold text-[#282828] mb-2">
                  Instructions:
                </h4>
                <div className="text-[12px] text-black leading-[20px]">
                  <p>• Arrive 10 minutes early</p>
                  <p>• Bring original documents for verification</p>
                  <p>• Cashless payments accepted</p>
                  <p>• Show QR code at reception</p>
                </div>
              </div>
            </div>
          )}

        {/* Document Management Section */}
        <AppointmentDocumentManager appointmentId={appointment.id} />

        {/* Feedback Section - Only for completed appointments */}
        {appointment.status === "completed" && (
          <AppointmentFeedback appointmentId={appointment.id} />
        )}

        {/* Action Buttons */}
        {appointment.status !== "cancelled" && (
          <div className="space-y-3">
            {/* Add to Calendar Button */}
            <AddToCalendarButton
              serviceName={service?.name || "Appointment"}
              branchName={branch?.name || "Government Office"}
              branchAddress={branch?.address}
              appointmentDate={getAppointmentDateString()}
              startTime={getStartTimeString()}
              endTime={getEndTimeString()}
            />

            {/* Get Directions Button */}
            <GetDirectionsButton
              branchName={branch?.name || "Government Office"}
              branchAddress={branch?.address}
              locationUrl={locationUrl}
            />
          </div>
        )}

        {/* AI Assistant FAB */}
        <div className="fixed bottom-24 right-5">
          <button className="w-11 h-11 bg-[var(--color-primary)] rounded-full grid place-items-center shadow-lg">
            <AIIcon />
          </button>
        </div>
      </div>

      <Navbar activeTab="activity" />
    </div>
  );
}

// Timeline Component showing actual appointment updates
function AppointmentTimeline({ appointment }: { appointment: any }) {
  // Format timestamp for display
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  // Create timeline events based on available timestamps
  const timelineEvents = [];

  // Always show booking event
  if (appointment.created_at) {
    timelineEvents.push({
      id: "booked",
      title: "Appointment Booked",
      description: "Your appointment has been scheduled",
      timestamp: formatTimestamp(appointment.created_at),
      status: "completed",
      icon: "check",
    });
  }

  // Add confirmed event if available
  if (appointment.confirmed_at) {
    timelineEvents.push({
      id: "confirmed",
      title: "Appointment Confirmed",
      description: "Your appointment has been confirmed by the office",
      timestamp: formatTimestamp(appointment.confirmed_at),
      status: "completed",
      icon: "check",
    });
  }

  // Add check-in event if available
  if (appointment.checked_in_at) {
    timelineEvents.push({
      id: "checked_in",
      title: "Checked In",
      description: "You have checked in at the branch",
      timestamp: formatTimestamp(appointment.checked_in_at),
      status: "completed",
      icon: "check",
    });
  }

  // Add started event if available
  if (appointment.started_at) {
    timelineEvents.push({
      id: "started",
      title: "Service Started",
      description: "Your appointment is now in progress",
      timestamp: formatTimestamp(appointment.started_at),
      status: "completed",
      icon: "check",
    });
  }

  // Add completed event if available
  if (appointment.completed_at) {
    timelineEvents.push({
      id: "completed",
      title: "Service Completed",
      description: "Your appointment has been completed successfully",
      timestamp: formatTimestamp(appointment.completed_at),
      status: "completed",
      icon: "check",
    });
  }

  // Add cancelled event if applicable
  if (appointment.cancelled_at) {
    timelineEvents.push({
      id: "cancelled",
      title: "Appointment Cancelled",
      description: "This appointment has been cancelled",
      timestamp: formatTimestamp(appointment.cancelled_at),
      status: "cancelled",
      icon: "x",
    });
  }

  // Show pending events based on current status
  if (appointment.status === "booked" && !appointment.confirmed_at) {
    timelineEvents.push({
      id: "pending_confirmation",
      title: "Awaiting Confirmation",
      description: "Waiting for office confirmation of your appointment",
      timestamp: null,
      status: "pending",
      icon: "clock",
    });
  } else if (appointment.confirmed_at && !appointment.checked_in_at) {
    timelineEvents.push({
      id: "pending_checkin",
      title: "Ready for Check-in",
      description: "Please arrive 10 minutes early and check in",
      timestamp: null,
      status: "pending",
      icon: "clock",
    });
  }

  return (
    <div className="space-y-4">
      {timelineEvents.map((event, index) => (
        <div key={event.id} className="flex gap-3">
          {/* Timeline indicator */}
          <div className="flex flex-col items-center">
            {/* Icon */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                event.status === "completed"
                  ? "bg-green-100 border-2 border-green-500"
                  : event.status === "cancelled"
                  ? "bg-red-100 border-2 border-red-500"
                  : "bg-gray-100 border-2 border-gray-300"
              }`}
            >
              {event.icon === "check" && (
                <svg
                  className="w-3 h-3 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {event.icon === "x" && (
                <svg
                  className="w-3 h-3 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {event.icon === "clock" && (
                <svg
                  className="w-3 h-3 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            {/* Connecting line */}
            {index < timelineEvents.length - 1 && (
              <div className="w-0.5 h-8 bg-gray-200 mt-1"></div>
            )}
          </div>

          {/* Event content */}
          <div className="flex-1 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h4
                  className={`text-[14px] font-medium ${
                    event.status === "completed"
                      ? "text-gray-900"
                      : event.status === "cancelled"
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {event.title}
                </h4>
                <p
                  className={`text-[12px] mt-1 ${
                    event.status === "completed"
                      ? "text-gray-600"
                      : event.status === "cancelled"
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}
                >
                  {event.description}
                </p>
              </div>
              {event.timestamp && (
                <div className="text-right text-[10px] text-gray-500">
                  <div>{event.timestamp.date}</div>
                  <div>{event.timestamp.time}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
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

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AIIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
        fill="white"
      />
    </svg>
  );
}
