import React from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import AvatarGroup from "../../components/AvatarGroup";
import moment from "moment";
import { LuSquareArrowOutUpRight } from "react-icons/lu";
import { useGetTaskQuery, useUpdateTaskChecklistMutation } from "../../redux/features/task/taskApi";
import type { Attachment, Todo, User } from "../../@types";


const ViewTaskDetails = () => {
  const { id } = useParams<{ id: string }>();
  const {
    data: task,
    isLoading,
    isError,
  } = useGetTaskQuery({ id: id! }, { skip: !id });
  const [updateTaskChecklist, { isLoading: isUpdatingChecklist }] = useUpdateTaskChecklistMutation();

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

  // Handle attachment link click
  const handleLinkClick = (link: string) => {
    if (!/^https?:\/\//i.test(link)) {
      link = "https://" + link; // Default to HTTPS
    }
    window.open(link, "_blank");
  };

  return (
    <DashboardLayout activeMenu="My Tasks">
      <div className="mt-5">
        {isLoading && <p className="text-gray-500">Loading task details...</p>}

        {isError && (
          <p className="text-red-500">
            Error fetching task
          </p>
        )}

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
                <InfoBox label="Description" value={task.description || "N/A"} />
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
                      task.assignedTo?.map((user: User) =>
                        user.avatar?.url || ""
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
                <div className="mt-2">
                  <label className="text-xs font-medium text-slate-500">
                    Attachments
                  </label>
                  {task.attachments?.map((attachment: Attachment, index: number) => (
                    <Attachment
                      key={`link_${index}`}
                      link={attachment.url}
                      index={index}
                      onClick={() => handleLinkClick(attachment.url)}
                    />
                  ))}
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

interface AttachmentProps {
  link: string;
  index: number;
  onClick: () => void;
}

const Attachment: React.FC<AttachmentProps> = ({ link, index, onClick }) => {
  return (
    <div
      className="flex justify-between bg-gray-50 border border-gray-100 px-3 py-2 rounded-md mb-3 mt-2 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex-1 flex items-center gap-3">
        <span className="text-xs text-gray-400 font-semibold mr-2">
          {index < 9 ? `0${index + 1}` : index + 1}
        </span>
        <p className="text-xs text-black">{link}</p>
      </div>
      <LuSquareArrowOutUpRight className="text-gray-400" />
    </div>
  );
};