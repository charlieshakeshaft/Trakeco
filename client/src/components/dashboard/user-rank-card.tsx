import { useQuery } from "@tanstack/react-query";
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

interface UserRankCardProps {
  userId: number;
}

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
  const tiers = getRankTiers();
  const currentTier = getUserRankTier(points);
  const currentTierIndex = tiers.findIndex(tier => tier.name === currentTier.name);
  
  // If we're at the highest tier, just return the current one
  if (currentTierIndex === tiers.length - 1) {
    return currentTier;
  }
  
  // Otherwise return the next tier
  return tiers[currentTierIndex + 1];
};

const UserRankCard = ({ userId }: UserRankCardProps) => {
  // Retrieve user stats
  interface UserStats {
    streak: number;
    points: number;
    co2_saved: number;
    completed_challenges: number;
  }
  
  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: [`/api/user/stats?userId=${userId}`],
    staleTime: 60000, // 1 minute
  });

  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center">
          <span className="material-icons text-primary mr-2">workspace_premium</span>
          Your Achievement Badges
        </h2>
        
        <div className="flex items-center mt-2 md:mt-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1 text-primary">
                <span className="material-icons text-sm">badge</span>
                Badge Guide
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Achievement Badges</DialogTitle>
                <DialogDescription>
                  Track your commutes to earn points and unlock higher tier badges
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-3 mt-4">
                {getRankTiers().map((tier) => (
                  <div 
                    key={tier.name} 
                    className={cn(
                      "flex items-center p-4 rounded-lg",
                      stats && getUserRankTier(stats.points).name === tier.name
                        ? tier.name === 'Bronze' 
                          ? "bg-amber-50 border border-amber-200"
                          : tier.name === 'Silver'
                            ? "bg-gray-50 border border-gray-200"
                            : tier.name === 'Gold'
                              ? "bg-yellow-50 border border-yellow-200"
                              : tier.name === 'Platinum'
                                ? "bg-blue-50 border border-blue-200"
                                : "bg-purple-50 border border-purple-200"
                        : "border border-gray-200"
                    )}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-lg flex items-center justify-center mr-4 shadow-md border-2",
                      tier.name === 'Bronze' 
                        ? "border-amber-600 bg-gradient-to-br from-amber-100 to-amber-300"
                        : tier.name === 'Silver'
                          ? "border-gray-400 bg-gradient-to-br from-gray-100 to-gray-300"
                          : tier.name === 'Gold'
                            ? "border-yellow-500 bg-gradient-to-br from-yellow-100 to-yellow-300"
                            : tier.name === 'Platinum'
                              ? "border-blue-600 bg-gradient-to-br from-blue-100 to-blue-300"
                              : "border-purple-600 bg-gradient-to-br from-purple-200 to-pink-300"
                    )}>
                      <span className={cn(
                        "material-icons text-2xl",
                        tier.name === 'Bronze' 
                          ? "text-amber-800"
                          : tier.name === 'Silver'
                            ? "text-gray-700"
                            : tier.name === 'Gold'
                              ? "text-yellow-700"
                              : tier.name === 'Platinum'
                                ? "text-blue-700"
                                : "text-purple-800"
                      )}>{tier.icon}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-lg">{tier.name} Badge</div>
                        {stats && getUserRankTier(stats.points).name === tier.name && (
                          <div className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded",
                            tier.name === 'Bronze' 
                              ? "bg-amber-100 text-amber-800"
                              : tier.name === 'Silver'
                                ? "bg-gray-200 text-gray-800"
                                : tier.name === 'Gold'
                                  ? "bg-yellow-100 text-yellow-800"
                                  : tier.name === 'Platinum'
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-purple-100 text-purple-800"
                          )}>
                            Current
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">{tier.minPoints} - {tier.maxPoints < Infinity 
                          ? tier.maxPoints 
                          : "∞"}</span> points
                      </div>
                      
                      {stats && getUserRankTier(stats.points).minPoints <= stats.points && 
                       tier.maxPoints > stats.points && tier.maxPoints < Infinity && (
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={cn(
                              "h-1.5 rounded-full",
                              tier.name === 'Bronze' 
                                ? "bg-amber-500"
                                : tier.name === 'Silver'
                                  ? "bg-gray-500"
                                  : tier.name === 'Gold'
                                    ? "bg-yellow-500"
                                    : tier.name === 'Platinum'
                                      ? "bg-blue-500"
                                      : "bg-purple-500"
                            )}
                            style={{ 
                              width: `${Math.min(100, (stats.points - tier.minPoints) / 
                                (tier.maxPoints - tier.minPoints) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded-full"></div>
            </div>
          ) : stats ? (
            <div>
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                {/* Current rank badge */}
                <div className="flex items-center gap-4 md:w-1/3">
                  <div className={cn(
                    "w-16 h-16 rounded-lg flex items-center justify-center shadow-lg border-2",
                    getUserRankTier(stats.points).name === 'Bronze' 
                      ? "border-amber-600 bg-gradient-to-br from-amber-100 to-amber-300"
                      : getUserRankTier(stats.points).name === 'Silver'
                        ? "border-gray-400 bg-gradient-to-br from-gray-100 to-gray-300"
                        : getUserRankTier(stats.points).name === 'Gold'
                          ? "border-yellow-500 bg-gradient-to-br from-yellow-100 to-yellow-300"
                          : getUserRankTier(stats.points).name === 'Platinum'
                            ? "border-blue-600 bg-gradient-to-br from-blue-100 to-blue-300"
                            : "border-purple-600 bg-gradient-to-br from-purple-200 to-pink-300"
                  )}>
                    <span className={cn(
                      "material-icons text-2xl",
                      getUserRankTier(stats.points).name === 'Bronze' 
                        ? "text-amber-800"
                        : getUserRankTier(stats.points).name === 'Silver'
                          ? "text-gray-700"
                          : getUserRankTier(stats.points).name === 'Gold'
                            ? "text-yellow-700"
                            : getUserRankTier(stats.points).name === 'Platinum'
                              ? "text-blue-700"
                              : "text-purple-800"
                    )}>{getUserRankTier(stats.points).icon}</span>
                  </div>
                  
                  <div>
                    <div className={cn(
                      "inline-flex px-3 py-1 rounded-full text-sm font-medium mb-1",
                      getUserRankTier(stats.points).name === 'Bronze' 
                        ? "bg-amber-100 text-amber-800"
                        : getUserRankTier(stats.points).name === 'Silver'
                          ? "bg-gray-200 text-gray-800"
                          : getUserRankTier(stats.points).name === 'Gold'
                            ? "bg-yellow-100 text-yellow-800"
                            : getUserRankTier(stats.points).name === 'Platinum'
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                    )}>
                      {getUserRankTier(stats.points).name} Badge
                    </div>
                    <div className="text-sm text-gray-600">
                      {stats.points} / {getUserRankTier(stats.points).maxPoints < Infinity 
                        ? getUserRankTier(stats.points).maxPoints
                        : "∞"} points
                    </div>
                  </div>
                </div>
                
                {/* Progress section */}
                <div className="flex-1 flex flex-col">
                  {getUserRankTier(stats.points).maxPoints < Infinity && (
                    <>
                      <div className="flex justify-between mb-2">
                        <div className="text-sm font-medium text-gray-700">
                          Badge Progress
                        </div>
                        <div className="text-sm text-primary font-medium">
                          {Math.min(100, Math.round((stats.points - getUserRankTier(stats.points).minPoints) / 
                            (getUserRankTier(stats.points).maxPoints - getUserRankTier(stats.points).minPoints) * 100))}%
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                        <div 
                          className={cn(
                            "h-3 rounded-full",
                            getUserRankTier(stats.points).name === 'Bronze' 
                              ? "bg-gradient-to-r from-amber-500 to-amber-600"
                              : getUserRankTier(stats.points).name === 'Silver'
                                ? "bg-gradient-to-r from-gray-400 to-gray-500"
                                : getUserRankTier(stats.points).name === 'Gold'
                                  ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                                  : getUserRankTier(stats.points).name === 'Platinum'
                                    ? "bg-gradient-to-r from-blue-500 to-blue-600"
                                    : "bg-gradient-to-r from-purple-500 to-pink-500"
                          )} 
                          style={{ 
                            width: `${Math.min(100, (stats.points - getUserRankTier(stats.points).minPoints) / 
                              (getUserRankTier(stats.points).maxPoints - getUserRankTier(stats.points).minPoints) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{getUserRankTier(stats.points).minPoints} pts</span>
                        {stats.points < getUserRankTier(stats.points).maxPoints && (
                          <span className="text-center text-primary font-medium">
                            {getUserRankTier(stats.points).maxPoints - stats.points} points to next level
                          </span>
                        )}
                        <span>{getUserRankTier(stats.points).maxPoints} pts</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Badge benefits */}
              <div className="mt-4 border-t border-gray-100 pt-4">
                {getUserRankTier(stats.points).maxPoints < Infinity ? (
                  <>
                    <h3 className="font-medium text-gray-700 mb-2">
                      Next Level: {getNextRankTier(stats.points).name} Badge 
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {stats.points < 500 && (
                        <li className="flex items-start">
                          <span className="material-icons text-primary text-sm mr-1">emoji_events</span>
                          <span className="text-gray-700">Special rewards access</span>
                        </li>
                      )}
                      {stats.points < 1000 && (
                        <li className="flex items-start">
                          <span className="material-icons text-primary text-sm mr-1">emoji_events</span>
                          <span className="text-gray-700">Premium challenges</span>
                        </li>
                      )}
                      {stats.points < 2000 && (
                        <li className="flex items-start">
                          <span className="material-icons text-primary text-sm mr-1">emoji_events</span>
                          <span className="text-gray-700">Exclusive badges</span>
                        </li>
                      )}
                      {stats.points < 3000 && (
                        <li className="flex items-start">
                          <span className="material-icons text-primary text-sm mr-1">emoji_events</span>
                          <span className="text-gray-700">Elite leaderboard status</span>
                        </li>
                      )}
                    </ul>
                  </>
                ) : (
                  <>
                    <h3 className="font-medium text-gray-700 mb-2">
                      Maximum Level Achieved!
                    </h3>
                    <p className="text-sm text-gray-700">You've reached the highest level. Congratulations on your commitment to sustainable commuting!</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <span className="material-icons text-gray-400">military_tech</span>
              </div>
              <h3 className="text-base font-medium text-gray-700 mb-1">No Rank Data Available</h3>
              <p className="text-gray-500 text-sm">
                Start logging commutes to earn points and increase your rank!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default UserRankCard;