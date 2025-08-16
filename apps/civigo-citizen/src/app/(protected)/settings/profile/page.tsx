import Link from "next/link";
import { getProfile } from "@/utils/supabase/server";
import Navbar from "../../_components/Navbar";
import ProfilePictureUpload from "./_components/ProfilePictureUpload";

export default async function ProfileSettingsPage() {
  const profile = await getProfile();

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
            Profile
          </h1>
          <p className="text-[14px] text-[#828282] mt-2">
            Manage your personal information
          </p>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 pb-28">
        {/* Profile Picture Section */}
        <div className="flex justify-center mb-8">
          <ProfilePictureUpload />
        </div>

        {/* Profile Information Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-[14px] font-medium text-[#1d1d1d] mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={profile?.full_name || ""}
              disabled
              className="w-full h-[48px] border-2 border-[var(--color-primary)] rounded-[12px] px-4 text-[16px] text-[#282828] bg-gray-50 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[14px] font-medium text-[#1d1d1d] mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={profile?.email || ""}
              disabled
              className="w-full h-[48px] border-2 border-[var(--color-primary)] rounded-[12px] px-4 text-[16px] text-[#282828] bg-gray-50 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[14px] font-medium text-[#1d1d1d] mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={profile?.phone || ""}
              disabled
              className="w-full h-[48px] border-2 border-[var(--color-primary)] rounded-[12px] px-4 text-[16px] text-[#282828] bg-gray-50 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[14px] font-medium text-[#1d1d1d] mb-2">
              Government ID
            </label>
            <input
              type="text"
              value={profile?.gov_id || ""}
              disabled
              className="w-full h-[48px] border-2 border-[var(--color-primary)] rounded-[12px] px-4 text-[16px] text-[#282828] bg-gray-50 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[14px] font-medium text-[#1d1d1d] mb-2">
              Verification Status
            </label>
            <input
              type="text"
              value={profile?.verified_status || "Unverified"}
              disabled
              className="w-full h-[48px] border-2 border-[var(--color-primary)] rounded-[12px] px-4 text-[16px] text-[#282828] bg-gray-50 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-[12px]">
          <div className="flex items-start gap-3">
            <InfoIcon />
            <div>
              <p className="text-[14px] text-blue-800 font-medium">
                Profile Information
              </p>
              <p className="text-[12px] text-blue-600 mt-1">
                Your profile information is managed by the government system and
                cannot be edited here. You can upload a profile picture for
                personalization. Contact your local office for any changes to
                personal details.
              </p>
            </div>
          </div>
        </div>
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

function ArrowRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 6l6 6-6 6"
        stroke="#0052A5"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="#1e40af"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M12 16v-4"
        stroke="#1e40af"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 8h.01"
        stroke="#1e40af"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
