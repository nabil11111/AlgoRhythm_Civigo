import Link from "next/link";

type Action = {
  href: string;
  label: string;
  icon: React.ReactNode;
  aria: string;
};

export default function QuickActions() {
  const actions: Action[] = [
    {
      href: "/app",
      label: "Booking",
      aria: "Go to booking/services",
      icon: iconCalendar(),
    },
    {
      href: "/activity",
      label: "Track",
      aria: "Track appointments",
      icon: iconClock(),
    },
    {
      href: "/app/wallet/new",
      label: "Upload",
      aria: "Upload documents",
      icon: iconUpload(),
    },
    {
      href: "/app/wallet",
      label: "Wallet",
      aria: "Open wallet",
      icon: iconWallet(),
    },
    { href: "#", label: "Help", aria: "Get help", icon: iconHelp() },
  ];

  return (
    <div className="bg-white border-t-4 border-[var(--color-secondary)] rounded-t-3xl px-5 py-6">
      {/* Section Title */}
      <div className="mb-6">
        <h2 className="text-[20px] text-[#1d1d1d] leading-[28px]">
          Quick Actions
        </h2>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-start">
        {actions.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            aria-label={a.aria}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-[60px] h-[60px] rounded-full bg-[var(--color-secondary)] border border-[var(--color-secondary)] grid place-items-center transition active:scale-95">
              {a.icon}
            </div>
            <span className="text-[12px] text-[#282828] leading-[20px] text-center">
              {a.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function iconCalendar() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="#ffffff"
        strokeWidth="2"
        fill="none"
      />
      <path d="M8 3v4M16 3v4M3 10h18" stroke="#ffffff" strokeWidth="2" />
    </svg>
  );
}
function iconClock() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="#ffffff"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M12 7v6l4 2"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function iconUpload() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 16V4m0 0 4 4m-4-4-4 4"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="4"
        y="16"
        width="16"
        height="4"
        rx="1"
        fill="#ffffff"
        opacity="0.8"
      />
    </svg>
  );
}
function iconWallet() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="6"
        width="18"
        height="12"
        rx="2"
        stroke="#ffffff"
        strokeWidth="2"
        fill="none"
      />
      <rect x="14" y="10" width="5" height="4" rx="1" fill="#ffffff" />
    </svg>
  );
}
function iconHelp() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 9a3 3 0 1 1 5.2 1.8c-.9.9-1.7 1.2-2.2 2.2V15"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="19" r="1" fill="#ffffff" />
    </svg>
  );
}
