import Link from "next/link";
import {
  getUserNicImages,
  getUserDocuments,
  getDocumentImages,
} from "../../../_actions";
import Navbar from "../../../_components/Navbar";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params as required by Next.js 15+
  const resolvedParams = await params;

  // Get the specific document and check if it's a NIC document
  const documentsResult = await getUserDocuments();

  if (!documentsResult.ok) {
    return (
      <div className="min-h-[100svh] flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <h2 className="text-[18px] font-semibold text-[#1d1d1d] mb-2">
              Error Loading Document
            </h2>
            <p className="text-[14px] text-[#828282] mb-4">
              Could not load document: {documentsResult.error}
            </p>
            <Link
              href="/app/wallet"
              className="inline-block px-6 py-2 bg-[var(--color-primary)] text-white rounded-md"
            >
              Back to Wallet
            </Link>
          </div>
        </div>
        <Navbar activeTab="wallet" />
      </div>
    );
  }

  const document = documentsResult.documents.find(
    (doc) => doc.id === resolvedParams.id
  );

  if (!document) {
    return (
      <div className="min-h-[100svh] flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <h2 className="text-[18px] font-semibold text-[#1d1d1d] mb-2">
              Document Not Found
            </h2>
            <p className="text-[14px] text-[#828282] mb-4">
              The requested document could not be found.
            </p>
            <Link
              href="/app/wallet"
              className="inline-block px-6 py-2 bg-[var(--color-primary)] text-white rounded-md"
            >
              Back to Wallet
            </Link>
          </div>
        </div>
        <Navbar activeTab="wallet" />
      </div>
    );
  }

  // Check if this is a NIC document (Identity type or virtual NIC document)
  const isNicDocument =
    document.type === "identity" || document.id === "nic-virtual";

  let nicImages: { front?: string; back?: string } = {};
  let customImages: string[] = [];
  let error: string | null = null;

  if (isNicDocument) {
    const result = await getUserNicImages();
    if (result.ok) {
      nicImages = result.images;
    } else {
      error = result.error;
    }
  } else {
    // For custom documents, try to load multiple images
    const result = await getDocumentImages(resolvedParams.id);
    if (result.ok) {
      customImages = result.images;
    } else {
      error = result.error;
    }
  }

  // Generate description based on document type
  const getDocumentDescription = (doc: typeof document) => {
    switch (doc.type) {
      case "identity":
        return "Your verified national identity document with front and back images.";
      case "license":
        return "Your verified driving license document.";
      case "travel":
        return "Your verified passport document.";
      default:
        return "Your verified document.";
    }
  };

  const description = getDocumentDescription(document);

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
            {document.name}
          </h1>
          <p className="text-[14px] text-[#828282] mt-2">
            Status:{" "}
            <span className="text-green-600 font-semibold">
              {document.status}
            </span>
          </p>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 pb-28">
        {/* Document Description */}
        <div className="mb-6">
          <p className="text-[14px] text-[#1d1d1d] leading-[20px]">
            {description}
          </p>
        </div>

        {/* NIC Images Section - Only for NIC document */}
        {isNicDocument && (
          <div className="space-y-6">
            <h2 className="text-[18px] font-semibold text-[#1d1d1d]">
              Document Images
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-[14px]">
                  Could not load NIC images: {error}
                </p>
                <p className="text-red-500 text-[12px] mt-2">
                  Please try refreshing the page. If the issue persists, contact
                  support.
                </p>
              </div>
            )}

            {!error && (nicImages.front || nicImages.back) && (
              <div className="space-y-4">
                {/* Front Image */}
                {nicImages.front && (
                  <div className="border-2 border-[var(--color-primary)] rounded-[12px] p-4">
                    <h3 className="text-[16px] font-semibold text-[#1d1d1d] mb-3">
                      NIC Front
                    </h3>
                    <div className="w-full max-w-md mx-auto">
                      <img
                        src={nicImages.front}
                        alt="NIC Front"
                        className="w-full h-auto rounded-lg border border-gray-200"
                      />
                    </div>
                  </div>
                )}

                {/* Back Image */}
                {nicImages.back && (
                  <div className="border-2 border-[var(--color-primary)] rounded-[12px] p-4">
                    <h3 className="text-[16px] font-semibold text-[#1d1d1d] mb-3">
                      NIC Back
                    </h3>
                    <div className="w-full max-w-md mx-auto">
                      <img
                        src={nicImages.back}
                        alt="NIC Back"
                        className="w-full h-auto rounded-lg border border-gray-200"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {!error && !nicImages.front && !nicImages.back && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-700 text-[14px]">
                  No NIC images found. This may be because you completed
                  onboarding before this feature was implemented.
                </p>
                <p className="text-yellow-600 text-[12px] mt-2">
                  Debug: Searched for documents titled "NIC Front Image" and
                  "NIC Back Image"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Custom Document Images Section */}
        {!isNicDocument && (
          <div className="space-y-6">
            <h2 className="text-[18px] font-semibold text-[#1d1d1d]">
              Document Images
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-[14px]">
                  Could not load document images: {error}
                </p>
                <p className="text-red-500 text-[12px] mt-2">
                  Please try refreshing the page. If the issue persists, contact
                  support.
                </p>
              </div>
            )}

            {!error && customImages.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {customImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="border-2 border-[var(--color-primary)] rounded-[12px] p-4"
                  >
                    <h3 className="text-[16px] font-semibold text-[#1d1d1d] mb-3">
                      Image {index + 1}
                    </h3>
                    <div className="w-full max-w-md mx-auto">
                      <img
                        src={imageUrl}
                        alt={`Document image ${index + 1}`}
                        className="w-full h-auto rounded-lg border border-gray-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!error && customImages.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-700 text-[14px]">
                  No images found for this document.
                </p>
                <p className="text-yellow-600 text-[12px] mt-2">
                  This document may not have any images attached.
                </p>
              </div>
            )}
          </div>
        )}
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
