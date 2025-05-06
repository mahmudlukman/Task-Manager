import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import moment from "moment";
import { addThousandsSeparator } from "../../utils/helper";
import InfoCard from "../../components/Cards/InfoCard";
import TaskListTable from "../../components/TaskListTable";
import CustomPieChart from "../../components/Charts/CustomPieChart";
import CustomBarChart from "../../components/Charts/CustomBarChart";
import { BarChartDataItem, PieChartDataItem, RootState, UserDashboardData } from "../../@types";
import { useGetUserDashboardDataQuery } from "../../redux/features/task/taskApi";

const COLORS = ["#8D51FF", "#00B8DB", "#7BCE00"];

const UserDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  // Fetch dashboard data
  const {
    data: dashboardData,
    isLoading,
    isError,
  } = useGetUserDashboardDataQuery();

  // Prepare chart data
  const prepareChartData = (data: UserDashboardData | undefined): {
    pieChartData: PieChartDataItem[];
    barChartData: BarChartDataItem[];
  } => {
    const taskDistribution = data?.charts?.taskDistribution || {
      Pending: 0,
      InProgress: 0,
      Completed: 0,
    };
    const taskPriorityLevels = data?.charts?.taskPriorityLevels || {
      Low: 0,
      Medium: 0,
      High: 0,
    };

    const pieChartData: PieChartDataItem[] = [
      { status: "Pending", count: taskDistribution.Pending },
      { status: "In Progress", count: taskDistribution.InProgress },
      { status: "Completed", count: taskDistribution.Completed },
    ];

    const barChartData: BarChartDataItem[] = [
      { priority: "Low", count: taskPriorityLevels.Low },
      { priority: "Medium", count: taskPriorityLevels.Medium },
      { priority: "High", count: taskPriorityLevels.High },
    ];

    return { pieChartData, barChartData };
  };

  // Compute chart data
  const { pieChartData, barChartData } = prepareChartData(dashboardData);

  const onSeeMore = () => {
    navigate("/user/tasks"); // Fixed to user context
  };

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="card my-5">
        <div>
          <div className="col-span-3">
            <h2 className="text-xl md:text-2xl">Good Morning! {user?.name}</h2>
            <p className="text-xs md:text-[13px] text-gray-400 mt-1.5">
              {moment().format("dddd Do MMM YYYY")}
            </p>
          </div>
        </div>

        {isLoading && <p className="text-gray-500">Loading dashboard data...</p>}

        {isError && (
          <p className="text-red-500">
            Error fetching dashboard data
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5">
          <InfoCard
            label="Total Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.All || 0
            )}
            color="bg-primary"
          />
          <InfoCard
            label="Pending Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.Pending || 0
            )}
            color="bg-violet-500"
          />
          <InfoCard
            label="In Progress Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.InProgress || 0
            )}
            color="bg-cyan-500"
          />
          <InfoCard
            label="Completed Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.Completed || 0
            )}
            color="bg-lime-500"
          />
        </div>
      </div>

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6">
          <div>
            <div className="card">
              <div className="flex items-center justify-between">
                <h5 className="font-medium">Task Distribution</h5>
              </div>
              <CustomPieChart data={pieChartData} colors={COLORS} />
            </div>
          </div>

          <div>
            <div className="card">
              <div className="flex items-center justify-between">
                <h5 className="font-medium">Task Priority Levels</h5>
              </div>
              <CustomBarChart data={barChartData} />
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between">
                <h5 className="text-lg">Recent Tasks</h5>
                <button className="card-btn" onClick={onSeeMore}>View Tasks</button>
              </div>
              <TaskListTable tableData={dashboardData?.recentTasks || []} />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UserDashboard;