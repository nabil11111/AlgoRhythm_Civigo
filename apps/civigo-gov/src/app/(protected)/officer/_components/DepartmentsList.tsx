import Link from "next/link";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type DepartmentItem = { id: string; code: string; name: string };

export default function DepartmentsList({
  departments,
}: {
  departments: DepartmentItem[];
}) {
  if (!departments.length) {
    return (
      <div className="border rounded p-6 text-sm text-gray-600">
        No active departments assigned.
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {departments.map((d) => (
        <Card key={d.id}>
          <CardAction>
            <Button asChild>
              <Link href={`/officer/departments/${d.id}`}>Open</Link>
            </Button>
          </CardAction>
          <CardHeader>
            <CardTitle>{d.name}</CardTitle>
            <CardDescription>Code: {d.code}</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Active</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
