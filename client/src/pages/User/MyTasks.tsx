import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import TaskStatusTabs from "../../components/TaskStatusTabs";
import TaskCard from "../../components/Cards/TaskCard";
import { useGetAllTasksQuery } from "../../redux/features/task/taskApi";

const MyTasks = () => {
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const navigate = useNavigate();

  // Use RTK Query to fetch tasks
  const { data, isLoading, isError } = useGetAllTasksQuery({
    status: filterStatus === "All" ? undefined : filterStatus,
  });

  // Extract tasks and status summary
  const allTasks = data?.tasks || [];
  const statusSummary = data?.statusSummary || {
    all: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
  };

  // Map statusSummary to tabs
  const tabs = [
    { label: "All", count: statusSummary.all || 0 },
    { label: "Pending", count: statusSummary.pendingTasks || 0 },
    { label: "In Progress", count: statusSummary.inProgressTasks || 0 },
    { label: "Completed", count: statusSummary.completedTasks || 0 },
  ];

  const handleClick = (taskId: string) => {
    navigate(`/user/task-details/${taskId}`);
  };

  return (
    <DashboardLayout activeMenu="My Tasks">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <h2 className="text-xl md:text-xl font-medium">My Tasks</h2>

          {tabs?.[0]?.count > 0 && (
            <TaskStatusTabs
              tabs={tabs}
              activeTab={filterStatus}
              setActiveTab={setFilterStatus}
            />
          )}
        </div>

        {isLoading && <p className="text-gray-500">Loading tasks...</p>}

        {isError && (
          <p className="text-red-500">
            Error fetching tasks
          </p>
        )}

        {!isLoading && allTasks.length === 0 && (
          <p className="text-gray-500">No tasks found.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {allTasks.map((item) => (
            <TaskCard
              key={item._id}
              title={item.title}
              description={item.description}
              priority={item.priority}
              status={item.status}
              progress={item.progress}
              createdAt={item.createdAt}
              dueDate={item.dueDate}
              assignedTo={item.assignedTo} // Pass full user objects
              attachmentCount={item.attachments?.length || 0}
              completedTodoCount={
                item.todoChecklist.filter((todo) => todo.completed).length
              }
              todoChecklist={item.todoChecklist}
              onClick={() => handleClick(item._id)}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyTasks;