import Link from "next/link";

type StatusCard = {
  id: string;
  title: string;
  statusLabel: string;
  eta: string;
  currentStep: number;
  totalSteps?: number;
};

export default function ApplicationStatus({ items }: { items?: StatusCard[] }) {
  const data: StatusCard[] = items ?? [];

  if (!data || data.length === 0) {
    return (
      <div className="bg-white border-t-4 border-[var(--color-secondary)] rounded-t-3xl px-5 py-6">
        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-[20px] text-[#1d1d1d] leading-[28px]">
            Application Status
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
                y="4"
                width="18"
                height="16"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <rect
                x="7"
                y="8"
                width="4"
                height="2"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="7"
                y="12"
                width="10"
                height="2"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="7"
                y="16"
                width="6"
                height="2"
                rx="1"
                fill="currentColor"
              />
            </svg>
          </div>
          <p className="text-[16px] text-[#666666] mb-2">Coming Soon</p>
          <p className="text-[14px] text-[#999999]">
            Application status tracking will be available soon
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-t-4 border-[var(--color-secondary)] rounded-t-3xl px-5 py-6">
      {/* Section Title */}
      <div className="mb-6">
        <h2 className="text-[20px] text-[#1d1d1d] leading-[28px]">
          Application Status
        </h2>
      </div>

      {/* Status Cards - Horizontal Scroll */}
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5">
        {data.map((c) => (
          <article
            key={c.id}
            className="bg-white border border-[var(--color-secondary)] rounded-[12px] p-3 min-w-[280px] flex-shrink-0"
          >
            {/* Title and status badge */}
            <div className="flex items-center justify-between pb-2 mb-4 border-b border-[#e0e0e0]">
              <h3 className="text-[16px] text-[#282828] leading-[22px] font-normal">
                {c.title}
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-[20px] text-[7px] bg-[#ff8f00]/30 text-[#333333] leading-[20px]">
                {c.statusLabel}
              </span>
            </div>

            {/* Progress stepper */}
            <div className="mb-3">
              <Stepper current={c.currentStep} total={c.totalSteps ?? 4} />
            </div>

            {/* Stage info */}
            <div className="mb-4">
              <span className="text-[12px] text-[#282828] leading-[20px]">
                Stage: {c.statusLabel} – ETA {c.eta}
              </span>
            </div>

            {/* Arrow button */}
            <div className="flex justify-end">
              <Link
                href={`/app/applications/${c.id}`}
                aria-label="Open application details"
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

export function Stepper({
  current,
  total = 4,
}: {
  current: number;
  total?: number;
}) {
  const steps = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, index) => {
        const isCompleted = step < current;
        const isCurrent = step === current;
        const isUpcoming = step > current;

        return (
          <div key={step} className="flex items-center">
            {/* Step circle */}
            <div
              className={`w-5 h-5 rounded-full grid place-items-center text-[12px] leading-[20px] ${
                isCompleted || isCurrent
                  ? "bg-[var(--color-primary)] border border-[var(--color-primary)] text-white"
                  : isCurrent
                  ? "border border-[var(--color-secondary)] text-[#282828] bg-white"
                  : "border border-[#e0e0e0] text-[#e0e0e0] bg-white"
              }`}
            >
              {step}
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`w-5 h-0.5 ${
                  step < current ? "bg-[var(--color-primary)]" : "bg-[#e0e0e0]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
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
