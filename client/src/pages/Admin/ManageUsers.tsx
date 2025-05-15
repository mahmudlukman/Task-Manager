import DashboardLayout from "../../components/layouts/DashboardLayout";
import { LuFileSpreadsheet } from "react-icons/lu";
import UserCard from "../../components/Cards/UserCard";
import { useGetAllUsersQuery } from "../../redux/features/user/userApi";
import { useExportUsersReportMutation } from "../../redux/features/report/reportApi";
import { toast } from "react-hot-toast";
import { User } from "../../@types";
import { downloadBlob } from "../../utils/helper";
import UsersTable from "../../components/UsersTable";

const ManageUsers = () => {
  // Fetch users
  const { data: allUsers, isLoading, isError } = useGetAllUsersQuery({});
  const allUsersList = allUsers?.users || []; // All users
  const usersWithTasks = allUsers?.usersWithTaskCounts || []; // Users with tasks

  // Download report mutation
  const [exportUsersReport, { isLoading: isExporting }] =
    useExportUsersReportMutation();

  // Download user report
  const handleDownloadReport = async () => {
    try {
      const blob = await exportUsersReport().unwrap();
      downloadBlob(
        blob,
        `users_report_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download report. Please try again.");
    }
  };

  return (
    <DashboardLayout activeMenu="Team Members">
      <div className="mt-5 mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <h2 className="text-xl md:text-xl font-medium">Members With Tasks</h2>
          <button
            className="flex download-btn mt-3 md:mt-0"
            onClick={handleDownloadReport}
            disabled={isExporting}
          >
            <LuFileSpreadsheet className="text-lg" />
            {isExporting ? "Downloading..." : "Download Report"}
          </button>
        </div>

        {isLoading && <p className="text-gray-500 mt-4">Loading users...</p>}

        {isError && <p className="text-red-500 mt-4">Error fetching users</p>}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {usersWithTasks.length > 0 ? (
              usersWithTasks.map((user: User) => (
                <UserCard key={user._id} userInfo={user} />
              ))
            ) : (
              <p className="text-gray-500">No users with tasks available.</p>
            )}
          </div>
        )}
      </div>
      <div className="md:col-span-2">
        <h2 className="text-xl md:text-xl font-medium">Team Members</h2>
        <div className="card">
          <div className="flex items-center justify-between"></div>
          <UsersTable usersData={allUsersList} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageUsers;
