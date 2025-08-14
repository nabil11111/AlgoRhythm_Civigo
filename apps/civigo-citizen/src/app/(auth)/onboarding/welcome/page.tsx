import Image from "next/image";

export default function OnboardingWelcomePage() {
  return (
    <div className="min-h-[100svh] w-full flex flex-col bg-white text-[#171717] relative overflow-hidden">
      {/* Curved blue arc background element */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative h-full w-full">
          {/* Bottom curved blue arc matching design - extends higher to cover button area */}
          <div
            className="absolute inset-x-0 bottom-0 h-[60%] bg-[var(--color-primary)]"
            style={{
              clipPath: "ellipse(100% 70% at 50% 100%)",
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-[100svh] w-full">
        <header className="pt-10 pb-8">
          <div className="mx-auto w-full max-w-sm text-center px-4">
            <Image
              src="/logo.png"
              alt="Civigo"
              width={160}
              height={40}
              priority
              className="mx-auto h-auto w-[160px]"
            />
          </div>
        </header>
        <main className="mx-auto w-full max-w-sm flex-1 px-4 text-center">
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">
            Welcome
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Select your language to continue
          </p>

          <div className="mt-10" />
        </main>
        <footer className="mx-auto w-full max-w-sm mt-auto pb-6 px-4 space-y-3 relative z-20">
          <a
            href="/onboarding/start"
            className="block w-full rounded-lg border-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-white py-4 text-base font-medium text-center shadow-md hover:shadow-lg transition-shadow"
            aria-label="Select Sinhala language"
          >
            සිංහල
          </a>
          <a
            href="/onboarding/start"
            className="block w-full rounded-lg border-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-white py-4 text-base font-medium text-center shadow-md hover:shadow-lg transition-shadow"
            aria-label="Select Tamil language"
          >
            தமிழ්
          </a>
          <a
            href="/onboarding/start"
            className="block w-full rounded-lg border-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-white py-4 text-base font-medium text-center shadow-md hover:shadow-lg transition-shadow"
            aria-label="Select English language"
          >
            English
          </a>
        </footer>
      </div>
    </div>
  );
}
