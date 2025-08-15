"use client";

import { useState, useEffect } from "react";
import { getBrowserClient } from "@/utils/supabase/client";

type PDFDownloadProps = {
  pdfPath: string;
  fileName?: string;
};

export default function PDFDownload({
  pdfPath,
  fileName = "instructions.pdf",
}: PDFDownloadProps) {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (pdfPath) {
      const supabase = getBrowserClient();

      // Get the public URL for the PDF
      const { data } = supabase.storage
        .from("departments")
        .getPublicUrl(pdfPath);

      console.log("PDFDownload debug:", {
        pdfPath,
        publicUrl: data.publicUrl,
        fileName,
      });
      setDownloadUrl(data.publicUrl);
    }
  }, [pdfPath]);

  const handleDownload = async () => {
    if (!downloadUrl) return;

    setIsLoading(true);
    try {
      // Open the PDF in a new tab
      window.open(downloadUrl, "_blank");
    } catch (error) {
      console.error("Error opening PDF:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!downloadUrl) {
    return null;
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isLoading}
      className="inline-flex items-center gap-2 text-[var(--color-primary)] text-[14px] font-medium hover:underline disabled:opacity-50"
    >
      {isLoading ? "Opening..." : "Download PDF Instructions"}
    </button>
  );
}
