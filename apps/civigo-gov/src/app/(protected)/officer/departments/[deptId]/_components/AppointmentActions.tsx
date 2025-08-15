"use client";

import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, UserCheck, Play, CheckCircle, XCircle, UserX, Eye } from "lucide-react";
import Link from "next/link";

interface Appointment {
  id: string;
  reference_code: string;
  status: string;
  checked_in_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
}

interface AppointmentActionsProps {
  appointment: Appointment;
  deptId: string;
  markCheckedInAction: (data: { id: string; deptId: string }) => Promise<void>;
  markStartedAction: (data: { id: string; deptId: string }) => Promise<void>;
  markCompletedAction: (data: { id: string; deptId: string }) => Promise<void>;
  markNoShowAction: (data: { id: string; deptId: string; value: boolean }) => Promise<void>;
  markCancelledAction: (data: { id: string; deptId: string }) => Promise<void>;
}

export function AppointmentActions({ 
  appointment, 
  deptId, 
  markCheckedInAction,
  markStartedAction,
  markCompletedAction,
  markNoShowAction,
  markCancelledAction
}: AppointmentActionsProps) {
  const canCheckIn = appointment.status === "booked" && !appointment.checked_in_at;
  const canStart = appointment.checked_in_at && !appointment.started_at;
  const canComplete = appointment.started_at && !appointment.completed_at;
  const canCancel = appointment.status === "booked";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
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
        
        {canCheckIn && (
          <DropdownMenuItem asChild>
            <form action={markCheckedInAction.bind(null, { id: appointment.id, deptId })}>
              <button type="submit" className="flex items-center gap-2 w-full">
                <UserCheck className="w-4 h-4" />
                Check In
              </button>
            </form>
          </DropdownMenuItem>
        )}
        
        {canStart && (
          <DropdownMenuItem asChild>
            <form action={markStartedAction.bind(null, { id: appointment.id, deptId })}>
              <button type="submit" className="flex items-center gap-2 w-full">
                <Play className="w-4 h-4" />
                Start Service
              </button>
            </form>
          </DropdownMenuItem>
        )}
        
        {canComplete && (
          <DropdownMenuItem asChild>
            <form action={markCompletedAction.bind(null, { id: appointment.id, deptId })}>
              <button type="submit" className="flex items-center gap-2 w-full">
                <CheckCircle className="w-4 h-4" />
                Complete
              </button>
            </form>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <form action={markNoShowAction.bind(null, { id: appointment.id, deptId, value: true })}>
            <button type="submit" className="flex items-center gap-2 w-full text-orange-600">
              <UserX className="w-4 h-4" />
              Mark No-Show
            </button>
          </form>
        </DropdownMenuItem>
        
        {canCancel && (
          <DropdownMenuItem asChild>
            <form action={markCancelledAction.bind(null, { id: appointment.id, deptId })}>
              <button type="submit" className="flex items-center gap-2 w-full text-red-600">
                <XCircle className="w-4 h-4" />
                Cancel
              </button>
            </form>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
