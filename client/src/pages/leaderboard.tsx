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
  
  // Fetch user stats for streak and points information
  const { data: stats } = useQuery<UserStats>({
    queryKey: [`/api/user/stats?userId=${userId}`],
    staleTime: 60000, // 1 minute
  });
  
  // Get today's date for display
  const today = format(new Date(), 'EEEE');
  
  // Check if user has logged any commutes this week
  const hasCommuteThisWeek = currentCommutes && currentCommutes.length > 0;
  
  // Get top 3 users for the podium display
  const topThree = leaderboard ? leaderboard.slice(0, 3) : [];
  
  // Get remaining users for the list (excluding top 3)
  const otherUsers = leaderboard ? leaderboard.slice(3) : [];
  
  // Find the current user's rank
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
              <SelectValue placeholder="Select time" />
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
      
      {/* Motivational action card - personalized to the user's current situation */}
      {user && (
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
                    <p className="text-blue-700 mb-3">
                      You've logged commutes this week - keep going to start a streak and earn bonus points!
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-semibold text-blue-800 mb-2">
                      🔥 {stats?.streak}-day streak! Keep it going!
                    </h3>
                    <p className="text-blue-700 mb-3">
                      Amazing work! You're on a {stats?.streak}-day streak. Log today's commute to keep climbing the ranks!
                    </p>
                  </div>
                )}
                
                {/* Current rank and next rank status */}
                {leaderboard && leaderboard.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <div className="bg-white px-3 py-1 rounded-full border border-blue-200 flex items-center">
                      <span className="text-blue-700 font-medium text-sm mr-1">Current Rank:</span>
                      <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-full",
                        currentUserRank <= 3 ? "bg-yellow-100 text-yellow-800" : 
                        currentUserRank <= 10 ? "bg-purple-100 text-purple-800" : 
                        "bg-gray-100 text-gray-800"
                      )}>
                        {currentUserRank === 1 ? "🥇 Gold" : 
                         currentUserRank === 2 ? "🥈 Silver" : 
                         currentUserRank === 3 ? "🥉 Bronze" : 
                         currentUserRank <= 5 ? "Elite" :
                         currentUserRank <= 10 ? "Challenger" : "Explorer"}
                      </span>
                    </div>
                    
                    {currentUserRank > 1 && (
                      <div className="text-sm text-blue-600 flex items-center">
                        <span className="material-icons text-blue-500 text-sm mr-1">arrow_upward</span>
                        <span>
                          {leaderboard[currentUserRank - 2]?.points_total - (stats?.points || 0) > 0 ? (
                            <>
                              <span className="font-medium">{leaderboard[currentUserRank - 2]?.points_total - (stats?.points || 0)} more points</span> to rank up!
                            </>
                          ) : (
                            <>Tied for higher rank - keep adding points!</>  
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3">
                <Link to="/log-commute">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <span className="material-icons mr-1 text-sm">directions_bike</span>
                    Log Today's Commute
                  </Button>
                </Link>
                
                <Link to="/challenges">
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                    <span className="material-icons mr-1 text-sm">emoji_events</span>
                    View Challenges
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-700 flex items-center">
            <span className="material-icons text-accent mr-2">emoji_events</span>
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <>
              {/* Top user */}
              {leaderboard && leaderboard.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div className={cn(
                        "w-20 h-20 rounded-full border-4 border-yellow-400 flex items-center justify-center shadow-lg",
                        getAvatarColor(leaderboard[0].id)
                      )}>
                        {leaderboard[0].profileImageUrl ? (
                          <img
                            src={leaderboard[0].profileImageUrl}
                            alt={`${leaderboard[0].name}'s avatar`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold">
                            {getInitials(leaderboard[0].name)}
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
                      {leaderboard[0].id === userId ? "You" : leaderboard[0].name}
                    </h3>
                    <div className="flex justify-center items-center gap-2 text-gray-600">
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                        {leaderboard[0].points_total} points
                      </span>
                      
                      {leaderboard[0].streak_count > 0 && (
                        <span className="bg-amber-100 text-amber-800 flex items-center px-3 py-1 rounded-full text-sm">
                          <span className="material-icons text-amber-500 text-xs mr-1">local_fire_department</span>
                          {leaderboard[0].streak_count} day streak
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* All users in a ranked list */}
              {leaderboard && leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map((user, index) => {
                    const rank = index + 1;
                    const isCurrentUser = user.id === userId;
                    
                    // Skip the first user since they're already displayed as top user
                    if (rank === 1) return null;
                    
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
                            {user.streak_count > 0 && (
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
                </div>
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
              
              {/* Your rank card */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* User current rank */}
                <div className="p-4 rounded-lg border border-gray-200 bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800 mb-1 flex items-center">
                        <span className="material-icons text-primary mr-2">military_tech</span>
                        Your Current Rank
                      </h3>
                      
                      {stats && (
                        <>
                          <div className="flex items-center gap-2 mt-3">
                            <div className={cn(
                              "w-12 h-12 rounded-full flex items-center justify-center shadow-sm",
                              getUserRankTier(stats.points).color
                            )}>
                              <span className="material-icons">{getUserRankTier(stats.points).icon}</span>
                            </div>
                            
                            <div>
                              <div className="text-lg font-semibold">{getUserRankTier(stats.points).name}</div>
                              <div className="text-xs text-gray-500">
                                {stats.points} / {getUserRankTier(stats.points).maxPoints < Infinity 
                                  ? getUserRankTier(stats.points).maxPoints
                                  : "∞"} points
                              </div>
                            </div>
                          </div>
                          
                          {/* Progress bar */}
                          {getUserRankTier(stats.points).maxPoints < Infinity && (
                            <div className="mt-3">
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ 
                                    width: `${Math.min(100, (stats.points - getUserRankTier(stats.points).minPoints) / 
                                      (getUserRankTier(stats.points).maxPoints - getUserRankTier(stats.points).minPoints) * 100)}%` 
                                  }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500 flex justify-between">
                                <span>{getUserRankTier(stats.points).minPoints}</span>
                                <span>
                                  {stats.points < getUserRankTier(stats.points).maxPoints ? (
                                    <span>
                                      {getUserRankTier(stats.points).maxPoints - stats.points} more points to {
                                        getRankTiers().find(tier => tier.minPoints > getUserRankTier(stats.points).maxPoints)?.name || "MAX"
                                      }
                                    </span>
                                  ) : (
                                    <span>MAX RANK!</span>
                                  )}
                                </span>
                                <span>{getUserRankTier(stats.points).maxPoints}</span>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    {/* View all ranks button */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-xs">
                          <span className="material-icons text-sm mr-1">visibility</span>
                          All Ranks
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Rank Tiers</DialogTitle>
                          <DialogDescription>
                            Earn points from your sustainable commutes to level up your rank
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
                
                {/* Points information */}
                <div className="p-4 bg-green-50 rounded-lg text-green-800">
                  <div className="flex items-center mb-2">
                    <span className="material-icons text-primary mr-2">insights</span>
                    <h3 className="font-medium">How Points Are Calculated</h3>
                  </div>
                  <ul className="text-xs space-y-1 ml-6 list-disc">
                    <li>Walking: 30 points per day</li>
                    <li>Cycling: 25 points per day</li>
                    <li>Public Transit: 20 points per day</li>
                    <li>Carpooling: 15 points per day</li>
                    <li>Remote Work: 15 points per day</li>
                    <li>Electric Vehicle: 10 points per day</li>
                    <li>Bonus: +25 points for 3+ days per week</li>
                    <li>Weekly Challenge: +50-100 bonus points</li>
                  </ul>
                  
                  <div className="flex justify-between mt-3 text-xs">
                    <div>
                      <div className="font-medium text-green-800">Potential Weekly:</div>
                      <div className="mt-1">150-250 points</div>
                    </div>
                    <div>
                      <div className="font-medium text-green-800">Potential Monthly:</div>
                      <div className="mt-1">600-1000 points</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;
