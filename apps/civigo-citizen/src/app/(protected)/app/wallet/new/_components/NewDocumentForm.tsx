"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface ImagePreview {
  id: string;
  file: File;
  preview: string;
  uploaded?: boolean;
  path?: string;
}

export default function NewDocumentForm({
  createAction,
}: {
  createAction: (
    formData: FormData
  ) => Promise<{ ok: boolean; error?: string; id?: string }>;
}) {
  const [title, setTitle] = React.useState("");
  const [images, setImages] = React.useState<ImagePreview[]>([]);
  const [pending, setPending] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select only image files");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error("Image size must be less than 10MB");
        return;
      }

      const id = Math.random().toString(36).substr(2, 9);
      const preview = URL.createObjectURL(file);

      setImages((prev) => [...prev, { id, file, preview }]);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a document title");
      return;
    }

    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setPending(true);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.set("title", title.trim());

      // Add all image files
      images.forEach((image, index) => {
        formData.append(`image_${index}`, image.file);
      });

      formData.set("image_count", images.length.toString());

      const result = await createAction(formData);

      if (result.ok) {
        toast.success("Document added successfully!");
        // Clean up preview URLs
        images.forEach((img) => URL.revokeObjectURL(img.preview));
        router.push(`/app/wallet/${result.id}`);
      } else {
        toast.error(`Failed to add document: ${result.error}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Document creation error:", error);
    } finally {
      setPending(false);
      setUploading(false);
    }
  };

  // Cleanup preview URLs on unmount
  React.useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Document Title */}
      <div className="space-y-2">
        <Label
          htmlFor="title"
          className="text-[16px] font-semibold text-[#1d1d1d]"
        >
          Document Title
        </Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter document title (e.g., Passport, Driving License)"
          className="w-full border-2 border-[var(--color-primary)] rounded-[12px] px-4 py-3 text-[16px] focus:outline-none focus:border-[var(--color-primary)]"
          disabled={pending}
        />
      </div>

      {/* Image Upload Section */}
      <div className="space-y-4">
        <Label className="text-[16px] font-semibold text-[#1d1d1d]">
          Document Images
        </Label>

        {/* Add Images Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
            disabled={pending}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={pending}
            className="w-full border-2 border-dashed border-[var(--color-primary)] rounded-[12px] py-8 text-[var(--color-primary)] hover:bg-blue-50"
          >
            <div className="text-center">
              <PlusIcon />
              <p className="mt-2 text-[14px]">Add Images</p>
              <p className="text-[12px] text-gray-500">
                Click to select multiple images
              </p>
            </div>
          </Button>
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative">
                <div className="border-2 border-[var(--color-primary)] rounded-[12px] p-2 bg-white">
                  <img
                    src={image.preview}
                    alt="Document preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    disabled={pending}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 disabled:opacity-50"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Status */}
      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700 text-[14px]">
            Uploading document and images...
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-4 pb-[calc(env(safe-area-inset-bottom,0)+16px)] pt-2">
        <Button
          type="submit"
          variant="primary"
          disabled={pending || !title.trim() || images.length === 0}
          className="w-full rounded-md py-3.5 text-[18px] font-medium"
        >
          {pending ? "Adding Document..." : "Add Document"}
        </Button>
      </div>
    </form>
  );
}

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
