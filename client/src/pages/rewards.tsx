import { useState } from "react";
import { useAllRewards, useUserRedemptions } from "@/hooks/use-rewards";
import { useUserProfile } from "@/hooks/use-leaderboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import RewardCard from "@/components/rewards/reward-card";
import { getRewardIcon } from "@/lib/constants";
import { useAuth } from "@/contexts/auth-context";
import { format } from "date-fns";

const Rewards = () => {
  const [activeTab, setActiveTab] = useState("available");
  const { user } = useAuth();
  const userId = user?.id || 0;
  
  const { data: rewards, isLoading: isLoadingRewards } = useAllRewards(userId);
  const { data: redemptions, isLoading: isLoadingRedemptions } = useUserRedemptions(userId);
  const { data: profile, isLoading: isLoadingProfile } = useUserProfile(userId);
  
  const isLoading = isLoadingRewards || isLoadingRedemptions || isLoadingProfile;
  const userPoints = profile?.points_total || 0;
  
  // Filter rewards within user's point range
  const availableRewards = rewards?.filter(reward => reward.cost_points <= userPoints) || [];
  
  // Filter rewards outside user's point range
  const futureRewards = rewards?.filter(reward => reward.cost_points > userPoints) || [];

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">Rewards</h1>
      
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500 mb-1">Your Balance</p>
            <h2 className="text-3xl font-bold text-gray-800">{userPoints} <span className="text-gray-500 text-xl font-normal">points</span></h2>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-start">
              <span className="material-icons text-primary mt-0.5 mr-2">tips_and_updates</span>
              <div>
                <h3 className="font-medium text-gray-800 mb-1">How to Earn More Points</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Log sustainable commutes daily</li>
                  <li>• Maintain a weekly streak</li>
                  <li>• Complete active challenges</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="available" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="available">Available Rewards</TabsTrigger>
          <TabsTrigger value="future">Future Rewards</TabsTrigger>
          <TabsTrigger value="redeemed">Redeemed Rewards</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="h-40 bg-gray-200"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : availableRewards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableRewards.map(reward => (
                <RewardCard 
                  key={reward.id}
                  reward={reward}
                  userPoints={userPoints}
                  userId={DEMO_USER_ID}
                  showDetails
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <span className="material-icons text-gray-400">redeem</span>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Available Rewards</h3>
                <p className="text-gray-500 mb-6 text-center max-w-lg">
                  You don't have enough points for any rewards yet. Keep logging your sustainable commutes to earn more points!
                </p>
                <button 
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                  onClick={() => setActiveTab("future")}
                >
                  View Future Rewards
                </button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="future">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="h-40 bg-gray-200"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : futureRewards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {futureRewards.map(reward => (
                <RewardCard 
                  key={reward.id}
                  reward={reward}
                  userPoints={userPoints}
                  userId={DEMO_USER_ID}
                  showDetails
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <span className="material-icons text-gray-400">check_circle</span>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Future Rewards</h3>
                <p className="text-gray-500 mb-2 text-center max-w-lg">
                  Great job! You have enough points for all available rewards.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="redeemed">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="h-20 bg-gray-200"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : redemptions && redemptions.length > 0 ? (
            <div className="space-y-4">
              {redemptions.map(item => (
                <Card key={item.redemption.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-accent/10 text-accent-dark mr-4">
                        <span className="material-icons">{getRewardIcon(item.reward.title)}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.reward.title}</h3>
                        <p className="text-sm text-gray-500">{item.reward.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{item.reward.cost_points} pts</div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(item.redemption.redeemed_at), "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <span className="material-icons text-gray-400">receipt_long</span>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Redemption History</h3>
                <p className="text-gray-500 mb-6 text-center max-w-lg">
                  You haven't redeemed any rewards yet. Check out the available rewards you can claim with your points!
                </p>
                <button 
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                  onClick={() => setActiveTab("available")}
                >
                  View Available Rewards
                </button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Rewards;
