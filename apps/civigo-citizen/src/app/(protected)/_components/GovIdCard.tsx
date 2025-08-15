import type { Profile } from "@/utils/supabase/server";

function maskGovId(govId: string | null): string {
  if (!govId) return "-----0000";
  const suffix = govId.slice(-4);
  return `-----${suffix}`;
}

export default function GovIdCard({ profile }: { profile: Profile | null }) {
  const name = profile?.full_name ?? "";
  const short = name
    ? `${name.split(" ")[0]?.[0] ?? ""}. ${name
        .split(" ")
        .slice(1)
        .join(" ")}`.trim()
    : profile?.email ?? "Citizen";
  const masked = maskGovId(profile?.gov_id ?? null);
  return (
    <section aria-label="GovID" className="relative">
      <div className="relative rounded-[20px] p-5 shadow-lg border border-[var(--color-secondary)] bg-[#009688]/10">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-4">
            {/* Header with GovID title and verified badge */}
            <div className="flex items-center gap-3">
              <h3 className="text-[24px] font-bold text-[#282828] leading-[26px]">
                GovID
              </h3>
              <div className="w-4 h-4 rounded-full border border-[var(--color-secondary)] grid place-items-center">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M20 6 9 17l-5-5"
                    stroke="#009688"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* ID Number row with eye icon */}
            <div className="flex items-center gap-3">
              <div className="text-[16px] text-[#282828] leading-[22px]">
                {masked}
              </div>
              <div className="w-4 h-4 rounded-full border border-[var(--color-secondary)] grid place-items-center">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                    stroke="#009688"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="#009688"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path d="M1 1l22 22" stroke="#009688" strokeWidth="1.5" />
                </svg>
              </div>
            </div>

            {/* Name */}
            <div className="text-[16px] text-[#282828] leading-[22px]">
              {short}
            </div>
          </div>

          {/* Avatar and DOB section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-[100px] h-[100px] rounded-full border border-[#ff8f00]/20 overflow-hidden bg-gray-100 grid place-items-center">
              <svg
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <circle cx="12" cy="8" r="4" fill="#cbd5e1" />
                <path d="M4 20a8 8 0 0 1 16 0" fill="#e5e7eb" />
              </svg>
            </div>
            <div className="text-[12px] text-[#4f4f4f] leading-[20px]">
              27 - 10 - 1977
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
