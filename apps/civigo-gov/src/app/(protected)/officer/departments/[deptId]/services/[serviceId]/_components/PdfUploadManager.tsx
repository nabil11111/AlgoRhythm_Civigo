"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  Trash2, 
  Download, 
  AlertCircle,
  CheckCircle2,
  X
} from "lucide-react";

interface PdfUploadManagerProps {
  currentPdfPath?: string | null;
  onUpload: (formData: FormData) => Promise<void>;
  onDelete: () => Promise<void>;
  isUploading?: boolean;
  isDeleting?: boolean;
}

export function PdfUploadManager({ 
  currentPdfPath, 
  onUpload, 
  onDelete,
  isUploading = false,
  isDeleting = false
}: PdfUploadManagerProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError(null);
    setSuccess(null);
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      setError("Please select a PDF file");
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }
    
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
    // Reset the input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      setError(null);
      const formData = new FormData();
      formData.append('file', selectedFile);
      await onUpload(formData);
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Upload failed. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      setError(null);
      await onDelete();
    } catch (error) {
      console.error('Delete failed:', error);
      setError('Delete failed. Please try again.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileName = (path: string) => {
    return path.split('/').pop() || path;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Instructions PDF
          {currentPdfPath && (
            <Badge variant="secondary" className="ml-2">
              Available
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700">{success}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSuccess(null)}
              className="ml-auto h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Current PDF Display */}
        {currentPdfPath && (
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {getFileName(currentPdfPath)}
                  </p>
                  <p className="text-sm text-gray-500">PDF Document</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(currentPdfPath, '_blank')}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragOver 
              ? 'border-blue-400 bg-blue-50' 
              : selectedFile 
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
        >
          {selectedFile ? (
            <div className="space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {isUploading ? "Uploading..." : "Upload PDF"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedFile(null)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {currentPdfPath ? "Replace PDF Instructions" : "Upload PDF Instructions"}
                </p>
                <p className="text-sm text-gray-500">
                  Drag and drop your PDF file here, or click to browse
                </p>
              </div>
              <div className="flex items-center justify-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <Upload className="w-4 h-4" />
                  Choose PDF File
                </Button>
              </div>
              <div className="text-xs text-gray-400">
                Maximum file size: 10MB • Supported format: PDF
              </div>
            </div>
          )}
        </div>

        {/* Upload Instructions */}
        {!currentPdfPath && !selectedFile && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Upload detailed instructions</p>
                <p>This PDF will be available for citizens to download when they view this service. Include step-by-step instructions, required documents, and any important notes.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
