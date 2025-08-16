"use client";

import React, { useState, useEffect } from "react";
import {
  getAppointmentDocuments,
  addDocumentToAppointment,
  removeDocumentFromAppointment,
} from "../../../../_actions";
import DocumentSelector from "../../../../_components/DocumentSelector";

type Document = {
  appointmentDocumentId: string;
  id: string;
  name: string;
  type: string;
  status: string;
  created_at: string;
};

type AppointmentDocumentManagerProps = {
  appointmentId: string;
};

export default function AppointmentDocumentManager({
  appointmentId,
}: AppointmentDocumentManagerProps) {
  const [appointmentDocuments, setAppointmentDocuments] = useState<Document[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingDocuments, setIsAddingDocuments] = useState(false);
  const [selectedNewDocuments, setSelectedNewDocuments] = useState<string[]>(
    []
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadAppointmentDocuments();
  }, [appointmentId]);

  const loadAppointmentDocuments = async () => {
    setLoading(true);
    try {
      const result = await getAppointmentDocuments(appointmentId);
      if (result.ok) {
        setAppointmentDocuments(result.documents);
        setError(null);
      } else {
        setError("Failed to load appointment documents");
      }
    } catch (err) {
      setError("An error occurred while loading documents");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocuments = async () => {
    if (selectedNewDocuments.length === 0) return;

    setActionLoading("adding");
    try {
      for (const documentId of selectedNewDocuments) {
        const result = await addDocumentToAppointment(
          appointmentId,
          documentId
        );
        if (!result.ok) {
          console.error("Failed to add document:", result.error);
        }
      }

      // Reload documents and close add mode
      await loadAppointmentDocuments();
      setSelectedNewDocuments([]);
      setIsAddingDocuments(false);
    } catch (err) {
      console.error("Error adding documents:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveDocument = async (appointmentDocumentId: string) => {
    setActionLoading(appointmentDocumentId);
    try {
      const result = await removeDocumentFromAppointment(appointmentDocumentId);
      if (result.ok) {
        await loadAppointmentDocuments();
      } else {
        console.error("Failed to remove document:", result.error);
      }
    } catch (err) {
      console.error("Error removing document:", err);
    } finally {
      setActionLoading(null);
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

  // Get document IDs that are already attached
  const attachedDocumentIds = appointmentDocuments.map((doc) => doc.id);

  if (loading) {
    return (
      <div className="border border-[#e0e0e0] rounded-lg p-4 mb-6">
        <h3 className="text-[16px] font-bold text-[#282828] mb-4">
          Attached Documents
        </h3>
        <div className="text-center py-4">
          <div className="text-[14px] text-gray-500">Loading documents...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-[#e0e0e0] rounded-lg p-4 mb-6">
        <h3 className="text-[16px] font-bold text-[#282828] mb-4">
          Attached Documents
        </h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-[14px]">{error}</p>
          <button
            onClick={loadAppointmentDocuments}
            className="mt-2 text-[12px] text-red-600 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[#e0e0e0] rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-bold text-[#282828]">
          Attached Documents
        </h3>
        {!isAddingDocuments && (
          <button
            onClick={() => setIsAddingDocuments(true)}
            className="px-3 py-1 bg-[var(--color-primary)] text-white text-[12px] rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Documents
          </button>
        )}
      </div>

      {/* Current Documents */}
      {appointmentDocuments.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center mb-4">
          <p className="text-gray-600 text-[14px] mb-2">
            No documents attached
          </p>
          <p className="text-gray-500 text-[12px]">
            Add documents to help speed up your appointment
          </p>
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {appointmentDocuments.map((document) => (
            <div
              key={document.appointmentDocumentId}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
            >
              <div className="text-gray-600">
                {getDocumentTypeIcon(document.type)}
              </div>
              <div className="flex-1">
                <h4 className="text-[14px] font-medium text-gray-900">
                  {document.name}
                </h4>
                <p className="text-[12px] text-gray-500">
                  {document.type} • {document.status}
                </p>
              </div>
              <button
                onClick={() =>
                  handleRemoveDocument(document.appointmentDocumentId)
                }
                disabled={actionLoading === document.appointmentDocumentId}
                className="text-red-600 hover:text-red-800 text-[12px] underline disabled:opacity-50"
              >
                {actionLoading === document.appointmentDocumentId
                  ? "Removing..."
                  : "Remove"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Documents Section */}
      {isAddingDocuments && (
        <div className="border-t border-gray-200 pt-4">
          <DocumentSelector
            selectedDocumentIds={selectedNewDocuments}
            onSelectionChange={(documentIds) => {
              // Filter out documents that are already attached
              const filteredIds = documentIds.filter(
                (id) => !attachedDocumentIds.includes(id)
              );
              setSelectedNewDocuments(filteredIds);
            }}
            title="Select Documents to Add"
            description="Choose additional documents to attach to this appointment"
            disabled={actionLoading === "adding"}
          />

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddDocuments}
              disabled={
                selectedNewDocuments.length === 0 || actionLoading === "adding"
              }
              className={`px-4 py-2 text-[14px] font-medium rounded-md transition-colors ${
                selectedNewDocuments.length > 0 && actionLoading !== "adding"
                  ? "bg-[var(--color-primary)] text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {actionLoading === "adding"
                ? "Adding..."
                : `Add ${selectedNewDocuments.length} Document${
                    selectedNewDocuments.length !== 1 ? "s" : ""
                  }`}
            </button>
            <button
              onClick={() => {
                setIsAddingDocuments(false);
                setSelectedNewDocuments([]);
              }}
              disabled={actionLoading === "adding"}
              className="px-4 py-2 text-[14px] font-medium border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Icons
function IDCardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
