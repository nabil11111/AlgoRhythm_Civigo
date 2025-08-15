"use client";

import { useState, useEffect } from "react";
import { getBrowserClient } from "@/utils/supabase/client";

type DepartmentLogoProps = {
  logoPath?: string;
  departmentName: string;
  size: "small" | "large";
};

export default function DepartmentLogo({
  logoPath,
  departmentName,
  size,
}: DepartmentLogoProps) {
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const dimensions =
    size === "small" ? "w-[50px] h-[50px]" : "w-[80px] h-[80px]";
  const textSize = size === "small" ? "text-[8px]" : "text-[10px]";
  const placeholderText = size === "small" ? "LOGO" : "DEPT LOGO";

  useEffect(() => {
    if (logoPath && !imageError) {
      const supabase = getBrowserClient();

      // Get the public URL for the logo
      const { data } = supabase.storage
        .from("departments")
        .getPublicUrl(logoPath);

      setImageUrl(data.publicUrl);
    } else {
      setImageUrl(null);
    }
  }, [logoPath, imageError, departmentName, size]);

  return (
    <div
      className={`${dimensions} bg-gray-200 rounded grid place-items-center overflow-hidden ${
        size === "large" ? "mx-auto mb-4" : ""
      }`}
    >
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={`${departmentName} logo`}
          className={`w-full h-full object-cover ${
            size === "large" ? "rounded" : ""
          }`}
          onError={() => {
            console.log("Image load error for:", imageUrl, "path:", logoPath);
            setImageError(true);
          }}
        />
      ) : (
        <span
          className={`${textSize} text-gray-500 ${
            size === "large" ? "font-medium" : ""
          }`}
        >
          {placeholderText}
        </span>
      )}
    </div>
  );
}
