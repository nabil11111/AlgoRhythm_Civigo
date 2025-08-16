"use client";

import React, { useState, useEffect } from "react";
import { getUserDocuments } from "../_actions";

type Document = {
  id: string;
  name: string;
  type: string;
  status: string;
  created_at: string;
};

type DocumentSelectorProps = {
  selectedDocumentIds: string[];
  onSelectionChange: (documentIds: string[]) => void;
  title?: string;
  description?: string;
  maxSelection?: number;
  disabled?: boolean;
};

export default function DocumentSelector({
  selectedDocumentIds,
  onSelectionChange,
  title = "Select Documents",
  description = "Choose documents to attach",
  maxSelection,
  disabled = false,
}: DocumentSelectorProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nicDocumentIds, setNicDocumentIds] = useState<string[]>([]);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const result = await getUserDocuments();
      if (result.ok) {
        setDocuments(result.documents);

        // Load actual NIC document IDs if virtual NIC document exists
        const hasVirtualNic = result.documents.some(
          (doc) => doc.id === "nic-virtual"
        );
        if (hasVirtualNic) {
          const nicIds = await getNicDocumentIds();
          setNicDocumentIds(nicIds);
        }

        setError(null);
      } else {
        setError("Failed to load documents");
      }
    } catch (err) {
      setError("An error occurred while loading documents");
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentToggle = (documentId: string) => {
    if (disabled) return;

    // Handle virtual NIC document specially
    if (documentId === "nic-virtual") {
      const allNicSelected =
        nicDocumentIds.length > 0 &&
        nicDocumentIds.every((id) => selectedDocumentIds.includes(id));

      if (allNicSelected) {
        // Remove all NIC documents
        const updatedSelection = selectedDocumentIds.filter(
          (id) => !nicDocumentIds.includes(id)
        );
        onSelectionChange(updatedSelection);
      } else {
        // Add all NIC documents
        if (
          maxSelection &&
          selectedDocumentIds.length + nicDocumentIds.length > maxSelection
        ) {
          return; // Don't add if it would exceed max limit
        }
        // Remove any existing NIC docs first, then add all
        const withoutNic = selectedDocumentIds.filter(
          (id) => !nicDocumentIds.includes(id)
        );
        onSelectionChange([...withoutNic, ...nicDocumentIds]);
      }
      return;
    }

    const isSelected = selectedDocumentIds.includes(documentId);
    if (isSelected) {
      // Remove from selection
      onSelectionChange(selectedDocumentIds.filter((id) => id !== documentId));
    } else {
      // Add to selection (check max limit)
      if (maxSelection && selectedDocumentIds.length >= maxSelection) {
        return; // Don't add if at max limit
      }
      onSelectionChange([...selectedDocumentIds, documentId]);
    }
  };

  // Helper function to get actual NIC document IDs from the database
  const getNicDocumentIds = async (): Promise<string[]> => {
    try {
      const { getBrowserClient } = await import("@/utils/supabase/client");
      const supabase = getBrowserClient();

      const { data: docs } = await supabase
        .from("documents")
        .select("id")
        .in("title", ["NIC Front Image", "NIC Back Image"]);

      return docs?.map((doc) => doc.id) || [];
    } catch (error) {
      console.error("Error fetching NIC document IDs:", error);
      return [];
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "identity":
        return <IDCardIcon />;
      default:
        return <DocumentIcon />;
    }
  };

  if (loading) {
    return (
      <div className="border border-[#e0e0e0] rounded-lg p-4">
        <h3 className="text-[16px] font-bold text-[#4f4f4f] mb-3">{title}</h3>
        <div className="text-center py-4">
          <div className="text-[14px] text-gray-500">Loading documents...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-[#e0e0e0] rounded-lg p-4">
        <h3 className="text-[16px] font-bold text-[#4f4f4f] mb-3">{title}</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-[14px]">{error}</p>
          <button
            onClick={loadDocuments}
            className="mt-2 text-[12px] text-red-600 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="border border-[#e0e0e0] rounded-lg p-4">
        <h3 className="text-[16px] font-bold text-[#4f4f4f] mb-3">{title}</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-gray-600 text-[14px] mb-2">No documents found</p>
          <p className="text-gray-500 text-[12px]">
            Complete your onboarding to see your documents here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[#e0e0e0] rounded-lg p-4">
      <h3 className="text-[16px] font-bold text-[#4f4f4f] mb-2">{title}</h3>
      {description && (
        <p className="text-[14px] text-gray-600 mb-4">{description}</p>
      )}

      {maxSelection && (
        <div className="text-[12px] text-gray-500 mb-3">
          {selectedDocumentIds.length} of {maxSelection} documents selected
        </div>
      )}

      <div className="space-y-2">
        {documents.map((document) => {
          let isSelected = selectedDocumentIds.includes(document.id);

          // For virtual NIC document, check if actual NIC documents are selected
          if (document.id === "nic-virtual") {
            // Check if all NIC document IDs are in the selected list
            isSelected =
              nicDocumentIds.length > 0 &&
              nicDocumentIds.every((id) => selectedDocumentIds.includes(id));
          }

          const canSelect =
            !maxSelection ||
            selectedDocumentIds.length < maxSelection ||
            isSelected;

          return (
            <button
              key={document.id}
              type="button"
              onClick={() => handleDocumentToggle(document.id)}
              disabled={disabled || !canSelect}
              className={`w-full border rounded-lg p-3 text-left transition-colors ${
                isSelected
                  ? "border-[var(--color-primary)] bg-blue-50"
                  : disabled || !canSelect
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {/* Document Type Icon */}
                  <div
                    className={`${
                      isSelected
                        ? "text-[var(--color-primary)]"
                        : "text-gray-500"
                    }`}
                  >
                    {getDocumentTypeIcon(document.type)}
                  </div>

                  {/* Document Info */}
                  <div className="flex-1">
                    <h4 className="text-[14px] font-medium text-gray-900">
                      {document.name}
                    </h4>
                    <p className="text-[12px] text-gray-500">
                      {document.type} • {document.status}
                    </p>
                  </div>
                </div>

                {/* Selection Checkbox */}
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isSelected
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Icons
function IDCardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect
        x="2"
        y="6"
        width="20"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="8" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
      <path
        d="M14 10h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 14h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="14,2 14,8 20,8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="16"
        y1="13"
        x2="8"
        y2="13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="16"
        y1="17"
        x2="8"
        y2="17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
