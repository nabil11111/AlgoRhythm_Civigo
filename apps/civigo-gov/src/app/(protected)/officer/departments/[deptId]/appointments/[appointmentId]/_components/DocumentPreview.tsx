"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Eye, X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

type DocumentPreview = {
  documentId: string;
  title: string;
  images: string[];
};

type DocumentPreviewProps = {
  documentPreviews: DocumentPreview[];
};

export function DocumentPreview({ documentPreviews }: DocumentPreviewProps) {
  const [selectedDocument, setSelectedDocument] = useState<DocumentPreview | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const openPreview = (doc: DocumentPreview, imageIndex = 0) => {
    setSelectedDocument(doc);
    setSelectedImageIndex(imageIndex);
  };

  const closePreview = () => {
    setSelectedDocument(null);
    setSelectedImageIndex(0);
  };

  const nextImage = () => {
    if (selectedDocument && selectedImageIndex < selectedDocument.images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  if (documentPreviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documents
            <Badge variant="secondary" className="ml-2">
              0
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No documents uploaded</p>
            <p className="text-sm">Documents will appear here when uploaded by the citizen</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documents
            <Badge variant="secondary" className="ml-2">
              {documentPreviews.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documentPreviews.map((doc) => (
              <div
                key={doc.documentId}
                className="border border-gray-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{doc.title}</p>
                      <p className="text-sm text-gray-500">
                        {doc.images.length} image{doc.images.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Image thumbnails */}
                <div className="flex gap-2 flex-wrap">
                  {doc.images.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="relative group cursor-pointer"
                      onClick={() => openPreview(doc, index)}
                    >
                      <div className="w-20 h-20 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <Image
                          src={imageUrl}
                          alt={`${doc.title} - Image ${index + 1}`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                          unoptimized // Since these are signed URLs
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                        <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Preview button for easy access */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openPreview(doc, 0)}
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Document
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Full-screen preview modal */}
      <Dialog open={!!selectedDocument} onOpenChange={() => closePreview()}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {selectedDocument?.title}
                {selectedDocument && selectedDocument.images.length > 1 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedImageIndex + 1} of {selectedDocument.images.length}
                  </Badge>
                )}
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={closePreview}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="relative p-6 pt-4">
              <div className="relative bg-gray-50 rounded-lg overflow-hidden">
                <Image
                  src={selectedDocument.images[selectedImageIndex]}
                  alt={`${selectedDocument.title} - Image ${selectedImageIndex + 1}`}
                  width={800}
                  height={600}
                  className="w-full h-auto max-h-[60vh] object-contain"
                  unoptimized // Since these are signed URLs
                />
                
                {/* Navigation arrows for multiple images */}
                {selectedDocument.images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100"
                      onClick={prevImage}
                      disabled={selectedImageIndex === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100"
                      onClick={nextImage}
                      disabled={selectedImageIndex === selectedDocument.images.length - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
              
              {/* Image navigation dots */}
              {selectedDocument.images.length > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                  {selectedDocument.images.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === selectedImageIndex ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
