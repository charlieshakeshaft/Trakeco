import { LeaderboardUser } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RankingListProps {
  users: LeaderboardUser[];
  currentUserId: number;
  startRank?: number;
  className?: string;
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
    'bg-blue-500 text-white',
    'bg-purple-500 text-white',
    'bg-green-500 text-white',
    'bg-pink-500 text-white',
    'bg-indigo-500 text-white',
    'bg-orange-500 text-white',
    'bg-teal-500 text-white',
    'bg-cyan-500 text-white',
  ];
  
  // Get a consistent color based on the user ID
  return colors[userId % colors.length];
};

// Badge themes based on rank
const getRankBadge = (rank: number, isCurrentUser: boolean) => {
  if (isCurrentUser) {
    return {
      bg: "bg-gradient-to-r from-green-500 to-blue-500",
      textColor: "text-white",
      shadowColor: "shadow-blue-200",
      icon: "person",
      animate: "animate-pulse"
    };
  }
  
  // Top 10
  if (rank <= 10) {
    return {
      bg: "bg-gradient-to-r from-purple-500 to-indigo-600", 
      textColor: "text-white",
      shadowColor: "shadow-purple-200",
      icon: "verified",
      animate: ""
    };
  }
  
  // 11-20
  if (rank <= 20) {
    return {
      bg: "bg-gradient-to-r from-blue-500 to-cyan-500",
      textColor: "text-white", 
      shadowColor: "shadow-blue-100",
      icon: "travel_explore",
      animate: ""
    };
  }
  
  // Default
  return {
    bg: "bg-gradient-to-r from-gray-200 to-gray-300",
    textColor: "text-gray-700",
    shadowColor: "shadow-gray-100",
    icon: "person",
    animate: ""
  };
};

const RankingList = ({ users, currentUserId, startRank = 1, className }: RankingListProps) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No users found in the leaderboard.
      </div>
    );
  }

  return (
    <div className={cn("pt-4 space-y-3", className)}>
      {users.map((user, index) => {
        const rank = startRank + index;
        const isCurrentUser = user.id === currentUserId;
        const rankBadge = getRankBadge(rank, isCurrentUser);
        
        // Calculate streak stars
        const streakStars = user.streak_count && user.streak_count > 0 
          ? Math.min(Math.floor(user.streak_count / 3), 5)
          : 0;
          
        return (
          <div 
            key={user.id} 
            className={cn(
              "flex items-center justify-between p-3 rounded-lg transition-all",
              isCurrentUser 
                ? "bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 shadow-md" 
                : "border border-gray-100 hover:shadow-sm hover:bg-gray-50"
            )}
          >
            <div className="flex items-center gap-3">
              {/* Rank badge */}
              <div 
                className={cn(
                  "w-9 h-9 flex items-center justify-center rounded-lg shadow-sm",
                  rankBadge.bg, rankBadge.textColor, rankBadge.shadowColor, rankBadge.animate
                )}
              >
                {rank}
              </div>
              
              {/* User avatar */}
              <div className={cn(
                "w-10 h-10 rounded-full overflow-hidden border-2",
                isCurrentUser ? "border-blue-300" : "border-gray-200",
                "flex items-center justify-center shadow-sm",
                getAvatarColor(user.id)
              )}>
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={`${user.name}'s avatar`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-base">{getInitials(user.name)}</span>
                )}
              </div>
              
              {/* User info */}
              <div>
                <div className="flex items-center gap-1">
                  <span className={cn(
                    "font-medium",
                    isCurrentUser ? "text-blue-800" : "text-gray-800"
                  )}>
                    {isCurrentUser ? "You" : user.name}
                  </span>
                  {isCurrentUser && (
                    <span className="material-icons text-blue-500 text-sm">verified</span>
                  )}
                </div>
                
                {/* Streak visualization */}
                {streakStars > 0 && (
                  <div className="flex items-center text-amber-500">
                    {[...Array(streakStars)].map((_, i) => (
                      <span key={i} className="material-icons text-xs">star</span>
                    ))}
                    <span className="text-xs text-gray-500 ml-1">
                      {user.streak_count} day streak
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Score display */}
            <div className="flex flex-col items-end">
              <div className={cn(
                "text-sm font-semibold px-3 py-1 rounded-full",
                isCurrentUser 
                  ? "bg-gradient-to-r from-blue-100 to-green-100 text-blue-800"
                  : "bg-gray-100 text-gray-700"
              )}>
                {user.points_total} pts
              </div>
              
              {/* Only show commute icons if we know the user's commutes */}
              {user.id === currentUserId && (
                <div className="flex mt-1">
                  <span className="material-icons text-green-500 text-xs">
                    directions_bike
                  </span>
                  <span className="material-icons text-blue-500 text-xs">
                    directions_transit
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RankingList;
