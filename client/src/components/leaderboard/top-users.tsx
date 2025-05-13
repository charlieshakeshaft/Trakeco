import { LeaderboardUser } from "@/lib/types";

interface TopUsersProps {
  topUsers: LeaderboardUser[];
  currentUserId: number;
}

const TopUsers = ({ topUsers, currentUserId }: TopUsersProps) => {
  if (topUsers.length === 0) {
    return null;
  }

  // Create an array of the top 3 users, or fewer if not available
  const top3 = topUsers.slice(0, Math.min(3, topUsers.length));
  
  // Random avatar images for demonstration
  const avatarUrls = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
  ];

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
      {/* 2nd place - if available */}
      {top3.length > 1 && (
        <div className="flex flex-col items-center">
          <div className={`w-16 h-16 rounded-full overflow-hidden border-2 border-accent ${
            top3[1].id === currentUserId ? "ring-2 ring-primary" : ""
          }`}>
            <img
              src={avatarUrls[1]}
              alt={`${top3[1].name}'s avatar`}
              className="w-full h-full object-cover"
            />
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
        <div className={`w-20 h-20 rounded-full overflow-hidden border-4 border-accent ${
          top3[0].id === currentUserId ? "ring-2 ring-primary" : ""
        }`}>
          <img
            src={avatarUrls[0]}
            alt={`${top3[0].name}'s avatar`}
            className="w-full h-full object-cover"
          />
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
          <div className={`w-16 h-16 rounded-full overflow-hidden border-2 border-accent ${
            top3[2].id === currentUserId ? "ring-2 ring-primary" : ""
          }`}>
            <img
              src={avatarUrls[2]}
              alt={`${top3[2].name}'s avatar`}
              className="w-full h-full object-cover"
            />
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
