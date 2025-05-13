import { LeaderboardUser } from "@/lib/types";

interface RankingListProps {
  users: LeaderboardUser[];
  currentUserId: number;
  startRank?: number;
}

const RankingList = ({ users, currentUserId, startRank = 1 }: RankingListProps) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No users found in the leaderboard.
      </div>
    );
  }

  return (
    <div className="border-t border-gray-100 pt-4">
      {users.map((user, index) => {
        const rank = startRank + index;
        const isCurrentUser = user.id === currentUserId;
        
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
                src={`https://images.unsplash.com/photo-${
                  isCurrentUser 
                    ? '1534528741775-53994a69daeb' 
                    : rank % 2 === 0 
                      ? '1494790108377-be9c29b29330' 
                      : '1539571696357-5a69c17a67c6'
                }?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=50&h=50`} 
                alt={`${user.name}'s avatar`} 
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
    </div>
  );
};

export default RankingList;
