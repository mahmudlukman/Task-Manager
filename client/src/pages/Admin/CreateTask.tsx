import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { PRIORITY_DATA } from "../../utils/data";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { LuTrash2 } from "react-icons/lu";
import SelectDropdown from "../../components/Inputs/SelectDropdown";
import SelectUsers from "../../components/Inputs/SelectUsers";
import TodoListInput from "../../components/Inputs/TodoListInput";
import AddAttachmentsInput from "../../components/Inputs/AddAttachmentsInput";
import DeleteAlert from "../../components/DeleteAlert";
import Modal from "../../components/Modal";
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useGetTaskQuery,
  useDeleteTaskMutation,
} from "../../redux/features/task/taskApi";
import { Attachment } from "../../@types";

const CreateTask = () => {
  const location = useLocation();
  const { taskId } = location.state || {};
  const navigate = useNavigate();

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "Low",
    dueDate: null as string | null,
    assignedTo: [] as string[],
    todoChecklist: [] as string[],
    attachments: [] as Attachment[],
  });
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [error, setError] = useState("");

  // RTK Query hooks
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();
  const { data: taskInfo, isLoading: isFetchingTask } = useGetTaskQuery(
    { id: taskId },
    { skip: !taskId }
  );

  const handleValueChange = (
    key: string,
    value: string | string[] | Attachment[] | null
  ) => {
    setTaskData((prevData) => ({ ...prevData, [key]: value }));
    if (key === "attachments") {
      console.log("Attachments updated:", value);
    }
  };

  const clearData = () => {
    setTaskData({
      title: "",
      description: "",
      priority: "Low",
      dueDate: null,
      assignedTo: [],
      todoChecklist: [],
      attachments: [],
    });
    setPendingFiles([]);
  };

  // Convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Create Task
  const handleCreateTask = async () => {
    try {
      const todolist = taskData.todoChecklist.map((item) => ({
        text: item,
        completed: false,
      }));

      // Convert pending files to base64
      const fileAttachments = await Promise.all(
        pendingFiles.map(async (file) => ({
          name: file.name,
          type: file.type,
          data: await fileToBase64(file),
        }))
      );

      const payload = {
        ...taskData,
        dueDate: taskData.dueDate
          ? new Date(taskData.dueDate).toISOString()
          : undefined,
        todoChecklist: todolist,
        fileAttachments,
      };

      await createTask(payload).unwrap();
      toast.success("Task Created Successfully");
      clearData();
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task. Please try again.");
    }
  };

  // Update Task
  const handleUpdateTask = async () => {
    try {
      if (
        !taskId ||
        typeof taskId !== "string" ||
        !/^[0-9a-fA-F]{24}$/.test(taskId)
      ) {
        console.error("Invalid taskId:", taskId);
        toast.error("Invalid task ID. Please select a valid task.");
        return;
      }

      const todolist = taskData.todoChecklist.map((item) => {
        const prevTodoChecklist = taskInfo?.todoChecklist || [];
        const matchedTask = prevTodoChecklist.find(
          (task) => task.text === item
        );
        return {
          text: item,
          completed: matchedTask ? matchedTask.completed : false,
        };
      });

      const validFiles = pendingFiles.filter((file) => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 5MB limit`);
          return false;
        }
        return true;
      });

      const fileAttachments = await Promise.all(
        validFiles.map(async (file) => {
          const base64 = await fileToBase64(file);
          return {
            name: file.name,
            type: file.type,
            data: base64,
          };
        })
      );

      const removeAttachments =
        taskInfo?.attachments
          ?.filter(
            (att) =>
              !taskData.attachments.some(
                (newAtt) => newAtt.public_id === att.public_id
              )
          )
          .map((att) => att.public_id) || [];

      const payload = {
        ...taskData,
        dueDate: taskData.dueDate
          ? new Date(taskData.dueDate).toISOString()
          : undefined,
        todoChecklist: todolist,
        fileAttachments,
        removeAttachments,
      };

      await updateTask({ id: taskId, data: payload }).unwrap();
      toast.success("Task Updated Successfully");
      setPendingFiles([]); // Clear pending files after success
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task. Please try again.");
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (!taskData.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!taskData.description.trim()) {
      setError("Description is required.");
      return;
    }
    if (!taskData.dueDate) {
      setError("Due date is required.");
      return;
    }
    if (taskData.assignedTo.length === 0) {
      setError("Task not assigned to any member");
      return;
    }
    if (taskData.todoChecklist.length === 0) {
      setError("Add at least one todo task");
      return;
    }

    if (taskId) {
      await handleUpdateTask();
    } else {
      await handleCreateTask();
    }
  };

  // Delete Task
  const handleDeleteTask = async () => {
    try {
      await deleteTask(taskId).unwrap();
      toast.success("Task details deleted successfully");
      setOpenDeleteAlert(false);
      navigate("/admin/tasks");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task. Please try again.");
    }
  };

  // Populate form with task data when editing
  // useEffect(() => {
  //   if (taskInfo) {
  //     setTaskData({
  //       title: taskInfo.title ?? "",
  //       description: taskInfo.description ?? "",
  //       priority: taskInfo.priority,
  //       dueDate: taskInfo.dueDate
  //         ? moment(taskInfo.dueDate).format("YYYY-MM-DD")
  //         : null,
  //       assignedTo: taskInfo.assignedTo?.map((user) => user._id) || [],
  //       todoChecklist: taskInfo.todoChecklist?.map((item) => item.text) || [],
  //       attachments:
  //         taskInfo.attachments?.map((att) => ({
  //           public_id: att.public_id,
  //           url: att.url,
  //           filename: att.filename,
  //           fileType: att.fileType,
  //           size: att.size,
  //         })) || [],
  //     });
  //     setPendingFiles([]); // Clear pending files for edit mode
  //   }
  // }, [taskInfo]);
  useEffect(() => {
  if (taskInfo) {
    console.log("taskInfo:", taskInfo);
    console.log("taskInfo.attachments:", taskInfo.attachments);
    setTaskData({
      title: taskInfo.title ?? "",
      description: taskInfo.description ?? "",
      priority: taskInfo.priority ?? "Low",
      dueDate: taskInfo.dueDate
        ? moment(taskInfo.dueDate).format("YYYY-MM-DD")
        : null,
      assignedTo: Array.isArray(taskInfo.assignedTo)
        ? taskInfo.assignedTo.map((user) => user._id || "")
        : [],
      todoChecklist: Array.isArray(taskInfo.todoChecklist)
        ? taskInfo.todoChecklist.map((item) => item.text || "")
        : [],
      attachments: Array.isArray(taskInfo.attachments)
        ? taskInfo.attachments.map((att) => {
            const filename =
              att.filename ||
              (att.url ? (att.url.split("/").pop()?.split("?")[0] || "Unknown") : "Unknown") ||
              "Unknown";
            const cleanPublicId = att.public_id.replace(/^task-attachments\//, "");
            return {
              public_id: cleanPublicId,
              url: att.url || "",
              filename: filename,
              fileType: att.fileType || "unknown",
              size: att.size || 0,
            };
          })
        : [],
    });
    setPendingFiles([]);
    console.log("taskData updated:", taskData);
  }
}, [taskInfo]);

  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

  return (
    <DashboardLayout activeMenu="Create Task">
      <div className="mt-5">
        <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
          <div className="form-card col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-xl font-medium">
                {taskId ? "Update Task" : "Create Task"}
              </h2>

              {taskId && (
                <button
                  className="flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded px-2 py-1 border border-rose-100 hover:border-rose-300 cursor-pointer"
                  onClick={() => setOpenDeleteAlert(true)}
                >
                  <LuTrash2 className="text-base" /> Delete
                </button>
              )}
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600">
                Task Title
              </label>

              <input
                placeholder="Create App UI"
                className="form-input"
                value={taskData.title}
                onChange={({ target }) =>
                  handleValueChange("title", target.value)
                }
              />
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Description
              </label>

              <textarea
                placeholder="Describe task"
                className="form-input"
                rows={4}
                value={taskData.description}
                onChange={({ target }) =>
                  handleValueChange("description", target.value)
                }
              />
            </div>

            <div className="grid grid-cols-12 gap-4 mt-2">
              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">
                  Priority
                </label>

                <SelectDropdown
                  options={PRIORITY_DATA}
                  value={taskData.priority}
                  onChange={(value) => handleValueChange("priority", value)}
                  placeholder="Select Priority"
                />
              </div>

              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">
                  Due Date
                </label>

                <input
                  className="form-input"
                  value={taskData.dueDate || ""}
                  onChange={({ target }) =>
                    handleValueChange("dueDate", target.value)
                  }
                  type="date"
                />
              </div>

              <div className="col-span-12 md:col-span-3">
                <label className="text-xs font-medium text-slate-600">
                  Assign To
                </label>

                <SelectUsers
                  selectedUsers={taskData.assignedTo}
                  setSelectedUsers={(value) => {
                    handleValueChange("assignedTo", value);
                  }}
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                TODO Checklist
              </label>

              <TodoListInput
                todoList={taskData.todoChecklist}
                setTodoList={(value) =>
                  handleValueChange(
                    "todoChecklist",
                    typeof value === "function"
                      ? value(taskData.todoChecklist)
                      : value
                  )
                }
              />
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Add Attachments
              </label>

              <AddAttachmentsInput
                attachments={taskData.attachments}
                setAttachments={(value) =>
                  handleValueChange(
                    "attachments",
                    typeof value === "function"
                      ? value(taskData.attachments)
                      : value
                  )
                }
                taskId={taskId} // Pass taskId for edit mode
                pendingFiles={pendingFiles} // Pass pendingFiles
                setPendingFiles={setPendingFiles} // Pass setPendingFiles
              />
            </div>

            {error && (
              <p className="text-xs font-medium text-red-500 mt-5">{error}</p>
            )}

            {(isCreating || isUpdating || isFetchingTask || isDeleting) && (
              <p className="text-gray-500 mt-4">Processing...</p>
            )}

            <div className="flex justify-end mt-7">
              <button
                className="add-btn"
                onClick={handleSubmit}
                disabled={
                  isCreating || isUpdating || isFetchingTask || isDeleting
                }
              >
                {taskId ? "UPDATE TASK" : "CREATE TASK"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={openDeleteAlert}
        onClose={() => setOpenDeleteAlert(false)}
        title="Delete Task"
      >
        <DeleteAlert
          content="Are you sure you want to delete this task?"
          onDelete={handleDeleteTask}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default CreateTask;
