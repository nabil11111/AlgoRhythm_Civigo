import Link from "next/link";
import Navbar from "../../_components/Navbar";

export default async function AccessibilitySettingsPage() {
  const accessibilityItems = [
    {
      id: "language",
      title: "Language",
      description: "English (Default)",
      icon: <LanguageIcon />,
      type: "selection",
    },
  ];

  return (
    <div className="min-h-[100svh] flex flex-col bg-white">
      {/* Header with Back Button */}
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/settings"
            aria-label="Back to Settings"
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
            Language & Accessibility
          </h1>
          <p className="text-[14px] text-[#828282] mt-2">
            Choose your preferred language
          </p>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 pb-28">
        {/* Accessibility Items */}
        <div className="space-y-4">
          {accessibilityItems.map((item) => (
            <div
              key={item.id}
              className="border-2 border-[var(--color-primary)] rounded-[12px] p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
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

                <ArrowRightIcon />
              </div>
            </div>
          ))}
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

function LanguageIcon() {
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
        d="M2 12h20"
        stroke="#0052A5"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
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
