"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "../../_components/Navbar";

export default function SecuritySettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match");
      setMessageType("error");
      return;
    }

    if (newPassword.length < 8) {
      setMessage("Password must be at least 8 characters long");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      // TODO: Implement actual password reset logic with Supabase
      // For now, simulate the request
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage("Password updated successfully");
      setMessageType("success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage("Failed to update password. Please try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100svh] flex flex-col bg-white">
      {/* Header with Back Button */}
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/settings"
            aria-label="Back to Settings"
            className="w-10 h-10 rounded-full border-2 border-[var(--color-primary)] grid place-items-center"
          >
            <BackArrowIcon />
          </Link>
        </div>
      </div>

      {/* Title Section */}
      <div className="bg-white border-b-4 border-[var(--color-primary)] rounded-b-3xl px-5 py-6">
        <div className="text-center">
          <h1 className="text-[20px] font-normal text-[#1d1d1d] leading-[28px]">
            Sign-in & Security
          </h1>
          <p className="text-[14px] text-[#828282] mt-2">
            Reset your account password
          </p>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 pb-28">
        {/* Password Reset Form */}
        <form onSubmit={handlePasswordReset} className="space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-[16px] font-medium text-[#1d1d1d] mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full h-[50px] border-2 border-[var(--color-primary)] rounded-[12px] px-4 text-[16px] focus:outline-none focus:border-[var(--color-primary)]"
              placeholder="Enter your current password"
              required
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-[16px] font-medium text-[#1d1d1d] mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-[50px] border-2 border-[var(--color-primary)] rounded-[12px] px-4 text-[16px] focus:outline-none focus:border-[var(--color-primary)]"
              placeholder="Enter your new password"
              required
              minLength={8}
            />
            <p className="text-[12px] text-gray-500 mt-1">
              Password must be at least 8 characters long
            </p>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-[16px] font-medium text-[#1d1d1d] mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-[50px] border-2 border-[var(--color-primary)] rounded-[12px] px-4 text-[16px] focus:outline-none focus:border-[var(--color-primary)]"
              placeholder="Confirm your new password"
              required
            />
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-[12px] text-center ${
                messageType === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              isLoading || !currentPassword || !newPassword || !confirmPassword
            }
            className="w-full h-[50px] bg-[var(--color-primary)] text-white rounded-[12px] text-[16px] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-primary)]/90 transition-colors"
          >
            {isLoading ? "Updating Password..." : "Update Password"}
          </button>
        </form>
      </div>

      <Navbar activeTab="settings" />
    </div>
  );
}

// Icons
function BackArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 18l-6-6 6-6"
        stroke="#0052A5"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
