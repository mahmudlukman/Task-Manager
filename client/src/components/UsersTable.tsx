import { User } from "../@types";
import {
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} from "../redux/features/user/userApi";
import { toast } from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import DeleteAlert from "./DeleteAlert";
import { useState } from "react";

const UsersTable = ({ usersData }: { usersData: User[] }) => {
  const [updateUserRole, { isLoading: isUpdating }] =
    useUpdateUserRoleMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Define available roles (adjust based on your app's roles)
  const availableRoles = ["admin", "member"]; // Example roles

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole({ data: { id: userId, role: newRole } }).unwrap();
      toast.success("User role updated successfully");
    } catch (error) {
      toast.error("Failed to update user role");
      console.error("Role update error:", error);
    }
  };

  const handleDeleteClick = (userId: string) => {
    setDeleteUserId(userId); // Show confirmation modal
  };

  const handleConfirmDelete = async () => {
    if (!deleteUserId) return;

    try {
      await deleteUser(deleteUserId).unwrap();
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Failed to delete user");
      console.error("Delete user error:", error);
    } finally {
      setDeleteUserId(null); // Close modal
    }
  };

  const handleCancelDelete = () => {
    setDeleteUserId(null); // Close modal
  };

  return (
    <div className="overflow-x-auto p-0 rounded-lg mt-3">
      <table className="min-w-full">
        <thead>
          <tr className="text-left">
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">
              Avatar
            </th>
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">
              Name
            </th>
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">
              Role
            </th>
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px] hidden md:table-cell">
              Action
            </th>
            {/* <th className="py-3 px-4 text-gray-800 font-medium text-[13px] hidden md:table-cell">
              Status
            </th> */}
          </tr>
        </thead>
        <tbody>
          {usersData.map((user) => {
            // Get initial or fallback
            const initial =
              user.name && user.name.trim()
                ? user.name.charAt(0).toUpperCase()
                : "U";
            return (
              <tr key={user._id} className="border-t border-gray-200">
                <td className="my-3 mx-4 text-gray-700 text-[13px] line-clamp-1 overflow-hidden">
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
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    disabled={isUpdating}
                    className="px-2 py-1 text-xs rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {availableRoles.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </td>
                {/* <td className="py-4 px-4 hidden md:table-cell">
                  <span className="px-2 py-1 text-xs rounded inline-block">
                    {user.status || "N/A"}
                  </span>
                </td> */}
                <td className="py-4 px-4">
                  <button
                    onClick={() => handleDeleteClick(user._id)}
                    disabled={isDeleting}
                    className="text-rose-500 hover:text-rose-700"
                    title="Delete user"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Delete Confirmation Modal */}
      {deleteUserId && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-red-400 text-white rounded-lg p-6 max-w-sm w-full">
            <DeleteAlert
              content="Are you sure you want to delete this user? This action cannot be undone."
              onDelete={handleConfirmDelete}
            />
            <button
              onClick={handleCancelDelete}
              className="mt-2 text-sm text-white hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTable;
