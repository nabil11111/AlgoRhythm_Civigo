"use client";

import {
  useState,
  useRef,
  useEffect,
  useActionState,
  useCallback,
} from "react";
import StarRating from "./StarRating";
import {
  submitAppointmentFeedback,
  getAppointmentFeedback,
  getFeedbackImages,
} from "../_actions";
import { toast } from "sonner";

interface AppointmentFeedbackProps {
  appointmentId: string;
}

interface ImagePreview {
  id: string;
  file: File;
  preview: string;
}

interface ExistingFeedback {
  id: string;
  rating: number;
  comment: string | null;
  media: { images?: string[] } | null;
}

export default function AppointmentFeedback({
  appointmentId,
}: AppointmentFeedbackProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingFeedback, setExistingFeedback] =
    useState<ExistingFeedback | null>(null);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction] = useActionState(submitAppointmentFeedback, null);

  // Extract loadExistingFeedback function so it can be reused
  const loadExistingFeedback = useCallback(async () => {
    const result = await getAppointmentFeedback(appointmentId);
    if (result.ok && result.data) {
      setExistingFeedback(result.data);
      setRating(result.data.rating);
      setComment(result.data.comment || "");

      // Load existing images if any
      if (result.data.media?.images?.length) {
        const imageResult = await getFeedbackImages(result.data.media.images);
        if (imageResult.ok) {
          setExistingImageUrls(imageResult.data);
        }
      } else {
        setExistingImageUrls([]); // Clear existing images if none
      }
    } else {
      // No existing feedback, allow user to create new one
      setIsEditing(true);
    }
  }, [appointmentId]);

  // Load existing feedback on mount
  useEffect(() => {
    loadExistingFeedback();
  }, [loadExistingFeedback]);

  // Cleanup image preview URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        URL.revokeObjectURL(img.preview);
      });
    };
  }, [images]);

  // Handle form submission result
  useEffect(() => {
    if (!state) return; // No state to process

    const handleStateUpdate = async () => {
      try {
        if (state.ok) {
          toast.success("Feedback submitted successfully!");
          setIsSubmitting(false);
          setIsEditing(false);
          setImages([]); // Clear uploaded images
          // Reload feedback data instead of page reload
          await loadExistingFeedback();
        } else if (state.error) {
          toast.error(`Failed to submit feedback: ${state.error}`);
          setIsSubmitting(false);
        }
      } catch (error) {
        console.error("Error handling form state:", error);
        setIsSubmitting(false);
      }
    };

    handleStateUpdate();
  }, [state, loadExistingFeedback]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    const newImages: ImagePreview[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
    }));

    // Limit to 5 images total
    const totalImages = images.length + newImages.length;
    if (totalImages > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    // Validate file types and sizes
    const validImages = newImages.filter((img) => {
      if (!img.file.type.startsWith("image/")) {
        toast.error(`${img.file.name} is not an image file`);
        return false;
      }
      if (img.file.size > 5 * 1024 * 1024) {
        toast.error(`${img.file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    setImages((prev) => [...prev, ...validImages]);
  };

  const removeImage = (imageId: string) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== imageId);
      // Revoke object URL to prevent memory leaks
      const removedImage = prev.find((img) => img.id === imageId);
      if (removedImage) {
        URL.revokeObjectURL(removedImage.preview);
      }
      return updated;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (isSubmitting) {
      return; // Prevent double submission
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);

      // Add images to form data
      formData.append("image_count", images.length.toString());
      images.forEach((img, index) => {
        formData.append(`image_${index}`, img.file);
      });

      formAction(formData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An error occurred while submitting feedback");
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (existingFeedback) {
      setRating(existingFeedback.rating);
      setComment(existingFeedback.comment || "");
      setImages([]);
      setIsEditing(false);
    }
  };

  // Show existing feedback (read-only) if not editing
  if (existingFeedback && !isEditing) {
    return (
      <div className="border border-[#e0e0e0] rounded-lg p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-bold text-[#282828]">
            Your Feedback
          </h3>
          <button
            onClick={handleEdit}
            className="text-[12px] text-[var(--color-primary)] hover:underline"
          >
            Edit
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[12px] text-[#666666] mb-1">Rating</p>
            <StarRating rating={existingFeedback.rating} readonly />
          </div>

          {existingFeedback.comment && (
            <div>
              <p className="text-[12px] text-[#666666] mb-1">Comment</p>
              <p className="text-[14px] text-[#333333]">
                {existingFeedback.comment}
              </p>
            </div>
          )}

          {existingImageUrls.length > 0 && (
            <div>
              <p className="text-[12px] text-[#666666] mb-2">Images</p>
              <div className="grid grid-cols-3 gap-2">
                {existingImageUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Feedback image ${index + 1}`}
                    className="w-full h-20 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show feedback form (editing mode)
  return (
    <div className="border border-[#e0e0e0] rounded-lg p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-bold text-[#282828]">
          {existingFeedback ? "Edit Feedback" : "Leave Feedback"}
        </h3>
        {existingFeedback && (
          <button
            onClick={handleCancelEdit}
            className="text-[12px] text-[#666666] hover:underline"
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <input type="hidden" name="appointmentId" value={appointmentId} />
        <input type="hidden" name="rating" value={rating.toString()} />
        <input type="hidden" name="comment" value={comment} />

        <div className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-[12px] text-[#666666] mb-2">
              Rating *
            </label>
            <StarRating rating={rating} onRatingChange={setRating} size="lg" />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-[12px] text-[#666666] mb-2">
              Comment (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              className="w-full p-3 border border-[#e0e0e0] rounded-lg text-[14px] text-[#333333] placeholder-[#999999] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              rows={4}
              maxLength={500}
            />
            <p className="text-[10px] text-[#999999] mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-[12px] text-[#666666] mb-2">
              Images (optional)
            </label>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {images.map((img) => (
                  <div key={img.id} className="relative">
                    <img
                      src={img.preview}
                      alt="Preview"
                      className="w-full h-20 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 border-2 border-dashed border-[#e0e0e0] rounded-lg text-[14px] text-[#666666] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
              >
                <CameraIcon />
                Add Images ({images.length}/5)
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="w-full py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium text-[14px] hover:bg-[var(--color-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting
              ? "Submitting..."
              : existingFeedback
              ? "Update Feedback"
              : "Submit Feedback"}
          </button>
        </div>
      </form>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className="mx-auto mb-1"
    >
      <path
        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="13"
        r="4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
