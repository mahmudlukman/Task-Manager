import React from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { LuFileSpreadsheet } from "react-icons/lu";
import TaskStatusTabs from "../../components/TaskStatusTabs";
import TaskCard from "../../components/Cards/TaskCard";
import { useGetAllTasksQuery } from "../../redux/features/task/taskApi";
import { toast } from "react-hot-toast";
import { useExportTasksReportMutation } from "../../redux/features/report/reportApi";
import { StatusTab, Task } from "../../@types";
import { downloadBlob } from "../../utils/helper";

const ManageTasks = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = React.useState("All");

  // Fetch tasks with status filter
  const {
    data: tasksData,
    isLoading,
    isError,
  } = useGetAllTasksQuery({
    status: filterStatus === "All" ? undefined : filterStatus,
  });

  // Download report mutation
  const [exportTasksReport, { isLoading: isExporting }] =
    useExportTasksReportMutation();

  // Prepare tabs from statusSummary
  const tabs: StatusTab[] = React.useMemo(() => {
    const statusSummary = tasksData?.statusSummary || {
      all: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      completedTasks: 0,
    };

    return [
      { label: "All", count: statusSummary.all },
      { label: "Pending", count: statusSummary.pendingTasks },
      { label: "In Progress", count: statusSummary.inProgressTasks },
      { label: "Completed", count: statusSummary.completedTasks },
    ];
  }, [tasksData]);

  // Handle task card click
  const handleClick = (taskData: Task) => {
    navigate(`/admin/create-task`, { state: { taskId: taskData._id } });
  };

  // Download task report
  const handleDownloadReport = async () => {
    try {
      const blob = await exportTasksReport().unwrap();
      downloadBlob(
        blob,
        `tasks_report_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download report. Please try again.");
    }
  };

  return (
    <DashboardLayout activeMenu="Manage Tasks">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl md:text-xl font-medium">My Tasks</h2>
            <button
              className="flex lg:hidden download-btn"
              onClick={handleDownloadReport}
              disabled={isExporting}
            >
              <LuFileSpreadsheet className="text-lg" />
              Download Report
            </button>
          </div>

          {tabs?.[0]?.count > 0 && (
            <div className="flex items-center gap-3">
              <TaskStatusTabs
                tabs={tabs}
                activeTab={filterStatus}
                setActiveTab={setFilterStatus}
              />
              <button
                className="hidden lg:flex download-btn"
                onClick={handleDownloadReport}
                disabled={isExporting}
              >
                <LuFileSpreadsheet className="text-lg" />
                Download Report
              </button>
            </div>
          )}
        </div>

        {isLoading && <p className="text-gray-500 mt-4">Loading tasks...</p>}

        {isError && <p className="text-red-500 mt-4">Error fetching tasks:</p>}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {tasksData?.tasks?.length ? (
              tasksData.tasks.map((item: Task) => (
                <TaskCard
                  key={item._id}
                  title={item.title}
                  description={item.description}
                  priority={item.priority}
                  status={item.status}
                  progress={item.progress}
                  createdAt={item.createdAt}
                  dueDate={item.dueDate}
                  assignedTo={item.assignedTo || []}
                  attachmentCount={item.attachments?.length || 0}
                  completedTodoCount={item.completedTodoCount || 0}
                  todoChecklist={item.todoChecklist || []}
                  onClick={() => handleClick(item)}
                />
              ))
            ) : (
              <p className="text-gray-500">No tasks available.</p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageTasks;
