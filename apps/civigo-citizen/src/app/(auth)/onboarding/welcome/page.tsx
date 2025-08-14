import Image from "next/image";

export default function OnboardingWelcomePage() {
  return (
    <div className="min-h-[100svh] flex flex-col bg-white text-[#171717] relative overflow-hidden">
      {/* Curved blue arc background element */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative h-full">
          <div 
            className="absolute inset-x-0 top-0 h-[65%] bg-gradient-to-b from-blue-50/40 to-transparent"
            style={{
              clipPath: 'ellipse(120% 100% at 50% 0%)'
            }}
          />
          <div 
            className="absolute inset-x-0 bottom-0 h-[40%] bg-[var(--color-primary)]"
            style={{
              clipPath: 'ellipse(120% 80% at 50% 100%)'
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-[100svh]">
        <header className="pt-10 pb-8">
          <div className="mx-auto max-w-[360px] text-center">
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
        <main className="mx-auto max-w-[360px] flex-1 w-full px-2 text-center">
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">
            Welcome
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Select your language to continue
          </p>

          <div className="mt-10" />
        </main>
        <footer className="mx-auto max-w-[360px] w-full mt-auto pb-6 px-2 space-y-3 relative z-20">
          <a
            href="/onboarding/start"
            className="block w-full rounded-lg border-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-white/95 backdrop-blur-sm py-4 text-base font-medium text-center shadow-sm hover:bg-white transition-colors"
            aria-label="Select Sinhala language"
          >
            සිංහල
          </a>
          <a
            href="/onboarding/start"
            className="block w-full rounded-lg border-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-white/95 backdrop-blur-sm py-4 text-base font-medium text-center shadow-sm hover:bg-white transition-colors"
            aria-label="Select Tamil language"
          >
            தமிழ்
          </a>
          <a
            href="/onboarding/start"
            className="block w-full rounded-lg border-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-white/95 backdrop-blur-sm py-4 text-base font-medium text-center shadow-sm hover:bg-white transition-colors"
            aria-label="Select English language"
          >
            English
          </a>
        </footer>
      </div>
    </div>
  );
}