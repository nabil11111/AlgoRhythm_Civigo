"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Calendar,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  MoreVertical,
  Users,
  CheckCircle,
  XCircle,
  UserCheck,
  Play,
  UserX,
  Eye,
  Phone,
  MapPin,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { format, isToday, isTomorrow, parseISO } from "date-fns";

interface Department {
  id: string;
  code: string;
  name: string;
}

interface Service {
  id: string;
  code: string;
  name: string;
}

interface Branch {
  id: string;
  code: string;
  name: string;
}

interface Appointment {
  id: string;
  reference_code: string;
  appointment_at: string;
  status: string;
  confirmed_at?: string | null;
  checked_in_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  no_show?: boolean;
  services: { id: string; name: string; code: string } | null;
  profiles: { full_name: string | null; phone: string | null } | null;
  service_slots: { branch_id: string; branches: { name: string } | null } | null;
}

interface AppointmentsManagementProps {
  department: Department;
  appointments: Appointment[];
  services: Service[];
  branches: Branch[];
  stats: { status: string }[];
  deptId: string;
  filters: {
    status: string;
    service: string;
    date: string;
    search: string;
  };
  markConfirmedAction: (data: { id: string; deptId: string }) => Promise<{ ok: boolean; error?: string; message?: string; data?: { id: string } }>;
  markCheckedInAction: (data: { id: string; deptId: string }) => Promise<{ ok: boolean; error?: string; message?: string; data?: { id: string } }>;
  markStartedAction: (data: { id: string; deptId: string }) => Promise<{ ok: boolean; error?: string; message?: string; data?: { id: string } }>;
  markCompletedAction: (data: { id: string; deptId: string }) => Promise<{ ok: boolean; error?: string; message?: string; data?: { id: string } }>;
  markCancelledAction: (data: { id: string; deptId: string }) => Promise<{ ok: boolean; error?: string; message?: string; data?: { id: string } }>;
  markNoShowAction: (data: { id: string; deptId: string; value: boolean }) => Promise<{ ok: boolean; error?: string; message?: string; data?: { id: string } }>;
}

