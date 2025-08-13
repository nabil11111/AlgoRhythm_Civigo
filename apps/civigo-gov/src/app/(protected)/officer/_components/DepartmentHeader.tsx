export default function DepartmentHeader({
  departmentName,
}: {
  departmentName: string | null;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Active department:</span>
      <span className="inline-flex items-center rounded border px-2 py-0.5 text-sm">
        {departmentName ?? "Unassigned"}
      </span>
    </div>
  );
}
