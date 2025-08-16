"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/utils/supabase/client";
import DocumentSelector from "../../../../_components/DocumentSelector";

type Branch = {
  id: string;
  code: string;
  name: string;
  address?: string;
};

type Slot = {
  id: string;
  slot_at: string;
  duration_minutes: number;
  capacity: number;
  branch_id: string;
};

type BookingFormProps = {
  serviceId: string;
  branches: Branch[];
};

export default function BookingForm({ serviceId, branches }: BookingFormProps) {
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  // Helper to compute UTC range for a given local YYYY-MM-DD
  const getSelectedDateUtcRange = (dateStr: string) => {
    const [yearStr, monthStr, dayStr] = dateStr.split("-");
    const year = Number(yearStr);
    const monthIndex = Number(monthStr) - 1; // JS Date month is 0-based
    const day = Number(dayStr);
    const startLocal = new Date(year, monthIndex, day, 0, 0, 0, 0);
    const endLocalExclusive = new Date(year, monthIndex, day + 1, 0, 0, 0, 0);
    return {
      startIso: startLocal.toISOString(),
      endIsoExclusive: endLocalExclusive.toISOString(),
    };
  };

  const supabase = getBrowserClient();
  const router = useRouter();

  // Fetch available dates when branch is selected
  useEffect(() => {
    if (selectedBranch && serviceId) {
      fetchAvailableDates();
    }
  }, [selectedBranch, serviceId]);

  // Fetch available slots when date is selected
  useEffect(() => {
    if (selectedDate && serviceId) {
      if (selectedBranch) {
        fetchAvailableSlots();
      } else {
        // If no branch selected, clear slots and show message
        setAvailableSlots([]);
      }
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, selectedBranch, serviceId]);

  const fetchAvailableDates = async () => {
    setLoadingDates(true);
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3); // Next 3 months

      console.log("Fetching slots for:", {
        serviceId,
        selectedBranch,
        startDate,
        endDate,
      });

      const { data: slots, error } = await supabase
        .from("service_slots")
        .select("slot_at")
        .eq("service_id", serviceId)
        .eq("branch_id", selectedBranch)
        .eq("active", true)
        .gte("slot_at", startDate.toISOString())
        .lte("slot_at", endDate.toISOString());

      console.log("Slots response:", { slots, error });

      if (slots) {
        const dates = Array.from(
          new Set(
            slots.map((slot) => {
              // Parse the UTC timestamp
              const date = new Date(slot.slot_at);

              // Use LOCAL date extraction - this is what user sees in their timezone
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const day = String(date.getDate()).padStart(2, "0");
              const localDateStr = `${year}-${month}-${day}`;

              console.log("Slot date extraction:", {
                originalUTC: slot.slot_at,
                parsedLocalDate: date.toString(),
                extractedDate: localDateStr,
                userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              });

              return localDateStr;
            })
          )
        );
        console.log("Available dates:", dates);
        setAvailableDates(dates);
      } else {
        setAvailableDates([]);
      }
    } catch (error) {
      console.error("Error fetching available dates:", error);
      setAvailableDates([]);
    } finally {
      setLoadingDates(false);
    }
  };

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      console.log("Fetching slots for selected date:", selectedDate);

      // Fetch slots (scoped to the selected day) and appointments to check capacity
      const { startIso, endIsoExclusive } =
        getSelectedDateUtcRange(selectedDate);
      const [slotsResult, appointmentsResult] = await Promise.all([
        supabase
          .from("service_slots")
          .select("*")
          .eq("service_id", serviceId)
          .eq("branch_id", selectedBranch)
          .eq("active", true)
          .gte("slot_at", startIso)
          .lt("slot_at", endIsoExclusive)
          .order("slot_at", { ascending: true }),
        supabase
          .from("appointments")
          .select("slot_id, appointment_at, status")
          .eq("service_id", serviceId)
          .in("status", ["booked"]),
      ]);

      const allSlots = slotsResult.data || [];
      const appointments = appointmentsResult.data || [];

      console.log("Fetched data:", {
        selectedDate,
        allSlots,
        appointments,
        slotsError: slotsResult.error,
        appointmentsError: appointmentsResult.error,
      });

      if (allSlots) {
        // Filter by capacity only (date is already filtered at DB level)
        const capacityFiltered = allSlots.filter((slot) => {
          const bookedCount = appointments.filter(
            (apt) => apt.slot_id === slot.id && apt.status === "booked"
          ).length;
          const hasCapacity = bookedCount < slot.capacity;
          console.log("Capacity check:", {
            slotAt: slot.slot_at,
            capacity: slot.capacity,
            bookedCount,
            hasCapacity,
          });
          return hasCapacity;
        });

        console.log("Filtered slots for date:", capacityFiltered);
        setAvailableSlots(capacityFiltered);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
  };

  const isDateAvailable = (date: Date): boolean => {
    // Use local date extraction to match with how availableDates are created
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    return availableDates.includes(dateStr);
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const formatTime = (slotAt: string): string => {
    const date = new Date(slotAt);
    // Display time in user's local timezone with proper formatting
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleDateSelect = (date: Date) => {
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    const isWeekendDay = isWeekend(date);
    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
    const hasAvailableSlots = isDateAvailable(date);

    // Debug logging first
    console.log("Date clicked:", {
      date: date.toISOString().split("T")[0],
      isCurrentMonth,
      isWeekendDay,
      isPast,
      hasAvailableSlots,
      availableDates,
    });

    // Only allow clicking on current month, non-weekend, non-past dates
    if (!isCurrentMonth || isWeekendDay || isPast) {
      console.log("Date click blocked due to conditions");
      return;
    }

    // Use local date format to match our fetching logic
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const localDateStr = `${year}-${month}-${day}`;

    setSelectedDate(localDateStr);
    setSelectedSlot(""); // Reset selected slot

    console.log("Date successfully selected:", {
      clickedDate: date.toString(),
      localDateStr: localDateStr,
      utcDateStr: date.toISOString().split("T")[0],
    });
  };

  const handleBooking = async () => {
    if (!selectedSlot || !selectedBranch || !selectedDate) return;

    setIsBooking(true);
    try {
      // Get the selected slot details
      const slot = availableSlots.find((s) => s.id === selectedSlot);
      if (!slot) return;

      // Create URL parameters for the confirmation page
      const slotDate = new Date(slot.slot_at);

      // Use local time for display (what user expects to see)
      const localTime = slotDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // Use 24-hour format for consistency
      });

      console.log("Booking confirmation params:", {
        slotAt: slot.slot_at,
        slotDate: slotDate.toString(),
        localTime: localTime,
        selectedDate: selectedDate,
      });

      const params = new URLSearchParams({
        serviceId,
        branchId: selectedBranch,
        date: selectedDate,
        time: localTime, // Use properly formatted local time
        slotId: selectedSlot,
      });

      // Add selected documents to params
      if (selectedDocuments.length > 0) {
        params.set("documents", selectedDocuments.join(","));
      }

      // Navigate to confirmation page
      router.push(`/app/booking/confirm?${params.toString()}`);
    } catch (error) {
      console.error("Error navigating to confirmation:", error);
    } finally {
      setIsBooking(false);
    }
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <>
      {/* Branch Selection */}
      <div className="mb-6 border border-[#e0e0e0] rounded-lg p-4">
        <label className="block text-[16px] font-bold text-[#4f4f4f] mb-3">
          Select Nearest Branch:
        </label>
        <div className="relative">
          <select
            value={selectedBranch}
            onChange={(e) => {
              setSelectedBranch(e.target.value);
              setSelectedDate("");
              setSelectedSlot("");
            }}
            className="w-[320px] h-[55px] border border-[#828282] rounded-[10px] px-4 text-[16px] text-[#4f4f4f] appearance-none bg-white"
          >
            <option value="">Select</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
                {branch.address && ` - ${branch.address}`}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path
                d="M1 1L6 6L11 1"
                stroke="#4f4f4f"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Date Selection */}
      {selectedBranch && (
        <div className="mb-6">
          <h2 className="text-[16px] font-bold text-[#4f4f4f] mb-4">
            Select Date:
          </h2>
          <div className="border border-[#e0e0e0] rounded-lg p-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[20px] font-semibold text-[#1d1b20]">
                {monthNames[currentMonth.getMonth()]}{" "}
                {currentMonth.getFullYear()}
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const prevMonth = new Date(currentMonth);
                    prevMonth.setMonth(prevMonth.getMonth() - 1);
                    setCurrentMonth(prevMonth);
                  }}
                  className="w-12 h-12 rounded-full hover:bg-gray-100 grid place-items-center"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M15 18L9 12L15 6"
                      stroke="#1d1b20"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextMonth = new Date(currentMonth);
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    setCurrentMonth(nextMonth);
                  }}
                  className="w-12 h-12 rounded-full hover:bg-gray-100 grid place-items-center"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="#1d1b20"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="mb-4">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <div
                    key={i}
                    className="h-12 grid place-items-center text-[16px] text-[#1d1b20] font-medium"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                  const isCurrentMonth =
                    date.getMonth() === currentMonth.getMonth();
                  const isToday =
                    date.toDateString() === new Date().toDateString();
                  // Use local date format for selection comparison
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const day = String(date.getDate()).padStart(2, "0");
                  const dateStr = `${year}-${month}-${day}`;
                  const isSelected = selectedDate === dateStr;
                  const isAvailable = isDateAvailable(date);
                  const isWeekendDay = isWeekend(date);
                  const isPast =
                    date < new Date(new Date().setHours(0, 0, 0, 0));

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDateSelect(date)}
                      disabled={!isCurrentMonth || isWeekendDay || isPast}
                      className={`
                        h-12 w-12 rounded-full grid place-items-center text-[16px] mx-auto transition-colors
                        ${!isCurrentMonth ? "text-gray-300" : ""}
                        ${
                          isWeekendDay || isPast
                            ? "text-gray-400 cursor-not-allowed"
                            : ""
                        }
                        ${
                          isSelected
                            ? "bg-[var(--color-primary)] text-white font-medium"
                            : ""
                        }
                        ${
                          isToday && !isSelected
                            ? "border-2 border-[var(--color-secondary)] text-[var(--color-secondary)]"
                            : ""
                        }
                        ${
                          isAvailable &&
                          !isSelected &&
                          !isToday &&
                          !isWeekendDay &&
                          !isPast
                            ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                            : ""
                        }
                        ${
                          !isAvailable &&
                          !isSelected &&
                          !isToday &&
                          !isWeekendDay &&
                          !isPast &&
                          isCurrentMonth
                            ? "text-[#1d1b20] hover:bg-gray-100"
                            : ""
                        }
                      `}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Selection */}
      {selectedDate && (
        <div className="mb-6">
          <h2 className="text-[16px] font-bold text-[#4f4f4f] mb-4">
            Select Time:
          </h2>
          {loadingSlots ? (
            <div className="text-center py-4">Loading time slots...</div>
          ) : availableSlots.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`
                    min-w-[90px] h-11 rounded-md grid place-items-center text-[16px] font-medium flex-shrink-0 transition-colors
                    ${
                      selectedSlot === slot.id
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
                  `}
                >
                  {formatTime(slot.slot_at)}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-[16px] mb-2">No time slots available</div>
              <div className="text-[14px]">
                {!selectedBranch
                  ? "Please select a branch first"
                  : "Please select a different date or try another branch"}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Document Presubmission Section */}
      {selectedSlot && (
        <div className="mb-6">
          <DocumentSelector
            selectedDocumentIds={selectedDocuments}
            onSelectionChange={setSelectedDocuments}
            title="Presubmit Documents (Optional)"
            description="Select documents to attach to your appointment. This can help speed up your visit."
          />
        </div>
      )}

      {/* Next Button */}
      <button
        onClick={handleBooking}
        disabled={!selectedSlot || loadingSlots || isBooking}
        className={`
          w-full h-[43px] font-bold rounded-lg text-[16px] transition-colors
          ${
            selectedSlot && !loadingSlots && !isBooking
              ? "bg-[var(--color-primary)] text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }
        `}
      >
        {isBooking ? "Processing..." : "Next"}
      </button>
    </>
  );
}
