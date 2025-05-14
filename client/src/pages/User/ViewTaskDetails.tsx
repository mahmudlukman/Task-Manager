import React from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import AvatarGroup from "../../components/AvatarGroup";
import moment from "moment";
import {
  LuSquareArrowOutUpRight,
  LuDownload,
  LuFileText,
  LuImage,
  LuFile,
} from "react-icons/lu";
import {
  useGetTaskQuery,
  useUpdateTaskChecklistMutation,
} from "../../redux/features/task/taskApi";
import type { Attachment, Todo, User } from "../../@types";

const ViewTaskDetails = () => {
  const { id } = useParams<{ id: string }>();
  const {
    data: task,
    isLoading,
    isError,
  } = useGetTaskQuery({ id: id! }, { skip: !id });
  const [updateTaskChecklist, { isLoading: isUpdatingChecklist }] =
    useUpdateTaskChecklistMutation();

  const getStatusTagColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "text-cyan-500 bg-cyan-50 border border-cyan-500/10";
      case "Completed":
        return "text-lime-500 bg-lime-50 border border-lime-500/20";
      default:
        return "text-violet-500 bg-violet-50 border border-violet-500/10";
    }
  };

  // Handle todo check
  const updateTodoChecklist = async (index: number) => {
    if (!task) return;

    const todoChecklist = [...task.todoChecklist];
    if (todoChecklist[index]) {
      todoChecklist[index] = {
        ...todoChecklist[index],
        completed: !todoChecklist[index].completed,
      };

      try {
        await updateTaskChecklist({
          id: task._id,
          data: { todoChecklist },
        }).unwrap();
        // No need to update state; mutation invalidates task cache
      } catch (err) {
        console.error("Error updating checklist:", err);
        // Optionally show error message
      }
    }
  };

  // Handle attachment view/download
  const handleAttachment = (
    attachment: Attachment,
    action: "view" | "download"
  ) => {
    const url = attachment.url;

    if (action === "view") {
      // Open in new tab for viewing
      window.open(url, "_blank");
    } else {
      // For download, we need to fetch the file as a blob to preserve the filename
      fetch(url)
        .then((response) => response.blob())
        .then((blob) => {
          // Create a blob URL for the file
          const blobUrl = URL.createObjectURL(blob);

          // Create a temporary link element to trigger the download
          const link = document.createElement("a");
          link.href = blobUrl;

          // Use the original filename from the attachment object
          const filename = attachment.filename || "download.file";
          link.setAttribute("download", filename);

          // Append to document, click, and clean up
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Release the blob URL to free memory
          setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        })
        .catch((error) => {
          console.error("Error downloading file:", error);
          alert("Failed to download file. Please try again.");
        });
    }
  };

  return (
    <DashboardLayout activeMenu="My Tasks">
      <div className="mt-5">
        {isLoading && <p className="text-gray-500">Loading task details...</p>}

        {isError && <p className="text-red-500">Error fetching task</p>}

        {!isLoading && !isError && !task && (
          <p className="text-gray-500">Task not found.</p>
        )}

        {task && (
          <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
            <div className="form-card col-span-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm md:text-xl font-medium">{task.title}</h2>
                <div
                  className={`text-[11px] md:text-[13px] font-medium ${getStatusTagColor(
                    task.status
                  )} px-4 py-0.5 rounded`}
                >
                  {task.status}
                </div>
              </div>

              <div className="mt-4">
                <InfoBox
                  label="Description"
                  value={task.description || "N/A"}
                />
              </div>

              <div className="grid grid-cols-12 gap-4 mt-4">
                <div className="col-span-6 md:col-span-4">
                  <InfoBox label="Priority" value={task.priority} />
                </div>
                <div className="col-span-6 md:col-span-4">
                  <InfoBox
                    label="Due Date"
                    value={
                      task.dueDate
                        ? moment(task.dueDate).format("Do MMM YYYY")
                        : "N/A"
                    }
                  />
                </div>
                <div className="col-span-6 md:col-span-4">
                  <label className="text-xs font-medium text-slate-500">
                    Assigned To
                  </label>
                  <AvatarGroup
                    avatars={
                      task.assignedTo?.map(
                        (user: User) => user.avatar?.url || ""
                      ) || []
                    }
                    maxVisible={5}
                  />
                </div>
              </div>

              <div className="mt-2">
                <label className="text-xs font-medium text-slate-500">
                  Todo Checklist
                </label>
                {task.todoChecklist?.map((item: Todo, index: number) => (
                  <TodoCheckList
                    key={`todo_${index}`}
                    text={item.text}
                    isChecked={item.completed}
                    onChange={() => updateTodoChecklist(index)}
                    disabled={isUpdatingChecklist}
                  />
                ))}
              </div>

              {(task.attachments ?? []).length > 0 && (
                <div className="mt-4">
                  <label className="text-xs font-medium text-slate-500 mb-2 block">
                    Attachments
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {task.attachments?.map(
                      (attachment: Attachment, index: number) => (
                        <AttachmentCard
                          key={`attachment_${index}`}
                          attachment={attachment}
                          onView={() => handleAttachment(attachment, "view")}
                          onDownload={() =>
                            handleAttachment(attachment, "download")
                          }
                        />
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ViewTaskDetails;

interface InfoBoxProps {
  label: string;
  value: string;
}

const InfoBox: React.FC<InfoBoxProps> = ({ label, value }) => {
  return (
    <>
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <p className="text-[12px] md:text-[13px] font-medium text-gray-700 mt-0.5">
        {value}
      </p>
    </>
  );
};

interface TodoCheckListProps {
  text: string;
  isChecked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

const TodoCheckList: React.FC<TodoCheckListProps> = ({
  text,
  isChecked,
  onChange,
  disabled,
}) => {
  return (
    <div className="flex items-center gap-3 p-3">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm outline-none cursor-pointer disabled:opacity-50"
      />
      <p className="text-[13px] text-gray-800">{text}</p>
    </div>
  );
};

interface AttachmentCardProps {
  attachment: Attachment;
  onView: () => void;
  onDownload: () => void;
}

const AttachmentCard: React.FC<AttachmentCardProps> = ({
  attachment,
  onView,
  onDownload,
}) => {
  // Function to get file icon based on fileType
  const getFileIcon = () => {
    const type = attachment.fileType?.toLowerCase() || "";
    const url = attachment.url?.toLowerCase() || "";

    if (type.includes("pdf") || url.match(/\.pdf$/i)) {
      return <LuFileText className="text-red-500 text-4xl" />;
    } else if (
      type.includes("image") ||
      url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    ) {
      return <LuImage className="text-blue-500 text-4xl" />;
    } else if (
      type.includes("excel") ||
      type.includes("spreadsheet") ||
      url.match(/\.(xls|xlsx|csv)$/i)
    ) {
      return <LuFile className="text-green-500 text-4xl" />;
    } else if (
      type.includes("word") ||
      type.includes("document") ||
      url.match(/\.(doc|docx)$/i)
    ) {
      return <LuFileText className="text-blue-600 text-4xl" />;
    } else {
      return <LuFile className="text-gray-500 text-4xl" />;
    }
  };

  // Function to get file extension for display
  const getFileExtension = () => {
    const filename = attachment.filename || attachment.url;
    const parts = filename.split(".");
    if (parts.length > 1) {
      return parts[parts.length - 1].toUpperCase();
    }
    return "";
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";

    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Check if the file is an image that can be previewed
  const isPreviewableImage =
    attachment.fileType?.includes("image") ||
    attachment.url.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {isPreviewableImage ? (
              <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                <img
                  src={attachment.url}
                  alt="Preview"
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center">
                {getFileIcon()}
              </div>
            )}
            <div>
              <p
                className="text-sm font-medium truncate"
                title={attachment.filename || ""}
              >
                {attachment.filename || "Attachment"}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{getFileExtension()}</span>
                {attachment.size && <span>•</span>}
                <span>{formatFileSize(attachment.size)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={onView}
            className="flex-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium flex items-center justify-center"
          >
            <LuSquareArrowOutUpRight className="mr-1" /> View
          </button>
          <button
            onClick={onDownload}
            className="flex-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-xs font-medium flex items-center justify-center"
          >
            <LuDownload className="mr-1" /> Download
          </button>
        </div>
      </div>
    </div>
  );
};
