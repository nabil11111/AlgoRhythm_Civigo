import Link from "next/link";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminHome() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardAction>
            <Button asChild>
              <Link href="/admin/departments">Open</Link>
            </Button>
          </CardAction>
          <CardHeader>
            <CardTitle>Departments</CardTitle>
            <CardDescription>Manage departments</CardDescription>
          </CardHeader>
          <CardContent>
            Configure department codes and names used across services.
          </CardContent>
        </Card>
        <Card>
          <CardAction>
            <Button asChild>
              <Link href="/admin/officers">Open</Link>
            </Button>
          </CardAction>
          <CardHeader>
            <CardTitle>Officers</CardTitle>
            <CardDescription>Manage officer profiles and assignments</CardDescription>
          </CardHeader>
          <CardContent>
            Add officers, assign departments, and manage access.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


