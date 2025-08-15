"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Calendar,
  Clock,
  Plus,
  Filter,
  Download,
  MoreVertical,
  Users,
  Check,
  X,
  Edit,
  Trash2,
  CalendarDays,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import CreateSlotsBatchDialog from "./CreateSlotsBatchDialog";

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

interface Slot {
  id: string;
  slot_at: string;
  duration_minutes: number;
  capacity: number;
  active: boolean;
  branch_id: string;
}

interface Appointment {
  slot_id: string;
  status: string;
}

interface SlotsManagementProps {
  service: Service;
  branches: Branch[];
  slots: Slot[];
  appointments: Appointment[];
  deptId: string;
  selectedBranchId?: string;
  dateFrom: string;
  dateTo: string;
}

export function SlotsManagement({
  service,
  branches,
  slots,
  appointments,
  deptId,
  selectedBranchId,
  dateFrom,
  dateTo
}: SlotsManagementProps) {
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");
  
  // Initialize with today's date expanded by default
  const todayDate = new Date().toISOString().split('T')[0];
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set([todayDate]));

  // Calculate booking counts
  const getBookingCount = (slotId: string) => {
    return appointments.filter(app => app.slot_id === slotId).length;
  };

  // Group slots by date
  const groupedSlots = slots.reduce((acc, slot) => {
    const date = slot.slot_at.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, Slot[]>);

  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d, yyyy");
  };

  const getBranchName = (branchId: string) => {
    return branches.find(b => b.id === branchId)?.name || "Unknown Branch";
  };

  const getSlotUtilization = (slot: Slot) => {
    const booked = getBookingCount(slot.id);
    return Math.round((booked / slot.capacity) * 100);
  };

  const toggleDayExpansion = (date: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDays(newExpanded);
  };

  const isDateExpanded = (date: string) => expandedDays.has(date);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Time Slots</h1>
          <div className="flex items-center gap-2 text-gray-600 mt-1">
            <span>{service.name}</span>
            <Badge variant="secondary" className="font-mono text-xs">{service.code}</Badge>
            <span>•</span>
            <span>{slots.length} slots</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <CreateSlotsBatchDialog 
            serviceId={service.id}
            branches={branches}
            selectedBranchId={selectedBranchId}
          />

        </div>
      </div>

      {/* Filters & Controls */}
      <Card>
        <CardContent className="p-6">
          <form method="get" className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <select
                name="branchId"
                defaultValue={selectedBranchId || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Branches</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <Input
                type="date"
                name="from"
                defaultValue={dateFrom}
                className="text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <Input
                type="date"
                name="to"
                defaultValue={dateTo}
                className="text-sm"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
              <div className="flex bg-gray-100 rounded-md p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1 text-xs rounded ${viewMode === "grid" ? "bg-white shadow" : ""}`}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("calendar")}
                  className={`px-3 py-1 text-xs rounded ${viewMode === "calendar" ? "bg-white shadow" : ""}`}
                >
                  Calendar
                </button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Slots</p>
                <p className="text-xl font-semibold">{slots.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Slots</p>
                <p className="text-xl font-semibold">{slots.filter(s => s.active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Capacity</p>
                <p className="text-xl font-semibold">{slots.reduce((sum, s) => sum + s.capacity, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bookings</p>
                <p className="text-xl font-semibold">{appointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Slots Content */}
      {slots.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No time slots</h3>
            <p className="text-gray-500 mb-4">
              Create your first time slot to start accepting appointments for this service.
            </p>
            <div className="flex gap-2 justify-center">
              <CreateSlotsBatchDialog 
                serviceId={service.id}
                branches={branches}
                selectedBranchId={selectedBranchId}
              />
            </div>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="space-y-6">
          {Object.entries(groupedSlots)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, dateSlots]) => {
              const isExpanded = isDateExpanded(date);
              return (
                <Card key={date}>
                  <CardHeader className="pb-3">
                    <CardTitle 
                      className="text-lg flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => toggleDayExpansion(date)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                      <Calendar className="w-5 h-5" />
                      {formatDate(date)}
                      <Badge variant="secondary" className="ml-2">
                        {dateSlots.length} slots
                      </Badge>
                      <span className="text-sm text-gray-500 ml-auto">
                        {isExpanded ? 'Click to collapse' : 'Click to expand'}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dateSlots
                      .sort((a, b) => a.slot_at.localeCompare(b.slot_at))
                      .map((slot) => {
                        const bookingCount = getBookingCount(slot.id);
                        const utilization = getSlotUtilization(slot);
                        const time = format(parseISO(slot.slot_at), "HH:mm");
                        
                        return (
                          <div
                            key={slot.id}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              slot.active 
                                ? "border-green-200 bg-green-50" 
                                : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-medium text-lg">{time}</p>
                                <p className="text-sm text-gray-600">
                                  {slot.duration_minutes} minutes
                                </p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Slot
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    {slot.active ? (
                                      <>
                                        <X className="w-4 h-4 mr-2" />
                                        Deactivate
                                      </>
                                    ) : (
                                      <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Activate
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Slot
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Branch:</span>
                                <span className="font-medium">{getBranchName(slot.branch_id)}</span>
                              </div>
                              
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Capacity:</span>
                                <span className="font-medium">{bookingCount}/{slot.capacity}</span>
                              </div>
                              
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Utilization:</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full transition-all ${
                                        utilization >= 80 ? "bg-red-500" :
                                        utilization >= 60 ? "bg-orange-500" :
                                        "bg-green-500"
                                      }`}
                                      style={{ width: `${Math.min(utilization, 100)}%` }}
                                    />
                                  </div>
                                  <span className="font-medium">{utilization}%</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                              <Badge
                                variant={slot.active ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {slot.active ? "Active" : "Inactive"}
                              </Badge>
                              {bookingCount === slot.capacity && (
                                <Badge variant="destructive" className="text-xs">
                                  Full
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
        </div>
      ) : (
        // Calendar view placeholder
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar View</h3>
            <p className="text-gray-500">Calendar view coming soon!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
