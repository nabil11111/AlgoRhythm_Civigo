import Image from "next/image";

export default function OnboardingWelcomePage() {
  return (
    <div className="min-h-[100svh] w-full flex flex-col bg-white text-[#171717]">
      {/* Top section with logo and welcome text - matches Frame 1 */}
      <div className="flex-1 w-full border-b-[6px] border-b-[var(--color-primary)] rounded-b-2xl shadow-[0_8px_24px_rgba(0,82,165,0.18)] flex flex-col justify-center items-center bg-white">
        <div className="text-center space-y-6">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/logo.png"
              alt="Civigo"
              width={200}
              height={200}
              priority
              className="mx-auto h-auto w-[200px]"
            />
          </div>

          {/* Welcome text */}
          <div className="space-y-2">
            <h1 className="text-[32px] font-bold text-[var(--color-primary)] leading-[39px]">
              Welcome
            </h1>
            <p className="text-base text-[#4f4f4f] leading-[19px]">
              Select your language to continue
            </p>
          </div>
        </div>
      </div>

      {/* Bottom section with language buttons - matches Frame 5 */}
      <div className="mx-auto w-full max-w-[200px] px-4 pb-6 mt-6 space-y-4">
        <a
          href="/onboarding/start"
          className="block w-full rounded-md border-2 border-[var(--color-primary)] bg-white py-3.5 text-center"
          aria-label="Select Sinhala language"
        >
          <span className="text-[20px] text-[#333333] leading-7">සිංහල</span>
        </a>
        <a
          href="/onboarding/start"
          className="block w-full rounded-md border-2 border-[var(--color-primary)] bg-white py-3.5 text-center"
          aria-label="Select Tamil language"
        >
          <span className="text-[20px] text-[#4f4f4f] leading-7">தமிழ்</span>
        </a>
        <a
          href="/onboarding/start"
          className="block w-full rounded-md border-2 border-[var(--color-primary)] bg-white py-3.5 text-center"
          aria-label="Select English language"
        >
          <span className="text-[20px] text-[#4f4f4f] leading-7">English</span>
        </a>
      </div>
    </div>
  );
}
