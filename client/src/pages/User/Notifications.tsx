import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../@types";
import {
  useGetUserNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useDeleteNotificationMutation,
} from "../../redux/features/notification/notificationApi";
import { toast } from "react-hot-toast";
import moment from "moment";
import { LuTrash2, LuCheck } from "react-icons/lu";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { socketId } from "../../utils/helper";

interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  status: "read" | "unread";
  createdAt: string;
}

const Notifications = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data, isLoading, error, refetch } = useGetUserNotificationsQuery(
    {},
    { refetchOnMountOrArgChange: true, skip: !user?._id }
  );
  const [markAsRead, { isLoading: isMarking }] = useMarkNotificationAsReadMutation();
  const [deleteNotification, { isLoading: isDeleting }] = useDeleteNotificationMutation();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    console.log("Notifications component mounted, user ID:", user?._id);
    if (!user?._id) {
      console.warn("No user ID, skipping Socket.IO setup");
      return;
    }

    const handleConnect = () => {
      console.log("Socket.IO connected, ID:", socketId.id);
      console.log("Joining room for user:", user._id);
      socketId.emit("join", user._id);
    };

    const handleDisconnect = () => {
      console.log("Socket.IO disconnected");
    };

    const handleNewNotification = (newNotification: Notification) => {
      console.log("Received new notification:", newNotification);
      if (newNotification.userId === user._id) {
        setNotifications((prev) => [newNotification, ...prev]);
        toast.success("New notification received!");
        refetch();
      }
    };

    socketId.on("connect", handleConnect);
    socketId.on("disconnect", handleDisconnect);
    socketId.on("newNotification", handleNewNotification);

    if (socketId.connected) {
      handleConnect();
    }

    return () => {
      socketId.off("connect", handleConnect);
      socketId.off("disconnect", handleDisconnect);
      socketId.off("newNotification", handleNewNotification);
    };
  }, [user?._id]);

  useEffect(() => {
    if (data?.notifications) {
      console.log("Fetched notifications:", data.notifications);
      setNotifications(data.notifications);
    }
    if (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    }
  }, [data, error]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap();
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, status: "read" } : notif
        )
      );
      toast.success("Notification marked as read");
      refetch();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id).unwrap();
      setNotifications((prev) => prev.filter((notif) => notif._id !== id));
      toast.success("Notification deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  return (
    <DashboardLayout activeMenu="Notifications">
      <div className="mt-5">
        <h2 className="text-xl md:text-2xl font-medium">Notifications</h2>
        {isLoading && <p className="text-gray-500 mt-4">Loading notifications...</p>}
        {error && (
          <p className="text-red-500 mt-4">
            Error loading notifications: {JSON.stringify(error)}
          </p>
        )}
        {!isLoading && !error && notifications.length === 0 && (
          <p className="text-gray-500 mt-4">No notifications available.</p>
        )}
        <div className="mt-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 mb-3 border rounded-lg ${
                notification.status === "unread"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-white border-gray-200"
              } flex justify-between items-center`}
            >
              <div>
                <h3 className="text-sm font-medium text-gray-800">
                  {notification.title}
                </h3>
                <p className="text-xs text-gray-600">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {moment(notification.createdAt).format("MMM DD, YYYY, h:mm A")}
                </p>
              </div>
              <div className="flex gap-2">
                {notification.status === "unread" && (
                  <button
                    className="text-blue-500 hover:text-blue-700 cursor-pointer"
                    onClick={() => handleMarkAsRead(notification._id)}
                    disabled={isMarking}
                    title="Mark as read"
                  >
                    <LuCheck className="text-lg" />
                  </button>
                )}
                <button
                  className="text-red-500 hover:text-red-700 cursor-pointer"
                  onClick={() => handleDelete(notification._id)}
                  disabled={isDeleting}
                  title="Delete"
                >
                  <LuTrash2 className="text-lg" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;