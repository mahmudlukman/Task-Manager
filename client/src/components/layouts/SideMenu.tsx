import { useEffect, useState } from "react";
import { SIDE_MENU_DATA, SIDE_MENU_USER_DATA } from "../../utils/data";
import { useNavigate } from "react-router-dom";
import { IconType } from "react-icons";
import { useSelector } from "react-redux";
import { RootState } from "../../@types";
import { useLogOutMutation } from "../../redux/features/auth/authApi";
import { useGetUserNotificationsQuery } from "../../redux/features/notification/notificationApi";

const SideMenu = ({ activeMenu }: { activeMenu: string }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [sideMenuData, setSideMenuData] = useState<
    { id: string; label: string; icon: IconType; path: string }[]
  >([]);
  const [logout, { isLoading: isLoggingOut }] = useLogOutMutation();
  const { data: notificationsData } = useGetUserNotificationsQuery({}); // Fetch notifications
  const navigate = useNavigate();

  // Calculate unread notifications count
  const unreadCount = notificationsData?.pagination?.unreadCount || 0;

  const handleClick = (route: string) => {
    if (route === "logout") {
      handleLogout();
      return;
    }
    navigate(route);
  };

  const handleLogout = async () => {
    try {
      await logout({}).unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  useEffect(() => {
    if (user) {
      setSideMenuData(
        user?.role === "admin" ? SIDE_MENU_DATA : SIDE_MENU_USER_DATA
      );
    }
  }, [user]);

  // Helper to check if a string is a valid URL
  const isImageUrl = (str?: string) => str && str.match(/^(http|https):\/\//);

  // Get initial or fallback
  const initial =
    user?.name && user.name.trim() ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 sticky top-[61px] z-20">
      <div className="flex flex-col items-center justify-center mb-7 pt-5">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
            {isImageUrl(user?.avatar?.url) ? (
              <img
                src={user?.avatar?.url ?? ""}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-800 text-lg font-medium rounded-full">
                {initial}
              </div>
            )}
          </div>
        </div>

        {user?.role === "admin" && (
          <div className="text-[10px] font-medium text-white bg-primary px-3 py-0.5 rounded mt-1">
            Admin
          </div>
        )}

        <h5 className="text-gray-950 font-medium leading-6 mt-3">
          {user?.name || ""}
        </h5>

        <p className="text-[12px] text-gray-500">{user?.email || ""}</p>
      </div>

      {sideMenuData.map((item, index) => (
        <button
          key={`menu_${index}`}
          className={`w-full flex items-center gap-4 text-[15px] ${
            activeMenu === item.label
              ? "text-primary bg-linear-to-r from-blue-50/40 to-blue-100/50 border-r-3"
              : ""
          } py-3 px-6 mb-3 cursor-pointer relative`}
          onClick={() => handleClick(item.path)}
          disabled={item.path === "logout" && isLoggingOut}
        >
          <item.icon className="text-xl" />
          <span>
            {item.path === "logout" && isLoggingOut
              ? "Logging out..."
              : item.label}
          </span>
          {item.label === "Notifications" && unreadCount > 0 && (
            <span className="absolute right-4 bg-red-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default SideMenu;
