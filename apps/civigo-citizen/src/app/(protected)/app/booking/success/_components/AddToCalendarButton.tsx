"use client";

type AddToCalendarButtonProps = {
  serviceName: string;
  branchName: string;
  branchAddress?: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
};

export default function AddToCalendarButton({
  serviceName,
  branchName,
  branchAddress,
  appointmentDate,
  startTime,
  endTime,
}: AddToCalendarButtonProps) {
  const addToCalendar = () => {
    // Format the event details for calendar
    const title = `${serviceName} - ${branchName}`;
    const location = branchAddress || branchName;

    // Create start and end date strings in the format YYYYMMDDTHHMMSSZ
    const startDateTime = new Date(`${appointmentDate}T${startTime}`);
    const endDateTime = new Date(`${appointmentDate}T${endTime}`);

    const formatDateForCalendar = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const startFormatted = formatDateForCalendar(startDateTime);
    const endFormatted = formatDateForCalendar(endDateTime);

    // Create Google Calendar URL
    const googleCalendarUrl = new URL(
      "https://calendar.google.com/calendar/render"
    );
    googleCalendarUrl.searchParams.set("action", "TEMPLATE");
    googleCalendarUrl.searchParams.set("text", title);
    googleCalendarUrl.searchParams.set(
      "dates",
      `${startFormatted}/${endFormatted}`
    );
    googleCalendarUrl.searchParams.set("location", location);
    googleCalendarUrl.searchParams.set(
      "details",
      `Appointment for ${serviceName} at ${branchName}`
    );

    // Try to detect if user is on mobile
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (isMobile) {
      // For mobile, try to open the native calendar app first
      const calendarData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Civigo//Appointment//EN
BEGIN:VEVENT
UID:${Date.now()}@civigo.app
DTSTAMP:${formatDateForCalendar(new Date())}
DTSTART:${startFormatted}
DTEND:${endFormatted}
SUMMARY:${title}
LOCATION:${location}
DESCRIPTION:Appointment for ${serviceName} at ${branchName}
END:VEVENT
END:VCALENDAR`;

      const blob = new Blob([calendarData], {
        type: "text/calendar;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `appointment-${serviceName
        .replace(/\s+/g, "-")
        .toLowerCase()}.ics`;

      try {
        link.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        // Fallback to Google Calendar
        window.open(googleCalendarUrl.toString(), "_blank");
      }
    } else {
      // For desktop, open Google Calendar
      window.open(googleCalendarUrl.toString(), "_blank");
    }
  };

  return (
    <button
      onClick={addToCalendar}
      className="w-full bg-[var(--color-primary)] text-white text-[16px] font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
    >
      Add to Calendar
    </button>
  );
}
