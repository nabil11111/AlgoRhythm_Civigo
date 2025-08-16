import Link from "next/link";
import { getServerClient } from "@/utils/supabase/server";
import { parsePagination } from "@/lib/pagination";
import Navbar from "../_components/Navbar";
import DepartmentLogo from "./_components/DepartmentLogo";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; pageSize?: string; q?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const { page, pageSize, offset } = parsePagination(sp);
  const q = sp.q?.trim();

  const supabase = await getServerClient();
  let query = supabase
    .from("departments")
    .select("id, code, name, logo_path, description_richtext")
    .order("code", { ascending: true })
    .range(offset, offset + pageSize - 1);

  if (q) {
    query = query.or(`code.ilike.%${q}%,name.ilike.%${q}%`);
  }

  const { data: departments } = await query;

  // Fetch one service per department for quick navigation
  const { data: allServices } = await supabase
    .from("services")
    .select("id, code, name, department_id")
    .order("created_at", { ascending: false });

  // Group services by department and take first one from each
  const servicesByDept = new Map();
  allServices?.forEach((service) => {
    if (!servicesByDept.has(service.department_id)) {
      servicesByDept.set(service.department_id, service);
    }
  });

  const servicesRaw = Array.from(servicesByDept.values()).slice(0, 6);

  // Get unique department IDs from services
  const departmentIds =
    servicesRaw?.map((s) => s.department_id).filter(Boolean) || [];

  // Fetch department data for the services
  const { data: serviceDepartments } =
    departmentIds.length > 0
      ? await supabase
          .from("departments")
          .select("id, code, name, logo_path")
          .in("id", departmentIds)
      : { data: [] };

  // Merge services with their department data
  const services =
    servicesRaw?.map((service) => ({
      ...service,
      departments: serviceDepartments?.find(
        (dept) => dept.id === service.department_id
      ),
    })) || [];

  // Sample department descriptions
  const departmentDescriptions: Record<string, string> = {
    "Department of Immigration and Emigration":
      "Passport appointment, Visa status",
    "Department of Motor Traffic (RMV)":
      "License renewal, Vehicle registration",
    "Registrar General's Department":
      "Birth certificate copy, Marriage certificate copy",
    "Department of Social Services":
      "Disability assistance, Senior citizen benefits",
    "Department of Inland Revenue": "Tax filing, TIN registration",
  };

  return (
    <div className="min-h-[100svh] flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4">
        <h1 className="text-[20px] font-bold text-[var(--color-primary)] leading-[24px]">
          Services
        </h1>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white border-b-2 border-[var(--color-primary)] rounded-b-2xl px-5 py-6">
        <div className="mb-6">
          <h2 className="text-[20px] text-[#1d1d1d] leading-[28px]">
            Quick Actions
          </h2>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Link
            href="/app/departments"
            className="flex flex-col items-center gap-2"
          >
            <div className="w-[50px] h-[50px] rounded-full bg-[var(--color-secondary)] border border-[var(--color-secondary)] grid place-items-center">
              <SearchIcon />
            </div>
            <span className="text-[12px] text-[#282828] leading-[20px] text-center">
              Departments
            </span>
          </Link>

          <Link
            href="/app/categories"
            className="flex flex-col items-center gap-2"
          >
            <div className="w-[50px] h-[50px] rounded-full bg-[var(--color-secondary)] border border-[var(--color-secondary)] grid place-items-center">
              <ListIcon />
            </div>
            <span className="text-[12px] text-[#282828] leading-[20px] text-center">
              Categories
            </span>
          </Link>

          <Link href="/app/nearby" className="flex flex-col items-center gap-2">
            <div className="w-[50px] h-[50px] rounded-full bg-[var(--color-secondary)] border border-[var(--color-secondary)] grid place-items-center">
              <MapPinIcon />
            </div>
            <span className="text-[12px] text-[#282828] leading-[20px] text-center">
              Nearby Offices
            </span>
          </Link>

          <Link
            href="/app/assistant"
            className="flex flex-col items-center gap-2"
          >
            <div className="w-[50px] h-[50px] rounded-full bg-[var(--color-primary)] border border-[var(--color-primary)] grid place-items-center">
              <AIIcon />
            </div>
            <span className="text-[12px] text-[#282828] leading-[20px] text-center">
              AI Assistant
            </span>
          </Link>
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
              placeholder="Search departments or services"
              className="w-full h-[50px] border-2 border-[var(--color-primary)] rounded-[25px] px-5 pr-12 text-[16px] focus:outline-none focus:border-[var(--color-primary)]"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <SearchSmallIcon />
            </button>
          </div>
          <button
            type="button"
            className="w-[50px] h-[50px] border-2 border-[var(--color-primary)] rounded-full grid place-items-center"
          >
            <FilterIcon />
          </button>
        </form>

        {/* Departments Section */}
        <div className="mb-8">
          <h2 className="text-[20px] text-[#1d1d1d] leading-[28px] mb-4">
            Departments
          </h2>

          <div className="space-y-4">
            {(departments ?? []).map((dept) => (
              <Link
                key={dept.id}
                href={`/app/departments/${dept.id}`}
                className="block"
              >
                <div className="border-2 border-[var(--color-primary)] rounded-[12px] p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Department Logo */}
                    <DepartmentLogo
                      logoPath={dept.logo_path}
                      departmentName={dept.name}
                      size="small"
                    />

                    {/* Department Info */}
                    <div className="flex-1">
                      <h3 className="text-[14px] font-bold text-[#1d1d1d] leading-[20px]">
                        {dept.name}
                      </h3>
                      <p className="text-[12px] text-[#1d1d1d] leading-[20px]">
                        {departmentDescriptions[dept.name] ||
                          `${dept.code} services`}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ArrowRightIcon />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-8">
          <h2 className="text-[20px] text-[#1d1d1d] leading-[28px] mb-4">
            Services
          </h2>

          <div className="space-y-4">
            {services && services.length > 0 ? (
              services.map((service) => (
                <Link
                  key={service.id}
                  href={`/app/services/${service.id}`}
                  className="block"
                >
                  <div className="border-2 border-[var(--color-primary)] rounded-[12px] p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Department Logo */}
                      <DepartmentLogo
                        logoPath={service.departments?.logo_path}
                        departmentName={service.departments?.name || ""}
                        size="small"
                      />

                      {/* Service Info */}
                      <div className="flex-1">
                        <h3 className="text-[14px] font-bold text-[#1d1d1d] leading-[20px]">
                          {service.name}
                        </h3>
                        <p className="text-[12px] text-gray-600 mt-1">
                          {service.departments?.name}
                        </p>
                      </div>

                      {/* Arrow */}
                      <ArrowRightIcon />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No services available</p>
              </div>
            )}
          </div>
        </div>

        {/* Removed AI Assistant FAB */}
      </div>

      <Navbar activeTab="services" />
    </div>
  );
}

// Icons
function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="11"
        cy="11"
        r="8"
        stroke="white"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M21 21l-4.35-4.35"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <line
        x1="8"
        y1="6"
        x2="21"
        y2="6"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="8"
        y1="12"
        x2="21"
        y2="12"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="8"
        y1="18"
        x2="21"
        y2="18"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="4" cy="6" r="2" fill="white" />
      <circle cx="4" cy="12" r="2" fill="white" />
      <circle cx="4" cy="18" r="2" fill="white" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z"
        stroke="white"
        strokeWidth="2"
        fill="none"
      />
      <circle
        cx="12"
        cy="10"
        r="2.5"
        stroke="white"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

function SearchSmallIcon() {
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
