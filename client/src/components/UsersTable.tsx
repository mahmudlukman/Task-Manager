import { ApiError, User } from "../@types";
import {
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useRestoreUserMutation,
} from "../redux/features/user/userApi";
import { toast } from "react-hot-toast";
import { FaTrash, FaUndo } from "react-icons/fa";
import DeleteAlert from "./DeleteAlert";
import { useState } from "react";

const UsersTable = ({ usersData }: { usersData: User[] }) => {
  const [updateUserStatus, { isLoading: isUpdating }] =
    useUpdateUserStatusMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [restoreUser, { isLoading: isRestoring }] = useRestoreUserMutation();
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Define available roles
  const availableRoles = ["admin", "member"];

  // Handle role and status changes
  const handleUserStatusChange = async (
    userId: string,
    newRole?: string,
    isActive?: boolean
  ) => {
    try {
      const updateData: { id: string; role?: string; isActive?: boolean } = {
        id: userId,
      };
      if (newRole) updateData.role = newRole;
      if (isActive !== undefined) updateData.isActive = isActive;

      await updateUserStatus({ data: updateData }).unwrap();
      toast.success(`User ${newRole ? "role" : "status"} updated successfully`);
    } catch (error) {
      toast.error(`Failed to update user ${newRole ? "role" : "status"}`);
      console.error("User update error:", error);
    }
  };

  const handleDeleteClick = (userId: string) => {
    setDeleteUserId(userId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteUserId) return;

    try {
      await deleteUser(deleteUserId).unwrap();
      toast.success("User marked for deletion");
    } catch (error: unknown) {
      // Extract backend error message if available
      const errorMessage =
        (error as ApiError)?.data?.message ||
        (error as ApiError)?.error ||
        "Failed to mark user for deletion";
      toast.error(errorMessage);
      console.error("Delete user error:", error);
    } finally {
      setDeleteUserId(null);
    }
  };

  const handleRestoreClick = async (userId: string) => {
    try {
      const result = await restoreUser(userId).unwrap();
      if (result.success) {
        toast.success("User restored successfully");
      } else {
        toast.error("Failed to restore user");
      }
    } catch (error) {
      toast.error("Failed to restore user");
      console.error("Restore user error:", error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteUserId(null);
  };

  return (
    <div className="overflow-x-auto p-0 rounded-lg mt-3">
      <table className="min-w-full">
        <thead>
          <tr className="text-left bg-gray-100">
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px] hidden md:table-cell">
              Avatar
            </th>
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">
              Name
            </th>
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">
              Role
            </th>
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">
              Status
            </th>
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {usersData.map((user) => {
            const initial =
              user.name && user.name.trim()
                ? user.name.charAt(0).toUpperCase()
                : "U";
            // Dynamic classes for role dropdown
            const roleClass =
              user.role === "admin"
                ? "bg-green-100 text-green-800 cursor-not-allowed"
                : "bg-blue-100 text-blue-800";

            // Dynamic classes for status dropdown
            const statusClass =
              user.isActive ?? true
                ? "bg-purple-100 text-purple-800"
                : "bg-red-100 text-red-800";
            return (
              <tr key={user._id} className="border-t border-gray-200">
                <td className="my-3 mx-4 text-gray-700 text-[13px] line-clamp-1 overflow-hidden hidden md:table-cell">
                  {user?.avatar?.url ? (
                    <img
                      src={user.avatar.url}
                      alt={`${user.name || "User"}'s avatar`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-sm">
                      {initial}
                    </div>
                  )}
                </td>
                <td className="py-4 px-4">
                  <span className="px-2 py-1 text-xs rounded inline-block">
                    {user.name || "N/A"}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <select
                    value={user.role || "member"}
                    onChange={(e) =>
                      handleUserStatusChange(user._id, e.target.value)
                    }
                    disabled={isUpdating || !!user.deletedAt}
                    className={`px-2 py-1 text-xs rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer w-full md:w-auto ${roleClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {availableRoles.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-4 px-4">
                  {user.deletedAt ? (
                    <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                      Pending Deletion
                    </span>
                  ) : (
                    <select
                      value={user.isActive ?? true ? "active" : "suspended"}
                      onChange={(e) =>
                        handleUserStatusChange(
                          user._id,
                          undefined,
                          e.target.value === "active"
                        )
                      }
                      disabled={isUpdating}
                      className={`px-2 py-1 text-xs rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer w-full md:w-auto ${statusClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  )}
                </td>
                <td className="py-4 px-4">
                  {user.deletedAt ? (
                    <button
                      onClick={() => handleRestoreClick(user._id)}
                      disabled={isRestoring}
                      className="text-blue-500 hover:text-blue-700 cursor-pointer disabled:cursor-not-allowed"
                      title="Restore user"
                    >
                      <FaUndo className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDeleteClick(user._id)}
                      disabled={isDeleting}
                      className="text-rose-500 hover:text-rose-700 cursor-pointer disabled:cursor-not-allowed"
                      title="Delete user"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {deleteUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 cursor-pointer" onClick={handleCancelDelete}></div>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Deletion
              </h3>
              <button
                onClick={handleCancelDelete}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <DeleteAlert
              content="Are you sure you want to delete this user? This user will be marked for deletion and permanently deleted after 30 days."
              onDelete={handleConfirmDelete}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTable;