import { Camera, Upload, SkipForward } from "lucide-react";

interface ProfilePictureStepProps {
  avatarUrl: string;
  onChange: (avatarUrl: string) => void;
}

export function ProfilePictureStep({ avatarUrl, onChange }: ProfilePictureStepProps) {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real implementation, you would upload to Supabase Storage
      // For now, we'll create a local preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    // Trigger file input with camera option
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          onChange(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleUpload = () => {
    // Trigger file input for gallery
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          onChange(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Profile Picture</h2>
        <p className="mt-1 text-sm text-gray-600">
          Add a profile photo (optional)
        </p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        {/* Preview */}
        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-gray-200 bg-gray-100">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile preview" className="h-full w-full object-cover" />
          ) : (
            <div className="text-center text-gray-400">
              <div className="text-4xl">👤</div>
              <div className="mt-1 text-xs">No photo</div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={handleCameraCapture}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Camera className="h-4 w-4" />
            Take Photo
          </button>

          <button
            type="button"
            onClick={handleUpload}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Upload className="h-4 w-4" />
            Upload Photo
          </button>

          {avatarUrl && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <SkipForward className="h-4 w-4" />
              Remove
            </button>
          )}
        </div>

        <p className="text-center text-xs text-gray-500">
          You can skip this step and add a photo later
        </p>
      </div>
    </div>
  );
}