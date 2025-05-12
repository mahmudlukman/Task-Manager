interface UserInfo {
  avatar?: {
    url: string;
  };
  name?: string;
  email?: string;
  pendingTasks?: number;
  inProgressTasks?: number;
  completedTasks?: number;
}

const UserCard = ({ userInfo }: { userInfo: UserInfo }) => {
  // Helper to check if a string is a valid URL
  const isImageUrl = (str?: string) => str && str.match(/^(http|https):\/\//);

  // Get initial or fallback
  const initial = userInfo.name && userInfo.name.trim() ? userInfo.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="user-card p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
            {isImageUrl(userInfo?.avatar?.url) ? (
              <img
                src={userInfo.avatar?.url ?? ''}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-800 text-lg font-medium rounded-full">
                {initial}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium">{userInfo?.name || "Unknown"}</p>
            <p className="text-xs text-gray-500">{userInfo?.email || "No email"}</p>
          </div>
        </div>
      </div>

      <div className="flex items-end gap-3 mt-5">
        <StatCard
          label="Pending"
          count={userInfo?.pendingTasks || 0}
          status="Pending"
        />
        <StatCard
          label="In Progress"
          count={userInfo?.inProgressTasks || 0}
          status="In Progress"
        />
        <StatCard
          label="Completed"
          count={userInfo?.completedTasks || 0}
          status="Completed"
        />
      </div>
    </div>
  );
};

export default UserCard;

interface StatCardProps {
  label: string;
  count: number;
  status: string;
}

const StatCard = ({ label, count, status }: StatCardProps) => {
  const getStatusTagColor = () => {
    switch (status) {
      case "In Progress":
        return "text-cyan-500 bg-gray-50";
      case "Completed":
        return "text-indigo-500 bg-gray-50";
      default:
        return "text-violet-500 bg-gray-50";
    }
  };

  return (
    <div
      className={`flex-1 text-[10px] font-medium ${getStatusTagColor()} px-4 py-0.5 rounded `}
    >
      <span className="text-[12px] font-semibold">{count}</span> <br /> {label}
    </div>
  );
};