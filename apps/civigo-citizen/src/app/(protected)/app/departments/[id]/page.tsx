import Link from "next/link";
import { getServerClient } from "@/utils/supabase/server";
import { parsePagination } from "@/lib/pagination";
import Navbar from "../../../_components/Navbar";
import DepartmentLogo from "../../_components/DepartmentLogo";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ page?: string; pageSize?: string; q?: string }>;
};

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

export default async function DepartmentDetailsPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const { page, pageSize, offset } = parsePagination(sp);
  const q = sp.q?.trim();

  const supabase = await getServerClient();
  const { data: dept } = await supabase
    .from("departments")
    .select("id, code, name, logo_path, description_richtext")
    .eq("id", id)
    .maybeSingle();

  // Get branches for this department
  const { data: branches } = await supabase
    .from("branches")
    .select("id, code, name, address")
    .eq("department_id", id)
    .order("code", { ascending: true });

  let query = supabase
    .from("services")
    .select("id, code, name, instructions_richtext, instructions_pdf_path")
    .eq("department_id", id)
    .order("code", { ascending: true })
    .range(offset, offset + pageSize - 1);

  if (q) {
    query = query.or(`code.ilike.%${q}%,name.ilike.%${q}%`);
  }

  const { data: services } = await query;

  if (!dept) {
    return (
      <div className="min-h-[100svh] flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Department not found</p>
        </div>
        <Navbar activeTab="services" />
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] flex flex-col bg-white">
      {/* Header with Back Button */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/app"
            className="w-10 h-10 rounded-full border-2 border-[var(--color-primary)] grid place-items-center hover:bg-gray-50 transition-colors"
            aria-label="Back to Services"
          >
            <BackArrowIcon />
          </Link>
        </div>
      </div>

      {/* Department Info Section */}
      <div className="bg-white border-b-2 border-[var(--color-primary)] rounded-b-2xl px-5 py-6">
        <div className="text-center">
          {/* Department Logo */}
          <DepartmentLogo
            logoPath={dept.logo_path}
            departmentName={dept.name}
            size="large"
          />

          {/* Department Name */}
          <h1 className="text-[14px] font-bold text-[#1d1d1d] leading-[20px] mb-2">
            {dept.name}
          </h1>

          {/* Department Description */}
          <p className="text-[12px] text-[#1d1d1d] leading-[20px] max-w-[390px] mx-auto">
            {dept.description_richtext &&
            Object.keys(dept.description_richtext).length > 0
              ? renderRichText(dept.description_richtext)
              : `Services and information for ${dept.name}.`}
          </p>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 pb-28">
        {/* Search Bar */}
        <form className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search services"
              className="w-full h-[50px] border-2 border-[var(--color-primary)] rounded-[25px] px-5 pr-12 text-[16px] focus:outline-none focus:border-[var(--color-primary)]"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <SearchIcon />
            </button>
          </div>
          <button
            type="button"
            className="w-[50px] h-[50px] border-2 border-[var(--color-primary)] rounded-full grid place-items-center"
          >
            <FilterIcon />
          </button>
        </form>

        {/* Services Section */}
        <div className="mb-8">
          <h2 className="text-[20px] text-[#1d1d1d] leading-[28px] mb-4">
            Services
          </h2>

          {services && services.length > 0 ? (
            <div className="space-y-4">
              {services.map((service) => (
                <Link
                  key={service.id}
                  href={`/app/services/${service.id}`}
                  className="block"
                >
                  <div className="border-2 border-[var(--color-primary)] rounded-[12px] p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      {/* Service Info */}
                      <div className="flex-1">
                        <h3 className="text-[14px] font-bold text-[#1d1d1d] leading-[20px]">
                          {service.name}
                        </h3>
                      </div>

                      {/* Arrow */}
                      <ArrowRightIcon />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No services found for this department.
              </p>
            </div>
          )}
        </div>

        {/* Removed AI Assistant FAB */}
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

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="11"
        cy="11"
        r="8"
        stroke="#0052A5"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M21 21l-4.35-4.35"
        stroke="#0052A5"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <polygon
        points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"
        stroke="#0052A5"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 6l6 6-6 6"
        stroke="#0052A5"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Removed AIIcon
