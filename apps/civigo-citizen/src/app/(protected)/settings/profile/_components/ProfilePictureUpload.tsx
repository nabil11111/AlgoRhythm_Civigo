"use client";

import { useState, useRef } from "react";

export default function ProfilePictureUpload() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Create a preview URL for immediate display
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);

      // Here you would typically upload to your backend/storage
      // For now, we'll just simulate an upload
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Profile picture uploaded successfully");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Failed to upload profile picture");
      setProfileImage(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-[120px] h-[120px] rounded-full border border-[#ff8f00]/20 overflow-hidden bg-gray-100 grid place-items-center">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <svg
              width="72"
              height="72"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <circle cx="12" cy="8" r="4" fill="#cbd5e1" />
              <path d="M4 20a8 8 0 0 1 16 0" fill="#e5e7eb" />
            </svg>
          )}
        </div>

        {/* Upload/Camera Button */}
        <button
          onClick={handleUploadClick}
          disabled={isUploading}
          className="absolute bottom-0 right-0 w-10 h-10 bg-[var(--color-primary)] rounded-full grid place-items-center border-2 border-white shadow-lg hover:bg-[var(--color-primary)]/90 transition-colors disabled:opacity-50"
          aria-label="Upload profile picture"
        >
          {isUploading ? <LoadingIcon /> : <CameraIcon />}
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <p className="text-[12px] text-[#666666] text-center">
          Profile Picture
        </p>
        {profileImage && (
          <button
            onClick={handleRemoveImage}
            className="text-[10px] text-red-500 hover:text-red-700 transition-colors"
            aria-label="Remove profile picture"
          >
            Remove
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}

// Icons
function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="13"
        r="4"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LoadingIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="animate-spin"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="60 30"
      />
    </svg>
  );
}
