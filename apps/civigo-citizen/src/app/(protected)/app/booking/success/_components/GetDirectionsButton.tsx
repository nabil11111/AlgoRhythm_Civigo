"use client";

type GetDirectionsButtonProps = {
  branchName: string;
  branchAddress?: string;
  locationUrl?: string;
};

export default function GetDirectionsButton({
  branchName,
  branchAddress,
  locationUrl,
}: GetDirectionsButtonProps) {
  const getDirections = () => {
    // Priority: Use location_url from meta if available, otherwise construct a search
    if (locationUrl) {
      window.open(locationUrl, "_blank");
      return;
    }

    // Fallback: Create a Google Maps search URL
    const searchQuery = branchAddress
      ? `${branchName}, ${branchAddress}`
      : branchName;
    const encodedQuery = encodeURIComponent(searchQuery);

    // Detect mobile device
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    let mapsUrl: string;

    if (isMobile) {
      // For mobile, try to open native maps apps
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      if (isIOS) {
        // iOS: Try Apple Maps first, fallback to Google Maps
        mapsUrl = `maps://maps.apple.com/?q=${encodedQuery}`;

        // Try to open Apple Maps
        const appleLink = document.createElement("a");
        appleLink.href = mapsUrl;
        appleLink.click();

        // Fallback to Google Maps after a short delay if Apple Maps doesn't open
        setTimeout(() => {
          window.open(
            `https://maps.google.com/maps?q=${encodedQuery}`,
            "_blank"
          );
        }, 500);
        return;
      } else {
        // Android: Try Google Maps app, fallback to web
        mapsUrl = `geo:0,0?q=${encodedQuery}`;

        try {
          window.location.href = mapsUrl;
        } catch (error) {
          window.open(
            `https://maps.google.com/maps?q=${encodedQuery}`,
            "_blank"
          );
        }
        return;
      }
    } else {
      // Desktop: Use Google Maps web
      mapsUrl = `https://maps.google.com/maps?q=${encodedQuery}`;
      window.open(mapsUrl, "_blank");
    }
  };

  return (
    <button
      onClick={getDirections}
      className="w-full border-2 border-[var(--color-primary)] text-[#1d1d1d] text-[16px] font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors"
    >
      Get Directions
    </button>
  );
}
