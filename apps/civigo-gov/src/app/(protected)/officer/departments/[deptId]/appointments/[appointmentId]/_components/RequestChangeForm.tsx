"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Send, CheckCircle, Mail } from "lucide-react";

type RequestChangeFormProps = {
  appointmentId: string;
  deptId: string;
  sendChangeRequestAction: (input: {
    appointmentId: string;
    deptId: string;
    message: string;
  }) => Promise<{ ok: boolean; error?: string; message?: string; data?: { sent: boolean } }>;
};

export function RequestChangeForm({ appointmentId, deptId, sendChangeRequestAction }: RequestChangeFormProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setSubmitResult({
        type: "error",
        message: "Please enter a message before sending."
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const result = await sendChangeRequestAction({
        appointmentId,
        deptId,
        message: message.trim(),
      });

      if (result.ok) {
        setSubmitResult({
          type: "success",
          message: "Change request sent successfully to the citizen."
        });
        setMessage(""); // Clear the form
      } else {
        setSubmitResult({
          type: "error",
          message: result.message || "Failed to send change request. Please try again."
        });
      }
    } catch (error) {
      setSubmitResult({
        type: "error",
        message: "An unexpected error occurred. Please try again."
      });
      console.error("Error sending change request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Send Change Request
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="changeMessage" className="block text-sm font-medium text-gray-700 mb-2">
              Message to Citizen
            </label>
            <Textarea
              id="changeMessage"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message about the required changes (e.g., 'Please bring additional documents', 'Your appointment time needs to be adjusted', etc.)"
              className="min-h-[100px]"
              maxLength={500}
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Explain what changes are needed or what the citizen should do.
              </p>
              <p className="text-xs text-gray-400">
                {message.length}/500
              </p>
            </div>
          </div>

          {submitResult && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              submitResult.type === "success" 
                ? "bg-green-50 border border-green-200 text-green-800" 
                : "bg-red-50 border border-red-200 text-red-800"
            }`}>
              {submitResult.type === "success" ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <p className="text-sm">{submitResult.message}</p>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isSubmitting || !message.trim()}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Change Request
              </>
            )}
          </Button>
        </form>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> The citizen will receive an email with your message and appointment details. 
            They can then contact the department to discuss any necessary changes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
