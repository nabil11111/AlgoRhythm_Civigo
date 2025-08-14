import React from "react";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[428px] px-4">
      <main>{children}</main>
    </div>
  );
}


