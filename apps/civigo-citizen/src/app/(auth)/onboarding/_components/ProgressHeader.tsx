export type OnboardingStep =
  | "nic"
  | "phone"
  | "email"
  | "names"
  | "password"
  | "nic-photos"
  | "face"
  | "finalize";

const steps: { key: OnboardingStep; label: string }[] = [
  { key: "nic", label: "NIC" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "names", label: "Names" },
  { key: "password", label: "Password" },
  { key: "nic-photos", label: "NIC Photos" },
  { key: "face", label: "Face" },
  { key: "finalize", label: "Finalize" },
];

export function ProgressHeader({ current }: { current: OnboardingStep }) {
  return (
    <nav aria-label="Onboarding steps" className="mb-4">
      <ol className="flex items-center gap-2 text-xs" aria-live="polite">
        {steps.map((s, idx) => (
          <li key={s.key} className="flex items-center gap-2">
            <span
              className={s.key === current ? "font-semibold" : "text-gray-500"}
            >
              {s.label}
            </span>
            {idx < steps.length - 1 && <span className="text-gray-400">→</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
