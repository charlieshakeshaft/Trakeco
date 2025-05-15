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
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse space-y-6">
              <div className="flex justify-center space-x-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mb-2"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 w-12 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {topThree.length > 0 && (
                <TopUsers topUsers={topThree} currentUserId={userId} />
              )}
              
              {otherUsers.length > 0 && (
                <RankingList users={otherUsers} currentUserId={userId} startRank={4} />
              )}
              
              {/* Display current user if they're not in the displayed list */}
              {isUserOutsideDisplayed && currentUserRank > 0 && leaderboard && (
                <div className="mt-6 pt-6 border-t border-dashed border-gray-200">
                  <div className="text-sm text-gray-500 mb-2 text-center">Your Position</div>
                  <RankingList 
                    users={[leaderboard.find(user => user.id === userId)!]} 
                    currentUserId={userId} 
                    startRank={currentUserRank} 
                  />
                </div>
              )}
              
              {leaderboard && leaderboard.length === 0 && (
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
            </>
          )}
          
          {/* Weekly competition card */}
          <div className="mt-8 mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-5 border border-blue-100 shadow-sm">
            <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
              <span className="material-icons text-blue-600 mr-2">event</span>
              Weekly Activity Competition
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Most active days */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                  <span className="material-icons text-blue-500 text-sm mr-1">today</span>
                  Commute Activity Pattern
                </h4>
                <div className="flex justify-between items-end h-20">
                  {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, i) => {
                    // Heights for a typical active week pattern
                    // Could be replaced with actual data from the backend in the future
                    const heights = [
                      "h-8", // Monday
                      "h-12", // Tuesday
                      "h-16", // Wednesday (highest)
                      "h-10", // Thursday
                      "h-6"  // Friday
                    ];
                    
                    return (
                      <div key={day} className="flex flex-col items-center">
                        <div className={`w-8 ${heights[i]} rounded-t-sm ${
                          i === 2 ? "bg-blue-500" : i === 1 || i === 3 ? "bg-blue-400" : "bg-blue-300"
                        }`}></div>
                        <span className="text-xs text-gray-600 mt-1">{day}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  <span className="font-medium">Typical pattern:</span> Mid-week has highest participation
                </p>
              </div>
              
              {/* Weekly leaderboard highlights */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                  <span className="material-icons text-blue-500 text-sm mr-1">emoji_events</span>
                  Weekly Highlights
                </h4>
                <ul className="text-xs space-y-2">
                  {leaderboard && leaderboard.length > 0 ? (
                    <>
                      <li className="flex items-center text-green-700">
                        <span className="material-icons text-green-500 text-sm mr-1">trending_up</span>
                        <strong className="mr-1">{leaderboard[0].name.split(' ')[0]}</strong> 
                        <span>is at the top of the leaderboard</span>
                      </li>
                      
                      {Math.max(...leaderboard.map(user => user.streak_count || 0)) > 0 ? (
                        <li className="flex items-center text-amber-700">
                          <span className="material-icons text-amber-500 text-sm mr-1">local_fire_department</span>
                          <strong className="mr-1">
                            {leaderboard.find(u => Math.max(...leaderboard.map(user => user.streak_count || 0)) === (u.streak_count || 0))?.name.split(' ')[0] || 'Someone'}
                          </strong>
                          <span>has the longest streak ({Math.max(...leaderboard.map(user => user.streak_count || 0))} days)</span>
                        </li>
                      ) : (
                        <li className="flex items-center text-amber-700">
                          <span className="material-icons text-amber-500 text-sm mr-1">local_fire_department</span>
                          <span>No active streaks - be the first to start one!</span>
                        </li>
                      )}
                      
                      <li className="flex items-center text-blue-700">
                        <span className="material-icons text-blue-500 text-sm mr-1">thumb_up</span>
                        <span>Next milestone: <strong>5 sustainable commutes</strong></span>
                      </li>
                    </>
                  ) : (
                    <li className="text-gray-500">Start logging commutes to see weekly highlights!</li>
                  )}
                </ul>
              </div>
              
              {/* Weekly challenge - dynamically select from available challenges */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100 relative overflow-hidden">
                {/* Background icon - changes based on the challenge type */}
                <div className="absolute -right-8 -bottom-8 opacity-10">
                  <span className="material-icons text-8xl text-blue-500">
                    {stats?.streak === 0 ? "pedal_bike" : "local_fire_department"}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                  <span className="material-icons text-blue-500 text-sm mr-1">stars</span>
                  Weekly Challenge
                </h4>
                
                {/* Dynamic challenge based on user stats */}
                {stats?.streak === 0 ? (
                  <>
                    <p className="text-sm font-medium text-blue-900 mb-2">
                      Start a 3-day commute streak!
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${hasCommuteThisWeek ? 33 : 0}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-600">
                      {hasCommuteThisWeek ? "1/3 completed" : "0/3 completed"} • 50 bonus points
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-blue-900 mb-2">
                      Try a new sustainable commute type!
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                    <p className="text-xs text-gray-600">
                      0/1 completed • 75 bonus points
                    </p>
                  </>
                )}
                
                <Link to="/log-commute" className="inline-block text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium">
                  Log commute →
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg text-green-800">
              <div className="flex items-center mb-2">
                <span className="material-icons text-primary mr-2">insights</span>
                <h3 className="font-medium">How Points Are Calculated</h3>
              </div>
              <ul className="text-sm space-y-1 ml-6 list-disc">
                <li>Walking: 30 points per day</li>
                <li>Cycling: 25 points per day</li>
                <li>Public Transit: 20 points per day</li>
                <li>Carpooling: 15 points per day</li>
                <li>Remote Work: 15 points per day</li>
                <li>Electric Vehicle: 10 points per day</li>
                <li>Bonus: +25 points for 3+ days of sustainable commuting</li>
              </ul>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg text-purple-800">
              <div className="flex items-center mb-2">
                <span className="material-icons text-purple-600 mr-2">stars</span>
                <h3 className="font-medium">Competitive Insights</h3>
              </div>
              
              {stats && leaderboard && leaderboard.length > 0 ? (
                <div className="space-y-2 text-sm">
                  {/* Most consistent commuter */}
                  <div className="flex items-center">
                    <span className="material-icons text-purple-500 text-sm mr-1">local_fire_department</span>
                    <p>
                      <strong>Longest Streak: </strong> 
                      {Math.max(...leaderboard.map(user => user.streak_count || 0))} days
                      {stats.streak > 0 && ` (yours: ${stats.streak} days)`}
                    </p>
                  </div>
                  
                  {/* Average points this week */}
                  <div className="flex items-center">
                    <span className="material-icons text-purple-500 text-sm mr-1">speed</span>
                    <p>
                      <strong>Average Weekly Points: </strong>
                      {Math.round(leaderboard.reduce((acc, user) => acc + (user.points_total || 0), 0) / leaderboard.length)} points
                    </p>
                  </div>
                  
                  {/* Personal best potential */}
                  <div className="flex items-center">
                    <span className="material-icons text-purple-500 text-sm mr-1">trending_up</span>
                    <p>
                      <strong>Potential Weekly Gain: </strong>
                      Up to 240 points if you log sustainable commutes every day
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-purple-700">
                  Start logging your commutes to see competitive insights and track your progress against others!
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;
