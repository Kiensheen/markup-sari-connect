import { Camera, Pencil, X } from "lucide-react";
import type { User } from "@/lib/mockData";

interface ProfileHeaderProps {
  user: User;
  isEditing: boolean;
  onEditToggle: () => void;
  onPhotoSelected: (file: File) => void;
  onRemovePhoto: () => void;
}

export function ProfileHeader({
  user,
  isEditing,
  onEditToggle,
  onPhotoSelected,
  onRemovePhoto,
}: ProfileHeaderProps) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onPhotoSelected(file);
    e.target.value = "";
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-600 p-6 text-white shadow-md">
      <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-24 w-24 -translate-x-1/2 translate-y-8 rounded-full bg-white/5" />

      <div className="relative flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative shrink-0">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white/20 text-4xl font-bold ring-2 ring-white/30 backdrop-blur-sm">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-emerald-600 text-white shadow-md ring-2 ring-white transition hover:bg-emerald-700">
            <Camera className="h-4 w-4" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
              aria-label="Upload profile photo"
            />
          </label>
          {user.avatar_url && (
            <button
              type="button"
              onClick={onRemovePhoto}
              className="absolute -bottom-1 -left-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-md ring-2 ring-white transition hover:bg-red-600"
              aria-label="Remove profile photo"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h1 className="truncate text-xl font-bold">{user.name}</h1>
          <p className="truncate text-sm text-emerald-100">{user.email}</p>
          {user.phone && <p className="mt-0.5 text-xs text-emerald-100">📞 {user.phone}</p>}
          {user.store_name && (
            <p className="mt-1 inline-block max-w-full truncate rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium">
              🏪 {user.store_name}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onEditToggle}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/30 active:scale-95"
        >
          <Pencil className="h-3.5 w-3.5" />
          {isEditing ? "Close Editor" : "Edit Profile"}
        </button>
      </div>
    </div>
  );
}
