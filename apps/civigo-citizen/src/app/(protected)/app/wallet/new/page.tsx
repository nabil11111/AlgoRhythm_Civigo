import Link from "next/link";
import { createDocument } from "../../../_actions";
import Navbar from "../../../_components/Navbar";
import NewDocumentForm from "./_components/NewDocumentForm";

export default async function NewDocumentPage() {
  return (
    <div className="min-h-[100svh] flex flex-col bg-white">
      {/* Header with Back Button */}
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/app/wallet"
            aria-label="Back to Wallet"
            className="w-10 h-10 rounded-full border-2 border-[var(--color-primary)] grid place-items-center"
          >
            <BackArrowIcon />
          </Link>
        </div>
      </div>

      {/* Title Section */}
      <div className="bg-white border-b-2 border-[var(--color-primary)] rounded-b-2xl px-5 py-6">
        <div className="text-center">
          <h1 className="text-[20px] font-normal text-[#1d1d1d] leading-[28px]">
            Add New Document
          </h1>
          <p className="text-[14px] text-[#828282] mt-2">
            Upload a new document to your wallet
          </p>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 pb-28">
        <NewDocumentForm createAction={createDocument} />
      </div>

      <Navbar activeTab="wallet" />
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
