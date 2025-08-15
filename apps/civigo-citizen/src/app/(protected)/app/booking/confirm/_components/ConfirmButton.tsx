"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/utils/supabase/client";

type ConfirmButtonProps = {
  serviceId: string;
  branchId: string;
  slotId: string;
  citizenId: string;
};

export default function ConfirmButton({
  serviceId,
  branchId,
  slotId,
  citizenId,
}: ConfirmButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = getBrowserClient();

  const handleConfirm = async () => {
    if (loading) return;

    setLoading(true);
    try {
      // Call the booking RPC function
      const { data, error } = await supabase.rpc("book_appointment_slot", {
        p_slot_id: slotId,
        p_citizen_id: citizenId,
        p_notes: null,
        p_citizen_gov_id: null, // You may want to pass this if available
      });

      if (error) {
        console.error("Booking error:", error);
        alert("Failed to book appointment. Please try again.");
        return;
      }

      if (data?.ok) {
        // Redirect to success page with appointment ID
        router.push(
          `/app/booking/success?appointmentId=${data.appointment_id}`
        );
      } else {
        // Handle booking failure
        const errorMessage =
          data?.error === "slot_full"
            ? "This time slot is no longer available. Please select another time."
            : data?.error === "slot_inactive"
            ? "This time slot is no longer active. Please select another time."
            : "Failed to book appointment. Please try again.";

        alert(errorMessage);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleConfirm}
      disabled={loading}
      className={`w-full text-white text-[16px] font-bold py-3 rounded-lg transition-colors ${
        loading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-[var(--color-primary)] hover:bg-blue-700"
      }`}
    >
      {loading ? "Booking..." : "Confirm"}
    </button>
  );
}
