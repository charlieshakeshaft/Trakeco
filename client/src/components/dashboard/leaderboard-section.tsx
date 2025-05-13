import { useQuery } from "@tanstack/react-query";

interface LeaderboardSectionProps {
  userId: number;
}

interface LeaderboardUser {
  id: number;
  name: string;
  points_total: number;
}

const LeaderboardSection = ({ userId }: LeaderboardSectionProps) => {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: [`/api/leaderboard?userId=${userId}`],
    staleTime: 60000, // 1 minute
  });

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

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Leaderboard</h2>
        <div className="text-sm text-gray-500">Updated today</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="p-5">
          {topThree.length > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
              {/* 2nd place */}
              {topThree.length > 1 && (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-accent">
                    <img
                      src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
                      alt="User avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="material-icons text-accent">looks_two</span>
                    <span className="text-sm font-medium ml-1">{topThree[1].name.split(' ')[0]}</span>
                  </div>
                  <div className="text-sm text-gray-500">{topThree[1].points_total} pts</div>
                </div>
              )}

              {/* 1st place */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-accent">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
                    alt="User avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center mt-2">
                  <span className="material-icons text-accent">looks_one</span>
                  <span className="text-sm font-medium ml-1">{topThree[0].name.split(' ')[0]}</span>
                </div>
                <div className="text-sm text-gray-500">{topThree[0].points_total} pts</div>
              </div>

              {/* 3rd place */}
              {topThree.length > 2 && (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-accent">
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
                      alt="User avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="material-icons text-accent">looks_3</span>
                    <span className="text-sm font-medium ml-1">{topThree[2].name.split(' ')[0]}</span>
                  </div>
                  <div className="text-sm text-gray-500">{topThree[2].points_total} pts</div>
                </div>
              )}
            </div>
          )}

          {/* Other rankings */}
          <div className="border-t border-gray-100 pt-4">
            {otherUsers.map((user, index) => {
              const rank = index + 4; // Start from rank 4
              const isCurrentUser = user.id === userId;
              
              return (
                <div 
                  key={user.id} 
                  className={`flex items-center justify-between py-2 border-b border-gray-100 ${
                    isCurrentUser ? "bg-green-50" : ""
                  }`}
                >
                  <div className="flex items-center">
                    <div 
                      className={`w-8 h-8 flex items-center justify-center ${
                        isCurrentUser 
                          ? "bg-primary text-white" 
                          : "bg-gray-100 text-gray-700"
                      } rounded-full text-sm font-medium`}
                    >
                      {rank}
                    </div>
                    <img 
                      src={`https://images.unsplash.com/photo-${isCurrentUser ? '1534528741775-53994a69daeb' : '1494790108377-be9c29b29330'}?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=50&h=50`} 
                      alt="User avatar" 
                      className="w-8 h-8 rounded-full ml-3" 
                    />
                    <span className="ml-3 text-sm font-medium">
                      {isCurrentUser ? "You" : user.name}
                    </span>
                  </div>
                  <div className="text-sm font-medium">{user.points_total} pts</div>
                </div>
              );
            })}
            
            {/* Add current user if not in top 10 */}
            {currentUserRank > 10 && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100 bg-green-50">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full text-sm font-medium">
                    {currentUserRank}
                  </div>
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=50&h=50" 
                    alt="User avatar" 
                    className="w-8 h-8 rounded-full ml-3" 
                  />
                  <span className="ml-3 text-sm font-medium">You</span>
                </div>
                <div className="text-sm font-medium">
                  {leaderboardUsers[currentUserIndex]?.points_total} pts
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeaderboardSection;
