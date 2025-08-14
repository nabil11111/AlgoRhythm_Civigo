import Image from "next/image";

export default function OnboardingWelcomePage() {
  return (
    <div className="min-h-[100svh] flex flex-col">
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
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">Welcome</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Select your language to continue
        </p>

        <div className="mt-10" />
      </main>
      <footer className="mx-auto max-w-[360px] w-full mt-auto pb-6 px-2 space-y-3">
        <a
          href="/onboarding/start"
          className="block w-full rounded-[--radius-md] border-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-white py-3 text-base font-medium text-center"
          aria-label="Select Sinhala language"
        >
          සිංහල
        </a>
        <a
          href="/onboarding/start"
          className="block w-full rounded-[--radius-md] border-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-white py-3 text-base font-medium text-center"
          aria-label="Select Tamil language"
        >
          தமிழ்
        </a>
        <a
          href="/onboarding/start"
          className="block w-full rounded-[--radius-md] border-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-white py-3 text-base font-medium text-center"
          aria-label="Select English language"
        >
          English
        </a>
      </footer>
    </div>
  );
}
