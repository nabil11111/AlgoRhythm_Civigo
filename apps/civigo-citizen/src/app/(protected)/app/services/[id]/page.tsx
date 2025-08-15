import Link from "next/link";
import { getServerClient } from "@/utils/supabase/server";
import Navbar from "../../../_components/Navbar";
import BookingForm from "./_components/BookingForm";
import PDFDownload from "./_components/PDFDownload";
import DepartmentLogo from "../../_components/DepartmentLogo";

// Helper function to render rich text (simplified for now)
function renderRichText(richText: any): string {
  // Basic rich text renderer - can be enhanced based on your rich text format
  if (typeof richText === "string") return richText;
  if (richText?.content && typeof richText.content === "string")
    return richText.content;
  if (richText?.text && typeof richText.text === "string") return richText.text;

  // If it's a complex object, try to extract plain text
  if (typeof richText === "object" && richText !== null) {
    // Handle common rich text formats
    if (Array.isArray(richText)) {
      return richText.map((item) => renderRichText(item)).join("");
    }
    if (richText.type === "text") return richText.text || "";
    if (richText.type === "paragraph" && richText.content) {
      return renderRichText(richText.content);
    }
  }

  return "";
}

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string; to?: string }>;
};

export default async function ServiceBookingPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const supabase = await getServerClient();

  const { data: service } = await supabase
    .from("services")
    .select(
      "id, code, name, department_id, instructions_richtext, instructions_pdf_path"
    )
    .eq("id", id)
    .maybeSingle();

  // Get department info for navigation and logo
  const { data: department } = service?.department_id
    ? await supabase
        .from("departments")
        .select("id, name, logo_path")
        .eq("id", service.department_id)
        .maybeSingle()
    : { data: null };

  // Get branches for this service's department
  const { data: branches } = service?.department_id
    ? await supabase
        .from("branches")
        .select("id, code, name, address")
        .eq("department_id", service.department_id)
        .order("code", { ascending: true })
    : { data: [] };

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Service Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            The service you're looking for doesn't exist.
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

  return (
    <div className="min-h-[100svh] flex flex-col bg-white">
      {/* Header with Back Button */}
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href={`/app/departments/${service?.department_id || ""}`}
            aria-label="Back to Department"
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
            {service.name}
          </h1>

          {/* Department Name */}
          {department && (
            <p className="text-[12px] text-gray-600">{department.name}</p>
          )}
        </div>
      </div>

      <div className="flex-1 px-5 py-6 pb-28">
        {/* Service Instructions */}
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

        {/* Dynamic Booking Form */}
        <BookingForm serviceId={service?.id || ""} branches={branches || []} />

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

function BackArrowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M19 12H5M12 19l-7-7 7-7"
        stroke="var(--color-primary)"
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
        d="M9 12l2 2 4-4"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="white"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}
