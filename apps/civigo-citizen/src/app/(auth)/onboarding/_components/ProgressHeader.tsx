export type OnboardingStep =
  | "nic"
  | "phone"
  | "email"
  | "names"
  | "password"
  | "nic-photos"
  | "face";

const steps: { key: OnboardingStep; label: string }[] = [
  { key: "nic", label: "NIC" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "names", label: "Names" },
  { key: "password", label: "Password" },
  { key: "nic-photos", label: "NIC Photos" },
  { key: "face", label: "Face" },
];

export function ProgressHeader({ current }: { current: OnboardingStep }) {
  return (
    <nav aria-label="Onboarding steps" className="mb-4">
      <ol className="flex items-center gap-2 text-[11px]" aria-live="polite">
        {steps.map((s, idx) => {
          const isActive = s.key === current;
          return (
            <li key={s.key} className="flex items-center gap-2">
              <span
                className={[
                  "inline-flex h-6 items-center rounded-full px-2",
                  isActive
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-gray-100 text-gray-700",
                ].join(" ")}
              >
                {s.label}
              </span>
              {idx < steps.length - 1 && (
                <span className="text-gray-400" aria-hidden>
                  →
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
