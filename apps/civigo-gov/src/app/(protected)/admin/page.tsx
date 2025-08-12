import Link from "next/link";

export default function AdminHome() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <div className="grid grid-cols-2 gap-4">
        <Link href="/admin/departments" className="border rounded p-4 hover:bg-gray-50">
          <div className="font-medium">Departments</div>
          <div className="text-sm text-gray-600">Manage departments</div>
        </Link>
        <Link href="/admin/officers" className="border rounded p-4 hover:bg-gray-50">
          <div className="font-medium">Officers</div>
          <div className="text-sm text-gray-600">Manage officer profiles and assignments</div>
        </Link>
      </div>
    </div>
  );
}


