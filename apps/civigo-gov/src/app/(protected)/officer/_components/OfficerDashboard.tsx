import Link from "next/link";
import { Calendar, Clock, Users, ChevronRight, Plus, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Department {
  id: string;
  code: string;
  name: string;
}

interface Appointment {
  id: string;
  status: string;
  appointment_at: string;
  services: { name: string } | null;
}

interface OfficerDashboardProps {
  departments: Department[];
  todayAppointments: Appointment[];
  pendingCount: number;
}

export function OfficerDashboard({ 
  departments, 
  todayAppointments, 
  pendingCount 
}: OfficerDashboardProps) {
  const completedToday = todayAppointments.filter(a => a.status === "completed").length;
  // const upcomingToday = todayAppointments.filter(a => a.status === "booked").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {new Date().toLocaleDateString("en-US", { 
              weekday: "long", 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })}
          </p>
        </div>
        <div className="flex gap-3">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Quick Actions
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Today&#39;s Appointments</p>
                <p className="text-3xl font-bold">{todayAppointments.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Completed Today</p>
                <p className="text-3xl font-bold">{completedToday}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Departments</p>
                <p className="text-3xl font-bold">{departments.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today&#39;s Schedule */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Today&#39;s Schedule</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/officer/appointments" className="text-blue-600 hover:text-blue-700">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No appointments scheduled for today</p>
              </div>
            ) : (
              todayAppointments.slice(0, 5).map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {appointment.services?.name || "Unknown Service"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(appointment.appointment_at).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      appointment.status === "completed" ? "default" : 
                      appointment.status === "booked" ? "secondary" : "outline"
                    }
                    className="capitalize"
                  >
                    {appointment.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* My Departments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">My Departments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {departments.map((dept) => (
              <Link
                key={dept.id}
                href={`/officer/departments/${dept.id}`}
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {dept.code.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{dept.name}</h3>
                      <p className="text-sm text-gray-500">Department {dept.code}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>


    </div>
  );
}
