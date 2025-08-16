"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, X, XCircle } from "lucide-react";

type CancelAppointmentDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  appointmentId: string;
  isLoading?: boolean;
};

export function CancelAppointmentDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  appointmentId,
  isLoading = false 
}: CancelAppointmentDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim());
      setReason(""); // Clear the form
      onClose();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason(""); // Clear form when closing
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">Cancel Appointment</DialogTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Are you sure you want to cancel this appointment?
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  The citizen will be notified via email with your reason for cancellation.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="cancellationReason" className="block text-sm font-medium text-gray-700">
              Reason for Cancellation <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="cancellationReason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why this appointment is being cancelled (e.g., officer unavailable, department closed, technical issues, etc.)"
              className="min-h-[80px]"
              maxLength={500}
              disabled={isSubmitting}
              required
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                This reason will be included in the email to the citizen.
              </p>
              <p className="text-xs text-gray-400">
                {reason.length}/500
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Keep Appointment
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isSubmitting || !reason.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Appointment
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