export function AppointmentsManagement({
  department,
  appointments,
  services,
  branches,
  stats,
  deptId,
  filters,
  markConfirmedAction,
  markCheckedInAction,
  markStartedAction,
  markCompletedAction,
  markCancelledAction,
  markNoShowAction
}: AppointmentsManagementProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [viewMode, setViewMode] = useState<"list" | "timeline">("list");

  // Filter appointments based on search
  const filteredAppointments = appointments.filter(appointment => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      appointment.reference_code.toLowerCase().includes(searchLower) ||
      appointment.profiles?.full_name?.toLowerCase().includes(searchLower) ||
      appointment.services?.name.toLowerCase().includes(searchLower)
    );
  });

  // Calculate stats
  const totalAppointments = stats.length;
  const completedCount = stats.filter(s => s.status === "completed").length;
  const pendingCount = stats.filter(s => s.status === "booked").length;
  const cancelledCount = stats.filter(s => s.status === "cancelled").length;
  const noShowCount = stats.filter(s => s.status === "no_show").length;

  // Group appointments by status for quick overview
  const groupedAppointments = filteredAppointments.reduce((acc, appointment) => {
    const status = appointment.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(appointment);
    return acc;
  }, {} as Record<string, Appointment[]>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "booked": return "bg-blue-50 text-blue-700 border-blue-200";
      case "confirmed": return "bg-green-50 text-green-700 border-green-200";
      case "checked_in": return "bg-orange-50 text-orange-700 border-orange-200";
      case "started": return "bg-purple-50 text-purple-700 border-purple-200";
      case "completed": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelled": return "bg-red-50 text-red-700 border-red-200";
      case "no_show": return "bg-gray-50 text-gray-700 border-gray-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "booked": return <Calendar className="w-4 h-4" />;
      case "confirmed": return <Shield className="w-4 h-4" />;
      case "checked_in": return <UserCheck className="w-4 h-4" />;
      case "started": return <Play className="w-4 h-4" />;
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      case "no_show": return <UserX className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatAppointmentTime = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return `Today ${format(date, "HH:mm")}`;
    if (isTomorrow(date)) return `Tomorrow ${format(date, "HH:mm")}`;
    return format(date, "MMM d, HH:mm");
  };

  const canConfirm = (appointment: Appointment) => {
    return appointment.status === "booked" && !appointment.confirmed_at;
  };

  const canCheckIn = (appointment: Appointment) => {
    return (appointment.status === "booked" || appointment.status === "confirmed") && !appointment.checked_in_at;
  };

  const canStart = (appointment: Appointment) => {
    return appointment.checked_in_at && !appointment.started_at;
  };

  const canComplete = (appointment: Appointment) => {
    return appointment.started_at && !appointment.completed_at;
  };

  const canCancel = (appointment: Appointment) => {
    return appointment.status === "booked" || appointment.status === "confirmed";
  };

  // Action handlers
  const handleAction = async (action: () => Promise<{ ok: boolean; error?: string; message?: string; data?: { id: string } }>, appointmentId: string) => {
    try {
      await action();
      // Reload the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Action failed:", error);
      alert("Action failed. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">{department.name} • {filteredAppointments.length} appointments</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{totalAppointments}</p>
              </div>
              <Calendar className="w-6 h-6 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <Clock className="w-6 h-6 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Cancelled</p>
                <p className="text-2xl font-bold">{cancelledCount}</p>
              </div>
              <XCircle className="w-6 h-6 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm font-medium">No-Shows</p>
                <p className="text-2xl font-bold">{noShowCount}</p>
              </div>
              <UserX className="w-6 h-6 text-gray-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-6">
          <form method="get" className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Reference, citizen, service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                defaultValue={filters.status}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="booked">Booked</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked_in">Checked In</option>
                <option value="started">Started</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
              <select
                name="service"
                defaultValue={filters.service}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Services</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                name="date"
                defaultValue={filters.date}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <Button type="submit" variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
              <div className="flex bg-gray-100 rounded-md p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1 text-xs rounded ${viewMode === "list" ? "bg-white shadow" : ""}`}
                >
                  List
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("timeline")}
                  className={`px-3 py-1 text-xs rounded ${viewMode === "timeline" ? "bg-white shadow" : ""}`}
                >
                  Timeline
                </button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Appointments Content */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? "Try adjusting your search criteria." : "No appointments scheduled for the selected period."}
            </p>

          </CardContent>
        </Card>
      ) : viewMode === "list" ? (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <Card 
              key={appointment.id} 
              className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => window.location.href = `/officer/departments/${deptId}/appointments/${appointment.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <span className="text-blue-600 font-mono text-xs font-bold">
                        {appointment.reference_code.slice(-4)}
                      </span>
                    </div>
                    
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {appointment.profiles?.full_name || "Unknown Citizen"}
                        </h3>
                        {appointment.profiles?.phone && (
                          <a 
                            href={`tel:${appointment.profiles.phone}`} 
                            className="text-blue-600 hover:text-blue-800 z-10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{appointment.services?.name || "Unknown Service"}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatAppointmentTime(appointment.appointment_at)}
                        </span>
                        {appointment.service_slots?.branches?.name && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {appointment.service_slots.branches.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <Badge 
                      className={`${getStatusColor(appointment.status)} border`}
                    >
                      <span className="flex items-center gap-1">
                        {getStatusIcon(appointment.status)}
                        {appointment.status.replace("_", " ")}
                      </span>
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link 
                            href={`/officer/departments/${deptId}/appointments/${appointment.id}`}
                            className="flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        {canConfirm(appointment) && (
                          <DropdownMenuItem
                            onClick={() => handleAction(
                              () => markConfirmedAction({ id: appointment.id, deptId }),
                              appointment.id
                            )}
                            className="text-green-600"
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Confirm
                          </DropdownMenuItem>
                        )}
                        
                        {canCheckIn(appointment) && (
                          <DropdownMenuItem
                            onClick={() => handleAction(
                              () => markCheckedInAction({ id: appointment.id, deptId }),
                              appointment.id
                            )}
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Check In
                          </DropdownMenuItem>
                        )}
                        
                        {canStart(appointment) && (
                          <DropdownMenuItem
                            onClick={() => handleAction(
                              () => markStartedAction({ id: appointment.id, deptId }),
                              appointment.id
                            )}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start Service
                          </DropdownMenuItem>
                        )}
                        
                        {canComplete(appointment) && (
                          <DropdownMenuItem
                            onClick={() => handleAction(
                              () => markCompletedAction({ id: appointment.id, deptId }),
                              appointment.id
                            )}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Complete
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          className="text-orange-600"
                          onClick={() => handleAction(
                            () => markNoShowAction({ id: appointment.id, deptId, value: true }),
                            appointment.id
                          )}
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Mark No-Show
                        </DropdownMenuItem>
                        
                        {canCancel(appointment) && (
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleAction(
                              () => markCancelledAction({ id: appointment.id, deptId }),
                              appointment.id
                            )}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Timeline view placeholder
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Timeline View</h3>
            <p className="text-gray-500">Timeline view coming soon!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
