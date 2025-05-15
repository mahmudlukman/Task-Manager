import { useRef, useState, ChangeEvent, useEffect } from "react";
import { LuUser, LuUpload, LuTrash, LuPenLine } from "react-icons/lu";

interface ProfilePhotoSelectorProps {
  image: File | null;
  setImage: (file: File | null) => void;
  currentImageUrl?: string | null;
  editMode?: boolean; // Determines which icon to use
}

const ProfilePhotoSelector = ({ 
  image, 
  setImage, 
  currentImageUrl,
  editMode = false // Default to false for backward compatibility with SignUp
}: ProfilePhotoSelectorProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Set the current image URL as preview when component mounts
  useEffect(() => {
    if (currentImageUrl && !previewUrl && !image) {
      setPreviewUrl(currentImageUrl);
    }
  }, [currentImageUrl, previewUrl, image]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Update the image state
      setImage(file);

      // Generate preview URL from the file
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl(null);
  };

  const onChooseFile = () => {
    inputRef.current?.click();
  };

  // Handle icon click based on mode
  const handleIconClick = () => {
    if (editMode) {
      // In edit mode, clicking the pen should open file selection
      onChooseFile();
    } else {
      // In signup mode, clicking trash should remove the image
      handleRemoveImage();
    }
  };

  // Determine which icon and color to use based on the mode
  const ActionIcon = editMode ? LuPenLine : LuTrash;
  const actionButtonClass = editMode 
    ? "w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full absolute -bottom-1 -right-1 cursor-pointer"
    : "w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full absolute -bottom-1 -right-1 cursor-pointer";

  return (
    <div className="flex justify-center mb-6">
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleImageChange}
        className="hidden"
      />

      {!previewUrl ? (
        <div className="w-20 h-20 flex items-center justify-center bg-blue-100/50 rounded-full relative cursor-pointer">
          <LuUser className="text-4xl text-primary" />

          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full absolute -bottom-1 -right-1 cursor-pointer"
            onClick={onChooseFile}
          >
            <LuUpload />
          </button>
        </div>
      ) : (
        <div className="relative">
          <img
            src={previewUrl}
            alt="profile photo"
            className="w-20 h-20 rounded-full object-cover"
          />
          <button
            type="button"
            className={actionButtonClass}
            onClick={handleIconClick}
          >
            <ActionIcon />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoSelector;