import { LeaderboardUser } from "@/lib/types";

interface TopUsersProps {
  topUsers: LeaderboardUser[];
  currentUserId: number;
}

// Generate initials from a name
const getInitials = (name: string): string => {
  if (!name) return '?';
  
  const nameParts = name.split(' ');
  if (nameParts.length === 1) {
    return nameParts[0].substring(0, 2).toUpperCase();
  }
  
  return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
};

// Generate a consistent color based on user ID
const getAvatarColor = (userId: number): string => {
  const colors = [
    'bg-primary text-white',
    'bg-secondary text-white',
    'bg-accent-dark text-white',
    'bg-green-500 text-white',
    'bg-blue-500 text-white',
    'bg-purple-500 text-white',
    'bg-orange-500 text-white',
    'bg-pink-500 text-white',
  ];
  
  // Get a consistent color based on the user ID
  return colors[userId % colors.length];
};

const TopUsers = ({ topUsers, currentUserId }: TopUsersProps) => {
  if (topUsers.length === 0) {
    return null;
  }

  // Create an array of the top 3 users, or fewer if not available
  const top3 = topUsers.slice(0, Math.min(3, topUsers.length));

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
      {/* 2nd place - if available */}
      {top3.length > 1 && (
        <div className="flex flex-col items-center">
          <div className={`w-16 h-16 rounded-full overflow-hidden border-2 border-accent flex items-center justify-center ${
            top3[1].id === currentUserId ? "ring-2 ring-primary" : ""
          } ${getAvatarColor(top3[1].id)}`}>
            {top3[1].profileImageUrl ? (
              <img
                src={top3[1].profileImageUrl}
                alt={`${top3[1].name}'s avatar`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold">{getInitials(top3[1].name)}</span>
            )}
          </div>
          <div className="flex items-center mt-2">
            <span className="material-icons text-accent">looks_two</span>
            <span className="text-sm font-medium ml-1">
              {top3[1].id === currentUserId ? "You" : top3[1].name.split(' ')[0]}
            </span>
          </div>
          <div className="text-sm text-gray-500">{top3[1].points_total} pts</div>
        </div>
      )}

      {/* 1st place */}
      <div className="flex flex-col items-center">
        <div className={`w-20 h-20 rounded-full overflow-hidden border-4 border-accent flex items-center justify-center ${
          top3[0].id === currentUserId ? "ring-2 ring-primary" : ""
        } ${getAvatarColor(top3[0].id)}`}>
          {top3[0].profileImageUrl ? (
            <img
              src={top3[0].profileImageUrl}
              alt={`${top3[0].name}'s avatar`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xl font-bold">{getInitials(top3[0].name)}</span>
          )}
        </div>
        <div className="flex items-center mt-2">
          <span className="material-icons text-accent">looks_one</span>
          <span className="text-sm font-medium ml-1">
            {top3[0].id === currentUserId ? "You" : top3[0].name.split(' ')[0]}
          </span>
        </div>
        <div className="text-sm text-gray-500">{top3[0].points_total} pts</div>
      </div>

      {/* 3rd place - if available */}
      {top3.length > 2 && (
        <div className="flex flex-col items-center">
          <div className={`w-16 h-16 rounded-full overflow-hidden border-2 border-accent flex items-center justify-center ${
            top3[2].id === currentUserId ? "ring-2 ring-primary" : ""
          } ${getAvatarColor(top3[2].id)}`}>
            {top3[2].profileImageUrl ? (
              <img
                src={top3[2].profileImageUrl}
                alt={`${top3[2].name}'s avatar`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold">{getInitials(top3[2].name)}</span>
            )}
          </div>
          <div className="flex items-center mt-2">
            <span className="material-icons text-accent">looks_3</span>
            <span className="text-sm font-medium ml-1">
              {top3[2].id === currentUserId ? "You" : top3[2].name.split(' ')[0]}
            </span>
          </div>
          <div className="text-sm text-gray-500">{top3[2].points_total} pts</div>
        </div>
      )}
    </div>
  );
};

export default TopUsers;
