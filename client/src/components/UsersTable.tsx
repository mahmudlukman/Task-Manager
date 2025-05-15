import { User } from "../@types";
import { useUpdateUserRoleMutation } from "../redux/features/user/userApi"; // Adjust path
import { toast } from "react-hot-toast";

const UsersTable = ({ usersData }: { usersData: User[] }) => {
  const [updateUserRole, { isLoading: isUpdating }] = useUpdateUserRoleMutation();

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
              Status
            </th>
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;