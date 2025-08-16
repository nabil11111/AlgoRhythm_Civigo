import Link from "next/link";
import { getProfile } from "@/utils/supabase/server";
import Navbar from "../_components/Navbar";
import { signOut } from "../_actions";

export default async function SettingsPage() {
  const profile = await getProfile();

  const settingsItems = [
    {
      id: "profile",
      title: "Profile",
      description: "View/edit name, phone, email",
      icon: <ProfileIcon />,
      href: "/settings/profile",
    },
    {
      id: "security",
      title: "Sign-in & security",
      description: "Reset your account password",
      icon: <SecurityIcon />,
      href: "/settings/security",
    },
    {
      id: "accessibility",
      title: "Language & accessibility",
      description: "Change app language settings",
      icon: <AccessibilityIcon />,
      href: "/settings/accessibility",
    },
  ];

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
      <div className="bg-white border-b-4 border-[var(--color-primary)] rounded-b-3xl px-5 py-6">
        <div className="text-center">
          <h1 className="text-[20px] font-normal text-[#1d1d1d] leading-[28px]">
            Settings
          </h1>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 pb-28">
        {/* Search Bar */}
        <div className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search settings"
              className="w-full h-[50px] border-2 border-[var(--color-primary)] rounded-[25px] px-5 pr-12 text-[16px] text-[#828282] focus:outline-none focus:border-[var(--color-primary)]"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </div>
          </div>
          <button
            type="button"
            className="w-[50px] h-[50px] border-2 border-[var(--color-primary)] rounded-full grid place-items-center"
          >
            <FilterIcon />
          </button>
        </div>

        {/* Settings Items */}
        <div className="space-y-4">
          {settingsItems.map((item) => (
            <Link key={item.id} href={item.href} className="block">
              <div className="border-2 border-[var(--color-primary)] rounded-[12px] p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  {/* Setting Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 grid place-items-center">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[16px] font-medium text-[#1d1d1d] leading-[22px]">
                        {item.title}
                      </h3>
                      <p className="text-[12px] text-gray-500 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center">
                    <ArrowRightIcon />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <div className="mt-8">
          <form action={signOut}>
            <button
              type="submit"
              className="w-full h-[50px] border-2 border-[var(--color-primary)] rounded-[25px] px-5 text-[16px] text-[#1d1d1d] hover:bg-gray-50 transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      <Navbar activeTab="settings" />
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

function ProfileIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="8"
        r="4"
        stroke="#0052A5"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M4 20a8 8 0 0 1 16 0"
        stroke="#0052A5"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

function SecurityIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="11"
        width="18"
        height="11"
        rx="2"
        ry="2"
        stroke="#0052A5"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M7 11V7a5 5 0 0 1 10 0v4"
        stroke="#0052A5"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

function AccessibilityIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="#0052A5"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M8 14s1.5 2 4 2 4-2 4-2"
        stroke="#0052A5"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="9"
        y1="9"
        x2="9.01"
        y2="9"
        stroke="#0052A5"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="15"
        y1="9"
        x2="15.01"
        y2="9"
        stroke="#0052A5"
        strokeWidth="2"
        strokeLinecap="round"
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
