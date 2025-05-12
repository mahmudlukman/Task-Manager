import React, { Dispatch, SetStateAction, useState } from "react";
import { HiMiniPlus, HiOutlineTrash } from "react-icons/hi2";
import { LuPaperclip } from "react-icons/lu";
import { Attachment } from "../../@types";
import toast from "react-hot-toast";
import { useDeleteAttachmentMutation } from "../../redux/features/task/taskApi";

interface AttachmentsInputProps {
  attachments: Attachment[];
  setAttachments: (value: SetStateAction<Attachment[]>) => void;
  taskId?: string;
  pendingFiles: File[];
  setPendingFiles: Dispatch<SetStateAction<File[]>>;
}

const AddAttachmentsInput = ({
  attachments,
  setAttachments,
  taskId,
}: AttachmentsInputProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pendingFiles, setPendingFiles] = useState<File[]>([]); // Store new files
  const [deleteAttachment, { isLoading: isDeleting }] =
    useDeleteAttachmentMutation();

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = Array.from(files).map((file) => ({
      public_id: `temp_${Math.random().toString(36).substring(2)}`, // Temporary ID
      url: URL.createObjectURL(file), // Temporary preview
      name: file.name,
      fileName: file.name,
      fileType: file.type || "unknown",
      size: file.size,
    }));

    setPendingFiles((prev) => [...prev, ...Array.from(files)]);
    setAttachments((prev) => [...prev, ...newAttachments]);
    event.target.value = ""; // Reset input
  };

  // Handle deleting an attachment
  const handleDeleteAttachment = async (index: number) => {
    const attachment = attachments[index];
    try {
      if (taskId && !attachment.public_id.startsWith("temp_")) {
        // Delete from backend for existing tasks
        await deleteAttachment({
          id: taskId,
          attachmentId: attachment.public_id,
        }).unwrap();
        toast.success("Attachment deleted successfully");
      }

      // Remove from state
      setAttachments((prev) => prev.filter((_, idx) => idx !== index));
      setPendingFiles((prev) => prev.filter((_, idx) => idx !== index));
    } catch (error) {
      console.error("Delete attachment error:", error);
      toast.error("Failed to delete attachment");
    }
  };

  return (
    <div>
      {attachments.map((item, index) => (
        <div
          key={item.public_id}
          className="flex justify-between bg-gray-50 border border-gray-100 px-3 py-2 rounded-md mb-3 mt-2"
        >
          <div className="flex-1 flex items-center gap-3">
            <LuPaperclip className="text-gray-400" />
            <p className="text-xs text-black">{item.name}</p>
            {item.fileType.startsWith("image/") && (
              <img
                src={item.url}
                alt={item.name}
                className="w-6 h-6 object-cover rounded"
              />
            )}
          </div>

          <button
            className="cursor-pointer"
            onClick={() => handleDeleteAttachment(index)}
            disabled={isDeleting}
          >
            <HiOutlineTrash className="text-lg text-red-500" />
          </button>
        </div>
      ))}

      <div className="flex items-center gap-5 mt-4">
        <div className="flex-1 flex items-center gap-3 border border-gray-100 rounded-md px-3">
          <LuPaperclip className="text-gray-400" />
          <input
            type="file"
            multiple
            accept="image/*,application/pdf,.doc,.docx"
            onChange={handleFileChange}
            className="w-full text-[13px] text-black outline-none bg-white py-2"
            disabled={isDeleting}
          />
        </div>

        <button className="card-btn text-nowrap" disabled={isDeleting}>
          <HiMiniPlus className="text-lg" /> Add
        </button>
      </div>
    </div>
  );
};

export default AddAttachmentsInput;
