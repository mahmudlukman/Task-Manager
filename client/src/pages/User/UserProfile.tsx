import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector";
import Input from "../../components/Inputs/Input";
import { useUpdateUserMutation } from "../../redux/features/user/userApi";
import { useLoadUserQuery } from "../../redux/features/api/apiSlice";

const UserProfile = () => {
  // Get current user data
  const { data: userData, isLoading: isLoadingUser } = useLoadUserQuery({
    userId: "me",
  });

  // Initialize state
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [fullName, setFullName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

  // Update user mutation
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  // Set initial values when user data is loaded
  useEffect(() => {
    if (userData?.user) {
      setFullName(userData.user.name || "");
      // Store the current avatar URL
      if (userData.user.avatar?.url) {
        setAvatar(userData.user.avatar.url);
      }
    }
  }, [userData]);

  // Convert image file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result as string);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Prepare update data
      const updateData: { name?: string; avatar?: string } = {};

      // Only include name if it's different from current name
      if (fullName !== userData?.user?.name) {
        updateData.name = fullName;
      }

      // Handle avatar update if a new image is selected
      if (profilePic) {
        const base64 = await convertToBase64(profilePic);
        updateData.avatar = base64;
      }

      // Only proceed if there are changes to update
      if (Object.keys(updateData).length === 0) {
        toast.error("No changes to update");
        return;
      }

      // Call the update mutation
      const result = await updateUser({ data: updateData });
      
      // Check if the response has an error property 
      // RTK Query sets this when the request fails
      if ('error' in result) {
        toast.error("Failed to update profile");
        console.error("Update failed:", result.error);
      } else if (result.data?.success) {
        toast.success("Profile updated successfully");
        // Reset the profilePic state since it's already uploaded
        setProfilePic(null);
      }
    } catch (error) {
      // This will catch any errors that happen during the try block
      // but before the API call (like in convertToBase64)
      console.error("Error in profile update:", error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <DashboardLayout activeMenu="My Profile">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <h2 className="text-xl md:text-xl font-medium">My Profile</h2>
        </div>

        <div className="lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center">
          <p className="text-xs text-slate-700 mt-[5px] mb-6">
            Update Your Profile
          </p>

          {isLoadingUser ? (
            <div className="flex justify-center py-10">
              <p>Loading profile data...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <ProfilePhotoSelector
                image={profilePic}
                setImage={setProfilePic}
                currentImageUrl={avatar}
                editMode={true}
              />

              <div className="mb-6">
                <Input
                  value={fullName}
                  onChange={({ target }) => setFullName(target.value)}
                  label="Full Name"
                  placeholder="Enter your full name"
                  type="text"
                />
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className={`px-6 py-2 rounded-md text-white ${
                    isUpdating ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  } transition-colors w-full sm:w-auto`}
                >
                  {isUpdating ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;