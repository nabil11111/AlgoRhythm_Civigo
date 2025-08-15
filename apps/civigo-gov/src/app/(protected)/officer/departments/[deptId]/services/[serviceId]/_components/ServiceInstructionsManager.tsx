"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, FileText } from "lucide-react";
import EditorBridgeClient from "../EditorBridge.client";
import { PdfUploadManager } from "./PdfUploadManager";

interface Service {
  id: string;
  name: string;
  instructions_richtext?: any;
  instructions_pdf_path?: string | null;
}

interface ServiceInstructionsManagerProps {
  service: Service;
  deptId: string;
  serviceId: string;
  onSaveInstructions: (data: { instructions_richtext: any }) => Promise<void>;
  onUploadPdf: (formData: FormData) => Promise<void>;
  onDeletePdf: () => Promise<void>;
}

export function ServiceInstructionsManager({
  service,
  deptId,
  serviceId,
  onSaveInstructions,
  onUploadPdf,
  onDeletePdf
}: ServiceInstructionsManagerProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentContent, setCurrentContent] = useState<any>(
    service?.instructions_richtext ?? { type: "doc", content: [{ type: "paragraph" }] }
  );

  const handleSaveInstructions = async () => {
    setIsSaving(true);
    try {
      await onSaveInstructions({ instructions_richtext: currentContent });
      // Show success feedback
      const button = document.getElementById('save-button');
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Saved!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save instructions. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadPdf = async (formData: FormData) => {
    setIsUploading(true);
    try {
      await onUploadPdf(formData);
      // Provide success feedback
      const fileName = (formData.get('file') as File)?.name || 'file';
      return { success: `Successfully uploaded ${fileName}` };
    } catch (error) {
      console.error('Upload failed:', error);
      throw error; // Re-throw to let PdfUploadManager handle it
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePdf = async () => {
    setIsDeleting(true);
    try {
      await onDeletePdf();
      // No page reload - let the server action handle revalidation
    } catch (error) {
      console.error('Delete failed:', error);
      throw error; // Re-throw to let PdfUploadManager handle it
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Rich Text Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Service Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Instructions Text
            </label>
            <p className="text-sm text-gray-500">
              Write detailed instructions for citizens. Use the formatting toolbar for better presentation.
            </p>
            <EditorBridgeClient
              value={currentContent}
              inputId="instructions-editor"
              onChange={setCurrentContent}
            />
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-gray-500">
              Changes are automatically saved to your draft
            </p>
            <Button
              id="save-button"
              onClick={handleSaveInstructions}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Instructions"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PDF Upload */}
      <PdfUploadManager
        currentPdfPath={service?.instructions_pdf_path}
        onUpload={handleUploadPdf}
        onDelete={handleDeletePdf}
        isUploading={isUploading}
        isDeleting={isDeleting}
      />
    </div>
  );
}
