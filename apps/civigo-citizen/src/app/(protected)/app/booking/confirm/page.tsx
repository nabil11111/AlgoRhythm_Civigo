import Link from "next/link";
import { getServerClient, getProfile } from "@/utils/supabase/server";
import Navbar from "../../../_components/Navbar";
import DepartmentLogo from "../../_components/DepartmentLogo";
import PDFDownload from "../../services/[id]/_components/PDFDownload";
import ConfirmButton from "./_components/ConfirmButton";

type PageProps = {
  searchParams?: Promise<{
    serviceId?: string;
    branchId?: string;
    date?: string;
    time?: string;
    slotId?: string;
    documents?: string;
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

export default async function BookingConfirmPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const { serviceId, branchId, date, time, slotId, documents } = sp;

  if (!serviceId || !branchId || !date || !time || !slotId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Invalid Booking Details
          </h1>
          <p className="text-gray-600 mb-4">
            Missing required booking information.
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
  const profile = await getProfile();

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-4">Please sign in to continue.</p>
          <Link
            href="/onboarding/welcome"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Fetch service details
  const { data: service } = await supabase
    .from("services")
    .select(
      "id, code, name, department_id, instructions_richtext, instructions_pdf_path"
    )
    .eq("id", serviceId)
    .maybeSingle();

  // Fetch department details
  const { data: department } = service?.department_id
    ? await supabase
        .from("departments")
        .select("id, name, logo_path")
        .eq("id", service.department_id)
        .maybeSingle()
    : { data: null };

  // Fetch branch details
  const { data: branch } = await supabase
    .from("branches")
    .select("id, code, name, address")
    .eq("id", branchId)
    .maybeSingle();

  // Parse selected documents
  const selectedDocumentIds = documents
    ? documents.split(",").filter((id) => id.trim())
    : [];

  // Fetch selected documents if any
  let selectedDocuments: any[] = [];
  if (selectedDocumentIds.length > 0) {
    const { data: docs } = await supabase
      .from("documents")
      .select("id, title, mime_type")
      .eq("owner_user_id", profile.id)
      .in("id", selectedDocumentIds);

    selectedDocuments = docs || [];
  }

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
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-[100svh] flex flex-col bg-white">
      {/* Header with Back Button */}
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href={`/app/services/${serviceId}`}
            aria-label="Back to Service"
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

          {/* Confirmation Title */}
          <h1 className="text-[14px] font-bold text-[#1d1d1d] leading-[20px] mb-2">
            {service?.name} Confirmation
          </h1>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 pb-28">
        {/* Appointment Details */}
        <div className="space-y-4 mb-6">
          {/* Appointment Type */}
          <div className="border border-[#e0e0e0] rounded-lg p-4">
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
          <div className="border border-[#e0e0e0] rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-[16px] font-bold text-[#282828]">
                Branch:
              </span>
              <span className="text-[14px] text-[#282828]">{branch?.name}</span>
            </div>
          </div>

          {/* Date */}
          <div className="border border-[#e0e0e0] rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-[16px] font-bold text-[#282828]">
                Date:
              </span>
              <span className="text-[14px] text-[#282828]">
                {formatDate(date)}
              </span>
            </div>
          </div>

          {/* Time */}
          <div className="border border-[#e0e0e0] rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-[16px] font-bold text-[#282828]">
                Time:
              </span>
              <span className="text-[14px] text-[#282828]">
                {formatTime(time)}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions Section */}
        {service &&
          ((service.instructions_richtext &&
            Object.keys(service.instructions_richtext).length > 0) ||
            service.instructions_pdf_path) && (
            <div className="mb-6 border border-[#e0e0e0] rounded-lg p-4">
              <h2 className="text-[16px] font-bold text-[#4f4f4f] mb-3">
                Service Instructions
              </h2>
              {service.instructions_richtext &&
                Object.keys(service.instructions_richtext).length > 0 && (
                  <div className="text-[14px] text-[#1d1d1d] leading-[20px] mb-3">
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
          )}

        {/* Selected Documents Section */}
        {selectedDocuments.length > 0 && (
          <div className="mb-6 border border-[#e0e0e0] rounded-lg p-4">
            <h2 className="text-[16px] font-bold text-[#4f4f4f] mb-3">
              Presubmitted Documents
            </h2>
            <div className="space-y-2">
              {selectedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="text-gray-600">
                    {doc.title.includes("NIC") ? (
                      <IDCardIcon />
                    ) : (
                      <DocumentIcon />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-gray-900">
                      {doc.title}
                    </p>
                    <p className="text-[12px] text-gray-500">
                      Will be attached to your appointment
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Confirm Button */}
          <ConfirmButton
            serviceId={serviceId}
            branchId={branchId}
            slotId={slotId}
            citizenId={profile.id}
            selectedDocuments={selectedDocumentIds}
          />

          {/* Back Button */}
          <Link
            href={`/app/services/${serviceId}`}
            className="block w-full border-2 border-[var(--color-primary)] text-[#1d1d1d] text-[16px] font-bold py-3 rounded-lg text-center"
          >
            Back
          </Link>
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

function IDCardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect
        x="2"
        y="6"
        width="20"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="8" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
      <path
        d="M14 10h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 14h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="14,2 14,8 20,8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="16"
        y1="13"
        x2="8"
        y2="13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="16"
        y1="17"
        x2="8"
        y2="17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
