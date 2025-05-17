import { useEffect, useState } from "react";
import { LuUsers } from "react-icons/lu";
import Modal from "../Modal";
import AvatarGroup from "../AvatarGroup";
import { useGetAllUsersQuery } from "../../redux/features/user/userApi";
import { User } from "../../@types";

interface SelectUsersProps {
  selectedUsers: string[];
  setSelectedUsers: (users: string[]) => void;
}

const SelectUsers = ({ selectedUsers, setSelectedUsers }: SelectUsersProps) => {
  const { data, isLoading, isError } = useGetAllUsersQuery({});
  const users = data?.users || data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSelectedUsers, setTempSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    setTempSelectedUsers([...selectedUsers]);
  }, [selectedUsers, isModalOpen]);

  const toggleUserSelection = (userId: string) => {
    setTempSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAssign = () => {
    setSelectedUsers(tempSelectedUsers);
    setIsModalOpen(false);
  };

  // Use profileImageUrl or fallback to avatar.url
  const selectedUserAvatars = users
    .filter((user: User) => selectedUsers.includes(user._id))
    .map((user: User) =>
      user.avatar?.url ? user?.name?.charAt(0).toUpperCase() : ""
    );

  // Helper to check if a string is a valid image URL
  const isImageUrl = (str?: string) => str && str.match(/^(http|https):\/\//);

  useEffect(() => {
    if (selectedUsers.length === 0) {
      setTempSelectedUsers([]);
    }
  }, [selectedUsers]);

  return (
    <div className="space-y-4 mt-2">
      {isLoading && <p className="text-gray-500">Loading users...</p>}

      {isError && <p className="text-red-500">Error fetching users</p>}

      {!isLoading && !isError && (
        <>
          {selectedUserAvatars.length === 0 ? (
            <button className="card-btn" onClick={() => setIsModalOpen(true)}>
              <LuUsers className="text-sm" /> Add Members
            </button>
          ) : (
            <div
              className="cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <AvatarGroup avatars={selectedUserAvatars} maxVisible={3} />
            </div>
          )}

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Select Users"
          >
            <div className="space-y-4 h-[60vh] overflow-y-auto">
              {users.length === 0 && (
                <p className="text-gray-500">No users available.</p>
              )}
              {users.map((user: User) => {
                // Get initial or fallback
                const initial =
                  user.name && user.name.trim()
                    ? user.name.charAt(0).toUpperCase()
                    : "U";
                return (
                  <div
                    key={user._id}
                    className="flex items-center gap-4 p-3 border-b border-gray-200"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      {isImageUrl(user.avatar?.url) ? (
                        <img
                          src={user.avatar?.url}
                          alt={user.name || "User"}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-800 text-base font-medium rounded-full">
                          {initial}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 dark:text-white">
                        {user.name || "Unknown"}
                      </p>
                      <p className="text-[13px] text-gray-500">
                        {user.email || "No email"}
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={tempSelectedUsers.includes(user._id)}
                      onChange={() => toggleUserSelection(user._id)}
                      className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm outline-none"
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                className="card-btn"
                onClick={() => setIsModalOpen(false)}
              >
                CANCEL
              </button>
              <button className="card-btn-fill" onClick={handleAssign}>
                DONE
              </button>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default SelectUsers;
