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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center">
          <span className="material-icons text-accent mr-2">military_tech</span>
          Your Rank
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          ) : stats ? (
            <div>
              <div className="flex items-center mb-5">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center shadow-sm mr-4",
                  getUserRankTier(stats.points).color
                )}>
                  <span className="material-icons text-xl">{getUserRankTier(stats.points).icon}</span>
                </div>
                
                <div>
                  <div className="text-xl font-semibold">{getUserRankTier(stats.points).name}</div>
                  <div className="text-sm text-gray-600">
                    {getUserRankTier(stats.points).maxPoints < Infinity 
                      ? `${stats.points} / ${getUserRankTier(stats.points).maxPoints} points` 
                      : `${stats.points}+ points (Max Rank)`
                    }
                  </div>
                </div>
                
                <div className="ml-auto">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs">
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
                        {getRankTiers().map((tier) => (
                          <div 
                            key={tier.name} 
                            className={cn(
                              "flex items-center p-3 rounded-lg border",
                              getUserRankTier(stats.points).name === tier.name
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
                            
                            {getUserRankTier(stats.points).name === tier.name && (
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
              
              {/* Progress bar */}
              {getUserRankTier(stats.points).maxPoints < Infinity && (
                <div>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-1">
                    <span>{getUserRankTier(stats.points).minPoints}</span>
                    <span>
                      {getUserRankTier(stats.points).maxPoints - stats.points} points to next rank
                    </span>
                    <span>{getUserRankTier(stats.points).maxPoints}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, (stats.points - getUserRankTier(stats.points).minPoints) / 
                          (getUserRankTier(stats.points).maxPoints - getUserRankTier(stats.points).minPoints) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Next level challenges */}
              <div className="mt-4 border-t border-gray-100 pt-4">
                {getUserRankTier(stats.points).maxPoints < Infinity ? (
                  <>
                    <h3 className="font-medium text-gray-700 mb-2">
                      Unlock at {getNextRankTier(stats.points).name} Rank
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {stats.points < 500 && (
                        <li className="flex items-start">
                          <span className="material-icons text-gray-400 text-sm mr-1">lock</span>
                          <span className="text-gray-500">Special rewards access</span>
                        </li>
                      )}
                      {stats.points < 1000 && (
                        <li className="flex items-start">
                          <span className="material-icons text-gray-400 text-sm mr-1">lock</span>
                          <span className="text-gray-500">Premium challenges</span>
                        </li>
                      )}
                      {stats.points < 2000 && (
                        <li className="flex items-start">
                          <span className="material-icons text-gray-400 text-sm mr-1">lock</span>
                          <span className="text-gray-500">Exclusive badges</span>
                        </li>
                      )}
                      {stats.points < 3000 && (
                        <li className="flex items-start">
                          <span className="material-icons text-gray-400 text-sm mr-1">lock</span>
                          <span className="text-gray-500">Elite leaderboard status</span>
                        </li>
                      )}
                    </ul>
                  </>
                ) : (
                  <>
                    <h3 className="font-medium text-gray-700 mb-2">
                      All Challenges Unlocked
                    </h3>
                    <p className="text-sm text-gray-500">You've reached the highest rank and unlocked all challenges!</p>
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