import Link from "next/link";

export type UpcomingAppointment = {
  id: string;
  title?: string;
  appointmentAt: string;
  location?: string;
  status: string;
};

export default function UpcomingAppointments({
  appointments,
}: {
  appointments: UpcomingAppointment[];
}) {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="bg-white border-t-2 border-[var(--color-secondary)] px-5 py-6">
        <div className="mb-6">
          <h2 className="text-[20px] text-[#1d1d1d] leading-[28px]">
            Upcoming Appointments
          </h2>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-3">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              className="mx-auto"
            >
              <rect
                x="3"
                y="5"
                width="18"
                height="16"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <rect
                x="3"
                y="5"
                width="18"
                height="5"
                rx="2"
                fill="currentColor"
              />
              <rect
                x="7"
                y="2"
                width="2"
                height="4"
                rx="1"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <rect
                x="15"
                y="2"
                width="2"
                height="4"
                rx="1"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
          <p className="text-[16px] text-[#666666] mb-2">
            No upcoming appointments
          </p>
          <p className="text-[14px] text-[#999999]">
            Book your first appointment to see it here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-t-2 border-[var(--color-secondary)] px-5 py-6">
      {/* Section Title */}
      <div className="mb-6">
        <h2 className="text-[20px] text-[#1d1d1d] leading-[28px]">
          Upcoming Appointments
        </h2>
      </div>

      {/* Appointment Cards - Horizontal Scroll */}
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5">
        {appointments.map((a) => (
          <article
            key={a.id}
            className="bg-white border border-[var(--color-secondary)] rounded-[12px] p-3 min-w-[280px] flex-shrink-0"
          >
            {/* Title with bottom border */}
            <div className="pb-2 mb-4 border-b border-[#e0e0e0]">
              <h3 className="text-[16px] text-[#282828] leading-[22px] font-normal">
                {a.title ?? "Appointment"}
              </h3>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3">
                <CalendarIcon />
                <span className="text-[12px] text-[#282828] leading-[20px]">
                  {new Date(a.appointmentAt)
                    .toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                    .replace(/\//g, "-")}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <ClockIcon />
                <span className="text-[12px] text-[#282828] leading-[20px]">
                  {new Date(a.appointmentAt).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>

              {a.location && (
                <div className="flex items-start gap-3">
                  <LocationIcon />
                  <span className="text-[12px] text-[#282828] leading-[20px] flex-1">
                    {a.location}
                  </span>
                </div>
              )}
            </div>

            {/* Arrow button */}
            <div className="flex justify-end">
              <Link
                href={`/app/appointments/${a.id}`}
                aria-label="View appointment details"
                className="w-4 h-4 grid place-items-center text-[var(--color-secondary)] hover:opacity-75"
              >
                <ArrowRightIcon />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="#009688"
        strokeWidth="2"
        fill="none"
      />
      <rect x="3" y="5" width="18" height="5" rx="2" fill="#009688" />
      <rect
        x="7"
        y="2"
        width="2"
        height="4"
        rx="1"
        stroke="#009688"
        strokeWidth="2"
        fill="none"
      />
      <rect
        x="15"
        y="2"
        width="2"
        height="4"
        rx="1"
        stroke="#009688"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="#009688"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M12 7v6l4 2"
        stroke="#009688"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z"
        stroke="#009688"
        strokeWidth="2"
        fill="none"
      />
      <circle
        cx="12"
        cy="10"
        r="2.5"
        stroke="#009688"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 6l6 6-6 6"
        stroke="#009688"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
