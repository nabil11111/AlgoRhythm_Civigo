import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-[100svh] flex items-center justify-center bg-white">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-semibold text-[var(--color-primary)]">Success</h1>
        <p className="text-gray-600">Your account has been created.</p>
      </div>
    </main>
  );
}
