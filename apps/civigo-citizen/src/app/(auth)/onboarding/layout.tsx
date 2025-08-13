import React from "react";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md p-4">
      <header className="mb-4">
        <h1 className="text-xl font-semibold">Citizen Onboarding</h1>
      </header>
      <main>{children}</main>
    </div>
  );
}


