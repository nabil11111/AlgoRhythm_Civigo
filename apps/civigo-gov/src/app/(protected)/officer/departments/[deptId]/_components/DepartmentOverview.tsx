import Link from "next/link";
import { 
  Calendar, 
  Users, 
  MapPin, 
  Settings, 
  Clock, 
  CheckCircle, 
  ChevronRight,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppointmentActions } from "./AppointmentActions";

interface Department {
  id: string;
  code: string;
  name: string;
  description_richtext?: unknown;
  logo_path?: string | null;
}

interface Appointment {
  id: string;
  reference_code: string;
  appointment_at: string;
  status: string;
  checked_in_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  services: { id: string; name: string } | null;
  profiles: { full_name: string | null } | null;
}

interface DepartmentOverviewProps {
  department: Department;
  appointments: Appointment[];
  servicesCount: number;
  branchesCount: number;
  todayStats: { status: string }[];
  deptId: string;
  logoSignedUrl: string | null;
  markCheckedInAction: (data: { id: string; deptId: string }) => Promise<void>;
  markStartedAction: (data: { id: string; deptId: string }) => Promise<void>;
  markCompletedAction: (data: { id: string; deptId: string }) => Promise<void>;
  markNoShowAction: (data: { id: string; deptId: string; value: boolean }) => Promise<void>;
  markCancelledAction: (data: { id: string; deptId: string }) => Promise<void>;
}

export function DepartmentOverview({
  department,
  appointments,
  servicesCount,
  branchesCount,
  todayStats,
  deptId,
  logoSignedUrl,
  markCheckedInAction,
  markStartedAction,
  markCompletedAction,
  markNoShowAction,
  markCancelledAction
}: DepartmentOverviewProps) {
  const todayCount = todayStats.length;
  const completedToday = todayStats.filter(s => s.status === "completed").length;
  const pendingToday = todayStats.filter(s => s.status === "booked").length;
  const cancelledToday = todayStats.filter(s => s.status === "cancelled").length;

  return (
    <div className="space-y-6">
      {/* Department Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              {logoSignedUrl ? (
                <img 
                  src={logoSignedUrl} 
                  alt={department.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <Building2 className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{department.name}</h1>
              <p className="text-gray-600">Department {department.code}</p>
              {department.description_richtext?.content?.[0]?.content?.[0]?.text && (
                <p className="text-sm text-gray-500 mt-1 max-w-md">
                  {department.description_richtext.content[0].content[0].text}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/officer/departments/${deptId}/settings`}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Today&#39;s Total</p>
                <p className="text-3xl font-bold">{todayCount}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Completed</p>
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
                <p className="text-3xl font-bold">{pendingToday}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Services</p>
                <p className="text-3xl font-bold">{servicesCount}</p>
              </div>
              <Users className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today&#39;s Appointments */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Today&#39;s Appointments</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/officer/departments/${deptId}/appointments`}>
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>

              </div>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium">No appointments today</p>
                  <p className="text-sm">Create new appointments or check your schedule</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-mono text-xs">
                            {appointment.reference_code.slice(-4)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {appointment.profiles?.full_name || "Unknown Citizen"}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {appointment.services?.name || "Unknown Service"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(appointment.appointment_at).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={
                            appointment.status === "completed" ? "default" : 
                            appointment.status === "booked" ? "secondary" : 
                            appointment.status === "cancelled" ? "destructive" : "outline"
                          }
                          className="capitalize"
                        >
                          {appointment.status}
                        </Badge>
                        <AppointmentActions 
                          appointment={appointment} 
                          deptId={deptId}
                          markCheckedInAction={markCheckedInAction}
                          markStartedAction={markStartedAction}
                          markCompletedAction={markCompletedAction}
                          markNoShowAction={markNoShowAction}
                          markCancelledAction={markCancelledAction}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/officer/departments/${deptId}/services`}>
                  <Users className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Services</p>
                    <p className="text-xs text-gray-500">{servicesCount} active services</p>
                  </div>
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/officer/departments/${deptId}/branches`}>
                  <MapPin className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Branches</p>
                    <p className="text-xs text-gray-500">{branchesCount} locations</p>
                  </div>
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/officer/departments/${deptId}/services`}>
                  <Calendar className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Time Slots</p>
                    <p className="text-xs text-gray-500">Manage availability</p>
                  </div>
                </Link>
              </Button>
              

            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="font-semibold">
                  {todayCount > 0 ? Math.round((completedToday / todayCount) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cancelled Today</span>
                <span className="font-semibold text-red-600">{cancelledToday}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Available Services</span>
                <span className="font-semibold text-green-600">{servicesCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
