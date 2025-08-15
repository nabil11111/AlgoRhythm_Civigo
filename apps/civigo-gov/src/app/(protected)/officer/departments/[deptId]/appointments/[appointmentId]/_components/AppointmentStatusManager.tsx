"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Clock,
  UserCheck,
  Play,
  CheckCircle,
  XCircle,
  UserX,
  AlertTriangle
} from "lucide-react";


interface Appointment {
  id: string;
  status: string;
  no_show?: boolean;
  appointment_at: string;
  checked_in_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
}

interface AppointmentStatusManagerProps {
  appointment: Appointment;
  deptId: string;
  markCheckedInAction: (data: { id: string; deptId: string }) => Promise<any>;
  markStartedAction: (data: { id: string; deptId: string }) => Promise<any>;
  markCompletedAction: (data: { id: string; deptId: string }) => Promise<any>;
  markCancelledAction: (data: { id: string; deptId: string }) => Promise<any>;
  markNoShowAction: (data: { id: string; deptId: string; value: boolean }) => Promise<any>;
}

export function AppointmentStatusManager({
  appointment,
  deptId,
  markCheckedInAction,
  markStartedAction,
  markCompletedAction,
  markCancelledAction,
  markNoShowAction
}: AppointmentStatusManagerProps) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleAction = async (action: () => Promise<any>, actionName: string) => {
    setIsProcessing(actionName);
    try {
      await action();
      window.location.reload();
    } catch (error) {
      console.error(`${actionName} failed:`, error);
      alert(`Failed to ${actionName.toLowerCase()}. Please try again.`);
    } finally {
      setIsProcessing(null);
    }
  };

  const getStatusInfo = (status: string, noShow?: boolean) => {
    if (noShow) {
      return {
        label: "No Show",
        color: "bg-gray-50 text-gray-700 border-gray-200",
        icon: <UserX className="w-4 h-4" />
      };
    }

    switch (status) {
      case "booked":
        return {
          label: "Booked",
          color: "bg-blue-50 text-blue-700 border-blue-200",
          icon: <Calendar className="w-4 h-4" />
        };
      case "checked_in":
        return {
          label: "Checked In",
          color: "bg-orange-50 text-orange-700 border-orange-200",
          icon: <UserCheck className="w-4 h-4" />
        };
      case "started":
        return {
          label: "In Progress",
          color: "bg-purple-50 text-purple-700 border-purple-200",
          icon: <Play className="w-4 h-4" />
        };
      case "completed":
        return {
          label: "Completed",
          color: "bg-green-50 text-green-700 border-green-200",
          icon: <CheckCircle className="w-4 h-4" />
        };
      case "cancelled":
        return {
          label: "Cancelled",
          color: "bg-red-50 text-red-700 border-red-200",
          icon: <XCircle className="w-4 h-4" />
        };
      default:
        return {
          label: status,
          color: "bg-gray-50 text-gray-700 border-gray-200",
          icon: <Clock className="w-4 h-4" />
        };
    }
  };

  const statusInfo = getStatusInfo(appointment.status, appointment.no_show);

  const canCheckIn = appointment.status === "booked" && !appointment.checked_in_at;
  const canStart = appointment.checked_in_at && !appointment.started_at;
  const canComplete = appointment.started_at && !appointment.completed_at;
  const canCancel = appointment.status === "booked";
  const canMarkNoShow = !appointment.no_show && appointment.status !== "completed";

  const isCompleted = appointment.status === "completed";
  const isCancelled = appointment.status === "cancelled";
  const isNoShow = appointment.no_show;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Appointment Status</span>
          <Badge className={`${statusInfo.color} border flex items-center gap-1`}>
            {statusInfo.icon}
            {statusInfo.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Timeline */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className={`w-2 h-2 rounded-full ${appointment.appointment_at ? 'bg-blue-500' : 'bg-gray-300'}`} />
            <span className="text-gray-600">Appointment Scheduled</span>
            <span className="text-gray-500 ml-auto">
              {new Date(appointment.appointment_at).toLocaleString()}
            </span>
          </div>
          
          {appointment.checked_in_at && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-gray-600">Checked In</span>
              <span className="text-gray-500 ml-auto">
                {new Date(appointment.checked_in_at).toLocaleString()}
              </span>
            </div>
          )}
          
          {appointment.started_at && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-gray-600">Service Started</span>
              <span className="text-gray-500 ml-auto">
                {new Date(appointment.started_at).toLocaleString()}
              </span>
            </div>
          )}
          
          {appointment.completed_at && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-gray-600">Completed</span>
              <span className="text-gray-500 ml-auto">
                {new Date(appointment.completed_at).toLocaleString()}
              </span>
            </div>
          )}
          
          {appointment.cancelled_at && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-gray-600">Cancelled</span>
              <span className="text-gray-500 ml-auto">
                {new Date(appointment.cancelled_at).toLocaleString()}
              </span>
            </div>
          )}
          
          {appointment.no_show && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              <span className="text-gray-600">Marked as No-Show</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isCompleted && !isCancelled && !isNoShow && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Available Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              {canCheckIn && (
                <Button
                  onClick={() => handleAction(
                    () => markCheckedInAction({ id: appointment.id, deptId }),
                    "Check In"
                  )}
                  disabled={isProcessing !== null}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  {isProcessing === "Check In" ? "Processing..." : "Check In"}
                </Button>
              )}

              {canStart && (
                <Button
                  onClick={() => handleAction(
                    () => markStartedAction({ id: appointment.id, deptId }),
                    "Start Service"
                  )}
                  disabled={isProcessing !== null}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {isProcessing === "Start Service" ? "Processing..." : "Start Service"}
                </Button>
              )}

              {canComplete && (
                <Button
                  onClick={() => handleAction(
                    () => markCompletedAction({ id: appointment.id, deptId }),
                    "Complete"
                  )}
                  disabled={isProcessing !== null}
                  size="sm"
                  className="flex items-center gap-2 col-span-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isProcessing === "Complete" ? "Processing..." : "Mark Complete"}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Destructive Actions */}
        {!isCompleted && !isCancelled && !isNoShow && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Other Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              {canMarkNoShow && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
                  disabled={isProcessing !== null}
                  onClick={() => {
                    if (confirm("Are you sure you want to mark this appointment as a no-show? This action cannot be undone.")) {
                      handleAction(
                        () => markNoShowAction({ id: appointment.id, deptId, value: true }),
                        "Mark No-Show"
                      );
                    }
                  }}
                >
                  <UserX className="w-4 h-4" />
                  {isProcessing === "Mark No-Show" ? "Processing..." : "No-Show"}
                </Button>
              )}

              {canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  disabled={isProcessing !== null}
                  onClick={() => {
                    if (confirm("Are you sure you want to cancel this appointment? This action cannot be undone.")) {
                      handleAction(
                        () => markCancelledAction({ id: appointment.id, deptId }),
                        "Cancel"
                      );
                    }
                  }}
                >
                  <XCircle className="w-4 h-4" />
                  {isProcessing === "Cancel" ? "Processing..." : "Cancel"}
                </Button>
              )}
            </div>
          </div>
        )}

        {(isCompleted || isCancelled || isNoShow) && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <AlertTriangle className="w-4 h-4" />
              <span>
                {isCompleted && "This appointment has been completed."}
                {isCancelled && "This appointment has been cancelled."}
                {isNoShow && "This appointment was marked as a no-show."}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
