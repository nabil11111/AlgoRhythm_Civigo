import Link from "next/link";
import { getServerClient } from "@/utils/supabase/server";
import Navbar from "../../../_components/Navbar";
import DepartmentLogo from "../../_components/DepartmentLogo";
import PDFDownload from "../../services/[id]/_components/PDFDownload";
import QRCodeComponent from "./_components/QRCodeComponent";
import AddToCalendarButton from "./_components/AddToCalendarButton";
import GetDirectionsButton from "./_components/GetDirectionsButton";

type PageProps = {
  searchParams?: Promise<{
    appointmentId?: string;
  }>;
};

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

export default async function BookingSuccessPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const { appointmentId } = sp;

  if (!appointmentId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Appointment Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            No appointment information available.
          </p>
          <Link
            href="/app"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  const supabase = await getServerClient();

  // Fetch appointment details
  const { data: appointment } = await supabase
    .from("appointments")
    .select(
      `
      id,
      reference_code,
      appointment_at,
      status,
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
    .eq("id", appointmentId)
    .maybeSingle();

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Appointment Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            The appointment you're looking for doesn't exist.
          </p>
          <Link
            href="/app"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to Services
          </Link>
        </div>
      </div>
    );
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

  return (
    <div className="min-h-[100svh] flex flex-col bg-white">
      {/* Header with Back Button */}
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/app"
            aria-label="Back to Services"
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

          {/* Title */}
          <h1 className="text-[14px] font-bold text-[#1d1d1d] leading-[20px] mb-2">
            {service?.name}
          </h1>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 pb-28">
        {/* Success Header */}
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-[24px] font-bold text-black">
            Appointment Booking Success
          </h2>
          <div className="w-6 h-6 bg-[#388e3c] rounded-full flex items-center justify-center">
            <CheckIcon />
          </div>
        </div>

        {/* QR Code Section */}
        <div className="border border-[#e0e0e0] rounded-lg p-5 mb-4 text-center">
          <QRCodeComponent referenceCode={appointment.reference_code} />
          <p className="text-[14px] text-[#333333] mt-4 leading-[20px]">
            Use this QR at the reception
            <br />
            on appointment day
          </p>
        </div>

        {/* Appointment Details */}
        <div className="border border-[#e0e0e0] rounded-lg p-4 mb-4">
          <div className="space-y-4">
            {/* Appointment Type */}
            <div className="border border-[#e0e0e0] p-4">
              <div className="flex justify-between items-center">
                <span className="text-[16px] font-bold text-[#282828]">
                  Appointment Type:
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
                <h4 className="text-[16px] font-bold text-[#282828] mb-2">
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
                <h4 className="text-[16px] font-bold text-[#282828] mb-2">
                  Instructions:
                </h4>
                <div className="text-[12px] text-black leading-[20px]">
                  <p>Arrive 10min early.</p>
                  <p>Cashless payments accepted.</p>
                </div>
              </div>
            </div>
          )}

        {/* Action Buttons */}
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

        {/* AI Assistant FAB */}
        <div className="fixed bottom-24 right-5">
          <button className="w-11 h-11 bg-[var(--color-primary)] rounded-full grid place-items-center shadow-lg">
            <AIIcon />
          </button>
        </div>
      </div>

      <Navbar activeTab="services" />
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
        stroke="white"
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
