// src/components/AvatarGroup.tsx
interface AvatarGroupProps {
  avatars: string[];
  maxVisible?: number;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({ avatars, maxVisible = 3 }) => {
  return (
    <div className="flex items-center">
      {avatars.slice(0, maxVisible).map((avatar, index) => (
        <div
          key={index}
          className="w-9 h-9 rounded-full border-2 border-white -ml-3 first:ml-0"
        >
          {avatar && avatar.match(/^(http|https):\/\//) ? (
            <img
              src={avatar}
              alt={`Avatar ${index}`}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              {avatar || "?"}
            </div>
          )}
        </div>
      ))}
      {avatars.length > maxVisible && (
        <div className="w-9 h-9 flex items-center justify-center bg-blue-50 text-sm font-medium rounded-full border-2 border-white -ml-3">
          +{avatars.length - maxVisible}
        </div>
      )}
    </div>
  );
};

export default AvatarGroup;