import { LeaderboardUser } from "@/lib/types";
import { cn } from "@/lib/utils";

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

// Badge mapping for top 3 positions
const positionBadges = {
  1: {
    icon: 'emoji_events',
    gradient: 'from-yellow-300 to-yellow-500', 
    podiumHeight: 'h-24',
    label: '1st'
  },
  2: { 
    icon: 'workspace_premium',
    gradient: 'from-gray-300 to-gray-400',
    podiumHeight: 'h-16',
    label: '2nd'
  },
  3: { 
    icon: 'military_tech',
    gradient: 'from-amber-600 to-amber-700', 
    podiumHeight: 'h-12',
    label: '3rd'
  }
};

const TopUsers = ({ topUsers, currentUserId }: TopUsersProps) => {
  if (topUsers.length === 0) {
    return null;
  }

  // Create an array of the top 3 users, or fewer if not available
  const top3 = topUsers.slice(0, Math.min(3, topUsers.length));

  // Sort positions with 1st in the middle, 2nd on the left, 3rd on the right
  const podiumPositions = [
    { position: 2, user: top3.length > 1 ? top3[1] : null },
    { position: 1, user: top3[0] },
    { position: 3, user: top3.length > 2 ? top3[2] : null }
  ];
  
  return (
    <div className="flex flex-col mb-10">
      {/* Podium visualization */}
      <div className="flex justify-center items-end mx-auto w-full max-w-lg mb-8">
        {/* Create a wrapper for podium alignment */}
        <div className="flex items-end">
          {podiumPositions.map(({ position, user }) => {
            if (!user) return <div key={`empty-${position}`} className="w-28" />;
            
            const badge = positionBadges[position as keyof typeof positionBadges];
            const isCurrentUser = user.id === currentUserId;
            
            return (
              <div 
                key={user.id} 
                className={cn(
                  "flex flex-col items-center transition-all mx-1",
                  isCurrentUser ? "scale-105" : "",
                  position === 1 ? "order-2 mb-0" : position === 2 ? "order-1 mb-8" : "order-3 mb-12"
                )}
              >
                {/* User avatar */}
                <div className="mb-2 relative">
                  {/* Badge icon */}
                  <div className={cn(
                    "absolute -top-4 -right-4 w-8 h-8 rounded-full flex items-center justify-center",
                    `bg-gradient-to-br ${badge.gradient}`
                  )}>
                    <span className="material-icons text-white text-sm">{badge.icon}</span>
                  </div>
                  
                  {/* User image/initials */}
                  <div className={cn(
                    "rounded-full overflow-hidden",
                    "animate-[bounce_3s_ease-in-out_infinite]",
                    position === 1 ? "w-20 h-20 border-4" : "w-16 h-16 border-2",
                    isCurrentUser 
                      ? "ring-2 ring-primary border-yellow-400" 
                      : position === 1 
                        ? "border-yellow-400"
                        : position === 2
                          ? "border-gray-300"
                          : "border-amber-600",
                    "flex items-center justify-center shadow-lg",
                    getAvatarColor(user.id)
                  )}>
                    {user.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt={`${user.name}'s avatar`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className={cn(
                        "font-bold",
                        position === 1 ? "text-2xl" : "text-xl"
                      )}>
                        {getInitials(user.name)}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* User name */}
                <div className={cn(
                  "font-medium text-center",
                  isCurrentUser ? "text-primary" : "text-gray-800",
                  position === 1 ? "text-base" : "text-sm"
                )}>
                  {user.id === currentUserId ? "You" : user.name.split(' ')[0]}
                </div>
                
                {/* Points display with animated wrapper */}
                <div className={cn(
                  "flex items-center mt-1 px-3 py-1 rounded-full",
                  position === 1 
                    ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800" 
                    : position === 2
                      ? "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700"
                      : "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800"
                )}>
                  <span className="material-icons text-xs mr-1">
                    {position === 1 ? "star" : "star_half"}
                  </span>
                  <span className={cn(
                    "font-semibold",
                    position === 1 ? "text-sm" : "text-xs"
                  )}>
                    {user.points_total} pts
                  </span>
                </div>
                
                {/* Podium visualization */}
                <div className={cn(
                  "mt-2 w-24 rounded-t-lg flex justify-center items-end",
                  position === 1 ? "h-24" : position === 2 ? "h-16" : "h-12",
                  position === 1 
                    ? "bg-gradient-to-b from-yellow-300 to-yellow-400" 
                    : position === 2
                      ? "bg-gradient-to-b from-gray-300 to-gray-400"
                      : "bg-gradient-to-b from-amber-600 to-amber-700"
                )}>
                  <div className="text-white font-bold text-sm mb-1">
                    {badge.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TopUsers;
