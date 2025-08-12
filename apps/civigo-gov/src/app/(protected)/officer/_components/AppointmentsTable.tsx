import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AppointmentRow = {
  id: string;
  reference_code: string;
  citizen_name: string | null;
  service_name: string;
  appointment_at: string;
  status: string;
};

export default function AppointmentsTable({
  rows,
}: {
  rows: AppointmentRow[];
}) {
  if (!rows.length) {
    return (
      <div className="border rounded p-6 text-sm text-gray-600">
        No appointments to show.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Reference</TableHead>
          <TableHead>Citizen</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>When</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="font-mono text-xs">{r.reference_code}</TableCell>
            <TableCell>{maskName(r.citizen_name)}</TableCell>
            <TableCell>{r.service_name}</TableCell>
            <TableCell>{new Date(r.appointment_at).toLocaleString()}</TableCell>
            <TableCell>{r.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function maskName(name: string | null) {
  if (!name) return "—";
  const parts = name.split(" ");
  return parts
    .map((p) => (p.length > 1 ? `${p[0]}${"*".repeat(Math.max(1, p.length - 1))}` : p))
    .join(" ");
}


