import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface LeaderboardSectionProps {
  userId: number;
}

interface LeaderboardUser {
  id: number;
  name: string;
  points_total: number;
  streak_count?: number;
  profileImageUrl?: string;
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

// Get user rank tier based on points
interface RankTier {
  name: string;
  color: string;
  minPoints: number;
  maxPoints: number;
  icon: string;
}

const getRankTiers = (): RankTier[] => {
  return [
    { 
      name: 'Bronze',
      color: 'bg-amber-600 text-white',
      minPoints: 0,
      maxPoints: 499,
      icon: 'workspace_premium'
    },
    { 
      name: 'Silver',
      color: 'bg-gray-400 text-white',
      minPoints: 500,
      maxPoints: 999,
      icon: 'workspace_premium'
    },
    { 
      name: 'Gold',
      color: 'bg-yellow-500 text-white',
      minPoints: 1000,
      maxPoints: 1999,
      icon: 'emoji_events'
    },
    { 
      name: 'Platinum',
      color: 'bg-blue-600 text-white',
      minPoints: 2000,
      maxPoints: 2999,
      icon: 'military_tech'
    },
    { 
      name: 'Elite',
      color: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
      minPoints: 3000,
      maxPoints: Infinity,
      icon: 'star'
    }
  ];
};

const getUserRankTier = (points: number): RankTier => {
  const tiers = getRankTiers();
  return tiers.find(tier => points >= tier.minPoints && points <= tier.maxPoints) || tiers[0];
};

const LeaderboardSection = ({ userId }: LeaderboardSectionProps) => {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: [`/api/leaderboard?userId=${userId}`],
    staleTime: 60000, // 1 minute
  });
  
  // Get user profile to check role
  const { data: userProfile } = useQuery<{id: number, role?: string, company_id?: number}>({
    queryKey: [`/api/user/profile?userId=${userId}`]
  });
  
  const isAdmin = userProfile?.role === 'admin';

  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Leaderboard</h2>
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 animate-pulse">
          <div className="h-60"></div>
        </div>
      </section>
    );
  }

  const leaderboardUsers: LeaderboardUser[] = Array.isArray(leaderboard) ? leaderboard : [];
  
  // Find top 3 users
  const topThree = leaderboardUsers.slice(0, 3);
  
  // Find the current user's position
  const currentUserIndex = leaderboardUsers.findIndex(user => user.id === userId);
  const currentUserRank = currentUserIndex + 1;
  
  // Get users around the current user (exclude top 3)
  const otherUsers = leaderboardUsers.slice(3);

  // This section has been moved to a separate component

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Leaderboard</h2>
        <Link to="/leaderboard">
          <Button variant="ghost" size="sm" className="text-sm">
            View Full Leaderboard
            <span className="material-icons text-sm ml-1">arrow_forward</span>
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <>
              {leaderboardUsers.length === 0 ? (
                <div className="text-center py-6">
                  <span className="material-icons text-gray-400 text-4xl mb-2">leaderboard</span>
                  <h3 className="text-lg font-medium text-gray-700 mb-1">No Leaderboard Data</h3>
                  <p className="text-gray-500 mb-4">
                    You're the only member in your company right now.
                  </p>
                  {isAdmin && (
                    <Link to="/company?tab=members">
                      <Button className="inline-flex items-center">
                        <span className="material-icons text-sm mr-1">person_add</span>
                        Invite Team Members
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  {/* Top user */}
                  {leaderboardUsers.length > 0 && (
                    <div className="mb-6">
                      <div className="flex justify-center mb-4">
                        <div className="relative">
                          <div className={cn(
                            "w-20 h-20 rounded-full border-4 border-yellow-400 flex items-center justify-center shadow-lg",
                            getAvatarColor(leaderboardUsers[0].id)
                          )}>
                            {leaderboardUsers[0].profileImageUrl ? (
                              <img
                                src={leaderboardUsers[0].profileImageUrl}
                                alt={`${leaderboardUsers[0].name}'s avatar`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-2xl font-bold">
                                {getInitials(leaderboardUsers[0].name)}
                              </span>
                            )}
                          </div>
                          <div className="absolute -top-2 -right-2 bg-yellow-400 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                            <span className="material-icons text-sm">emoji_events</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <h3 className="font-medium text-lg">
                          {leaderboardUsers[0].id === userId ? "You" : leaderboardUsers[0].name}
                        </h3>
                        <div className="flex justify-center items-center gap-2 text-gray-600">
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                            {leaderboardUsers[0].points_total} points
                          </span>
                          
                          {leaderboardUsers[0].streak_count && leaderboardUsers[0].streak_count > 0 && (
                            <span className="bg-amber-100 text-amber-800 flex items-center px-3 py-1 rounded-full text-sm">
                              <span className="material-icons text-amber-500 text-xs mr-1">local_fire_department</span>
                              {leaderboardUsers[0].streak_count} day streak
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* All users in a ranked list */}
                  {leaderboardUsers.length > 0 && (
                    <div className="space-y-3">
                      {leaderboardUsers.slice(1, 5).map((user, index) => {
                        const rank = index + 2; // Start from rank 2 since we already showed the top user
                        const isCurrentUser = user.id === userId;
                        
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
                              {/* Rank number */}
                              <div className={cn(
                                "w-8 h-8 flex items-center justify-center rounded-full shadow-sm",
                                rank === 2 
                                  ? "bg-gradient-to-r from-gray-300 to-gray-400 text-white"
                                  : rank === 3
                                    ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white"
                                    : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700"
                              )}>
                                {rank}
                              </div>
                              
                              {/* User avatar */}
                              <div className={cn(
                                "w-10 h-10 rounded-full overflow-hidden border-2",
                                rank === 2 
                                  ? "border-gray-300" 
                                  : rank === 3 
                                    ? "border-amber-500"
                                    : "border-gray-200",
                                "flex items-center justify-center",
                                getAvatarColor(user.id)
                              )}>
                                {user.profileImageUrl ? (
                                  <img
                                    src={user.profileImageUrl}
                                    alt={`${user.name}'s avatar`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-base font-bold">{getInitials(user.name)}</span>
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
                                {user.streak_count && user.streak_count > 0 && (
                                  <div className="flex items-center text-amber-500">
                                    <span className="material-icons text-xs">local_fire_department</span>
                                    <span className="text-xs text-gray-500 ml-1">
                                      {user.streak_count} day streak
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Points */}
                            <div className={cn(
                              "text-sm font-semibold px-3 py-1 rounded-full",
                              isCurrentUser 
                                ? "bg-gradient-to-r from-blue-100 to-green-100 text-blue-800"
                                : rank === 2
                                  ? "bg-gray-100 text-gray-700"
                                  : rank === 3
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-gray-100 text-gray-700"
                            )}>
                              {user.points_total} pts
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Display current user if not in top 5 */}
                      {currentUserIndex >= 5 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div 
                            className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 shadow-md"
                          >
                            <div className="flex items-center gap-3">
                              {/* Rank number */}
                              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 shadow-sm">
                                {currentUserRank}
                              </div>
                              
                              {/* User avatar */}
                              <div className={cn(
                                "w-10 h-10 rounded-full overflow-hidden border-2 border-blue-300 flex items-center justify-center",
                                getAvatarColor(userId)
                              )}>
                                {leaderboardUsers[currentUserIndex]?.profileImageUrl ? (
                                  <img
                                    src={leaderboardUsers[currentUserIndex].profileImageUrl}
                                    alt="Your avatar"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-base font-bold">
                                    {getInitials(leaderboardUsers[currentUserIndex]?.name || "You")}
                                  </span>
                                )}
                              </div>
                              
                              {/* User info */}
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="font-medium text-blue-800">
                                    You
                                  </span>
                                  <span className="material-icons text-blue-500 text-sm">verified</span>
                                </div>
                                
                                {/* Streak visualization */}
                                {leaderboardUsers[currentUserIndex]?.streak_count && leaderboardUsers[currentUserIndex].streak_count > 0 && (
                                  <div className="flex items-center text-amber-500">
                                    <span className="material-icons text-xs">local_fire_department</span>
                                    <span className="text-xs text-gray-500 ml-1">
                                      {leaderboardUsers[currentUserIndex].streak_count} day streak
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Points */}
                            <div className="text-sm font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-green-100 text-blue-800">
                              {leaderboardUsers[currentUserIndex]?.points_total} pts
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                    
                  {/* Removed rank card - it's now a separate component */}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default LeaderboardSection;
