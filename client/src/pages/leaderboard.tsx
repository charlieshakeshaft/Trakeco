import { useState } from "react";
import { useLeaderboard, findUserRank, useUserProfile } from "@/hooks/use-leaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import TopUsers from "@/components/leaderboard/top-users";
import RankingList from "@/components/leaderboard/ranking-list";
import { useAuth } from "@/contexts/auth-context";
import { useCurrentWeekCommuteLogs } from "@/hooks/use-commute";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

const getNextRankTier = (points: number): RankTier => {
  const allTiers = getRankTiers();
  const currentTier = getUserRankTier(points);
  const currentTierIndex = allTiers.findIndex(tier => tier.name === currentTier.name);
  
  // If we're at the highest tier, just return the current one
  if (currentTierIndex === allTiers.length - 1) {
    return currentTier;
  }
  
  // Otherwise return the next tier
  return allTiers[currentTierIndex + 1];
};

const Leaderboard = () => {
  const [timeFrame, setTimeFrame] = useState("month");
  const { user } = useAuth();
  const userId = user?.id || 0;
  
  const { data: leaderboard, isLoading } = useLeaderboard(userId, 20);
  const { data: userProfile } = useUserProfile(userId);
  const { data: currentCommutes } = useCurrentWeekCommuteLogs(userId);
  
  // Define the user stats type
  interface UserStats {
    streak: number;
    points: number;
    co2_saved: number;
    completed_challenges: number;
  }
  
  // Retrieve user stats
  const { data: stats } = useQuery<UserStats>({
    queryKey: [`/api/user/stats?userId=${userId}`],
    staleTime: 60000, // 1 minute
  });
  
  // Get the current day of week for the message
  const today = format(new Date(), 'EEEE');
  
  // Check if user has any commutes logged for the current week
  const hasCommuteThisWeek = currentCommutes && currentCommutes.length > 0;
  
  // For displaying ranks beyond the top 3
  const otherUsers = leaderboard ? leaderboard.slice(3, 7) : [];
  
  // Find the current user's position in the leaderboard
  const currentUserRank = leaderboard ? findUserRank(leaderboard, userId) : -1;
  
  // Check if current user is not in the top displayed users
  const isUserOutsideDisplayed = currentUserRank > 3 + otherUsers.length;
  
  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4 md:mb-0">Leaderboard</h1>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2">Time Frame:</span>
          <Select 
            value={timeFrame} 
            onValueChange={setTimeFrame}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="This Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6">
        {/* Motivational Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="md:flex-1">
                {!hasCommuteThisWeek ? (
                  <div>
                    <h3 className="text-xl font-semibold text-blue-800 mb-2">
                      🚲 No commutes logged this week yet!
                    </h3>
                    <p className="text-blue-700 mb-3">
                      Happy {today}! Log your sustainable commute for today and start climbing the leaderboard!
                    </p>
                  </div>
                ) : stats?.streak === 0 ? (
                  <div>
                    <h3 className="text-xl font-semibold text-blue-800 mb-2">
                      🔥 Start a new streak today!
                    </h3>
                    <p className="text-blue-700">
                      Great job logging your commute! Continue throughout the week to start a streak.
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-semibold text-blue-800 mb-2">
                      🔥 Your streak: {stats?.streak} days!
                    </h3>
                    <p className="text-blue-700">
                      Amazing work! Keep logging your sustainable commutes to maintain your streak and climb the ranks.
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <Link to="/log-commute">
                  <Button className="w-full md:w-auto">
                    <span className="material-icons mr-2 text-sm">directions_bike</span>
                    Log Today's Commute
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* User Rank Section - Moved OUTSIDE the leaderboard section */}
        {stats && (
          <div className="mb-6">
            <h2 className="text-xl font-medium text-gray-800 mb-3 flex items-center">
              <span className="material-icons text-primary mr-2">military_tech</span>
              Your Rank Progress
            </h2>
            
            <div className="p-5 rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center shadow-sm",
                  getUserRankTier(stats.points).color
                )}>
                  <span className="material-icons text-xl">{getUserRankTier(stats.points).icon}</span>
                </div>
                
                <div className="flex-1">
                  <div className="text-xl font-semibold">{getUserRankTier(stats.points).name} Rank</div>
                  <div className="text-sm text-gray-600">
                    You have {stats.points} points total
                  </div>
                  
                  {/* Progress bar */}
                  {getUserRankTier(stats.points).maxPoints < Infinity && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ 
                            width: `${Math.min(100, (stats.points - getUserRankTier(stats.points).minPoints) / 
                              (getUserRankTier(stats.points).maxPoints - getUserRankTier(stats.points).minPoints) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{getUserRankTier(stats.points).minPoints} pts</span>
                        {stats.points < getUserRankTier(stats.points).maxPoints && (
                          <span className="text-center text-primary font-medium">
                            {getUserRankTier(stats.points).maxPoints - stats.points} more to {
                              getNextRankTier(stats.points).name
                            }
                          </span>
                        )}
                        <span>{getUserRankTier(stats.points).maxPoints} pts</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <span className="material-icons text-sm mr-1">visibility</span>
                      All Ranks
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rank Tiers</DialogTitle>
                      <DialogDescription>
                        Earn points by tracking your commutes to progress through ranks
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-3 mt-2">
                      {getRankTiers().map((tier, index) => (
                        <div 
                          key={tier.name} 
                          className={cn(
                            "flex items-center p-3 rounded-lg border",
                            stats && getUserRankTier(stats.points).name === tier.name
                              ? "border-primary bg-primary/5"
                              : "border-gray-200"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center mr-3",
                            tier.color
                          )}>
                            <span className="material-icons">{tier.icon}</span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="font-medium">{tier.name}</div>
                            <div className="text-xs text-gray-500">
                              {tier.minPoints} - {tier.maxPoints < Infinity 
                                ? tier.maxPoints 
                                : "∞"} points
                            </div>
                          </div>
                          
                          {stats && getUserRankTier(stats.points).name === tier.name && (
                            <div className="bg-primary/20 text-primary text-xs font-medium px-2 py-1 rounded">
                              Current
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        )}
        
        {/* Leaderboard Section */}
        <div>
          <h2 className="text-xl font-medium text-gray-800 mb-3">
            Top Performers
          </h2>
          
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : leaderboard && leaderboard.length > 0 ? (
                <>
                  <TopUsers topUsers={leaderboard.slice(0, 3)} currentUserId={user?.id || 0} />
                  <RankingList 
                    users={leaderboard} 
                    currentUserId={user?.id || 0}
                    className="mt-6"
                  />
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <span className="material-icons text-gray-400">people</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Leaderboard Data</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    There's no leaderboard data available yet. Start logging your sustainable commutes to appear on the leaderboard!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;