import { useState } from "react";
import { useLeaderboard, findUserRank } from "@/hooks/use-leaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TopUsers from "@/components/leaderboard/top-users";
import RankingList from "@/components/leaderboard/ranking-list";
import { DEMO_USER_ID } from "@/lib/constants";

const Leaderboard = () => {
  const [timeFrame, setTimeFrame] = useState("month");
  const { data: leaderboard, isLoading } = useLeaderboard(DEMO_USER_ID, 20);
  
  // Get top 3 users for the podium display
  const topThree = leaderboard ? leaderboard.slice(0, 3) : [];
  
  // Get remaining users for the list (excluding top 3)
  const otherUsers = leaderboard ? leaderboard.slice(3) : [];
  
  // Find the current user's rank
  const currentUserRank = leaderboard ? findUserRank(leaderboard, DEMO_USER_ID) : -1;
  
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
                <TopUsers topUsers={topThree} currentUserId={DEMO_USER_ID} />
              )}
              
              {otherUsers.length > 0 && (
                <RankingList users={otherUsers} currentUserId={DEMO_USER_ID} startRank={4} />
              )}
              
              {/* Display current user if they're not in the displayed list */}
              {isUserOutsideDisplayed && currentUserRank > 0 && leaderboard && (
                <div className="mt-6 pt-6 border-t border-dashed border-gray-200">
                  <div className="text-sm text-gray-500 mb-2 text-center">Your Position</div>
                  <RankingList 
                    users={[leaderboard.find(user => user.id === DEMO_USER_ID)!]} 
                    currentUserId={DEMO_USER_ID} 
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
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg text-green-800">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;
