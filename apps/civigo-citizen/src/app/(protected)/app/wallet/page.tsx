import Link from "next/link";
import { getProfile, getServerClient } from "@/utils/supabase/server";
import { getUserDocuments } from "../../_actions";
import Navbar from "../../_components/Navbar";

export default async function WalletPage() {
  const profile = await getProfile();

  // Fetch user's actual documents from database
  const documentsResult = await getUserDocuments();
  const documents = documentsResult.ok ? documentsResult.documents : [];
  const documentsError = !documentsResult.ok ? documentsResult.error : null;

  return (
    <div className="min-h-[100svh] flex flex-col bg-white">
      {/* Header with Back Button */}
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            aria-label="Back to Home"
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
            Document wallet
          </h1>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 pb-28">
        {/* Search Bar */}
        <form className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <input
              type="text"
              name="q"
              placeholder="Search services"
              className="w-full h-[50px] border-2 border-[var(--color-primary)] rounded-[25px] px-5 pr-12 text-[16px] text-[#828282] focus:outline-none focus:border-[var(--color-primary)]"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <SearchIcon />
            </button>
          </div>
          <button
            type="button"
            className="w-[50px] h-[50px] border-2 border-[var(--color-primary)] rounded-full grid place-items-center"
          >
            <FilterIcon />
          </button>
        </form>

        {/* Documents List */}
        <div className="space-y-4 mb-8">
          {documentsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-[14px]">
                Could not load documents: {documentsError}
              </p>
            </div>
          )}

          {!documentsError && documents.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-600 text-[14px] mb-2">
                No documents found
              </p>
              <p className="text-gray-500 text-[12px]">
                Complete your onboarding to see your documents here
              </p>
            </div>
          )}

          {!documentsError &&
            documents.length > 0 &&
            documents.map((document) => (
              <Link
                key={document.id}
                href={`/app/wallet/${document.id}`}
                className="block"
              >
                <div className="border-2 border-[var(--color-primary)] rounded-[12px] p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    {/* Document Info */}
                    <div className="flex-1">
                      <h3 className="text-[14px] font-bold text-[#1d1d1d] leading-[20px]">
                        {document.name}
                      </h3>
                      <p className="text-[12px] text-gray-500 mt-1">
                        {document.type} • {document.status}
                      </p>
                    </div>

                    {/* Document Type Icon + Arrow */}
                    <div className="flex items-center gap-2">
                      <DocumentTypeIcon type={document.type} />
                      <ArrowRightIcon />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
        </div>

        {/* Add Document FAB */}
        <div className="fixed bottom-24 right-5">
          <Link
            href="/app/wallet/new"
            className="w-11 h-11 bg-[var(--color-secondary)] rounded-full grid place-items-center shadow-lg hover:bg-[var(--color-primary)] transition-colors"
            aria-label="Add new document"
          >
            <PlusIcon />
          </Link>
        </div>
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

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="11"
        cy="11"
        r="8"
        stroke="#0052A5"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M21 21l-4.35-4.35"
        stroke="#0052A5"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <polygon
        points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"
        stroke="#0052A5"
        strokeWidth="2"
        fill="none"
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

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DocumentTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "identity":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
            stroke="#0052A5"
            strokeWidth="2"
            fill="none"
          />
          <circle
            cx="9"
            cy="11"
            r="2"
            stroke="#0052A5"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M7 18v-1a2 2 0 012-2h0a2 2 0 012 2v1"
            stroke="#0052A5"
            strokeWidth="2"
          />
          <line
            x1="14"
            y1="9"
            x2="18"
            y2="9"
            stroke="#0052A5"
            strokeWidth="2"
          />
          <line
            x1="14"
            y1="13"
            x2="18"
            y2="13"
            stroke="#0052A5"
            strokeWidth="2"
          />
        </svg>
      );
    case "license":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M15 12H9m6-4H9m8 12V6a2 2 0 00-2-2H9a2 2 0 00-2 2v14l4-2 4 2z"
            stroke="#0052A5"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      );
    case "travel":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M3 7h18l-2 9H5L3 7zm0 0L2 3h2m16 4l1-4h-2M8 20h8"
            stroke="#0052A5"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      );
    default:
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
            stroke="#0052A5"
            strokeWidth="2"
            fill="none"
          />
          <polyline points="14,2 14,8 20,8" stroke="#0052A5" strokeWidth="2" />
          <line
            x1="16"
            y1="13"
            x2="8"
            y2="13"
            stroke="#0052A5"
            strokeWidth="2"
          />
          <line
            x1="16"
            y1="17"
            x2="8"
            y2="17"
            stroke="#0052A5"
            strokeWidth="2"
          />
          <polyline points="10,9 9,9 8,9" stroke="#0052A5" strokeWidth="2" />
        </svg>
      );
  }
}
