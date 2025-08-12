import Link from "next/link";

export default function OfficerHome() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Officer</h1>
      <div className="grid gap-4">
        <Link href="/officer/dashboard" className="border rounded p-4 hover:bg-gray-50">
          <div className="font-medium">Dashboard</div>
          <div className="text-sm text-gray-600">View upcoming appointments</div>
        </Link>
      </div>
    </div>
  );
}


