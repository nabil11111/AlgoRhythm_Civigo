import React from "react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100svh] w-full bg-white text-[#171717]">
      <main className="w-full">{children}</main>
    </div>
  );
}
