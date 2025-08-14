import React from "react";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100svh] bg-white text-[#171717]">
      <div className="mx-auto max-w-[428px] px-4">
        <main>{children}</main>
      </div>
    </div>
  );
}


