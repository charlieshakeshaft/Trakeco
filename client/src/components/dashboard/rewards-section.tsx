import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAllRewards } from "@/hooks/use-rewards";
import IconBadge from "@/components/ui/icon-badge";

interface RewardsSectionProps {
  userId: number;
}

interface Reward {
  id: number;
  title: string;
  description: string;
  cost_points: number;
}

interface UserProfile {
  id?: number;
  points_total?: number;
  username?: string;
  email?: string;
  role?: string;
  company_id?: number;
}

const RewardsSection = ({ userId }: RewardsSectionProps) => {
  const { toast } = useToast();
  const { data: rewards, isLoading } = useAllRewards(userId);
  
  const { data: userProfile } = useQuery<UserProfile>({
    queryKey: ['/api/user/profile'],
  });
  
  const userProfileData = userProfile || {} as UserProfile;

  const redeemMutation = useMutation({
    mutationFn: async (rewardId: number) => {
      return await apiRequest(`/api/rewards/${rewardId}/redeem`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Reward redeemed!",
        description: "Check your profile to view your redemption.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to redeem reward",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleRedeemReward = (reward: Reward) => {
    redeemMutation.mutate(reward.id);
  };

  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Available Rewards</h2>
          <Link to="/rewards" className="text-primary hover:text-primary-dark text-sm font-medium">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 animate-pulse">
              <div className="h-40"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Get available rewards (up to 3)
  const availableRewards: Reward[] = Array.isArray(rewards) ? rewards.slice(0, 3) : [];
  const userPoints = userProfileData.points_total || 0;
  
  const getRewardIcon = (title: string) => {
    if (title.toLowerCase().includes('coffee')) return 'coffee';
    if (title.toLowerCase().includes('lunch')) return 'lunch_dining';
    if (title.toLowerCase().includes('day off') || title.toLowerCase().includes('half-day')) return 'access_time';
    return 'card_giftcard';
  };

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Available Rewards</h2>
        <Link to="/rewards" className="text-primary hover:text-primary-dark text-sm font-medium">
          View All
        </Link>
      </div>

      {availableRewards.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-center">
          <span className="material-icons text-gray-400 text-4xl mb-2">card_giftcard</span>
          <h3 className="text-lg font-medium text-gray-700 mb-1">No Rewards Available</h3>
          <p className="text-gray-500 mb-4">
            There are no rewards available for your company yet.
          </p>
          {userProfileData.role === 'admin' && (
            <Link to="/rewards">
              <button className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                <span className="material-icons text-sm mr-1">add</span>
                Create Reward
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableRewards.map((reward) => (
            <div key={reward.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 reward-card relative card-hover transition-all duration-200">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <IconBadge icon={getRewardIcon(reward.title)} color="accent-dark" bgColor="accent/10" />
                  <span className="text-sm font-semibold rounded-full bg-gray-100 text-gray-700 px-3 py-1">
                    {reward.cost_points} pts
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800">{reward.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{reward.description}</p>
                
                {userPoints >= reward.cost_points ? (
                  <button 
                    className="mt-4 w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors claim-btn"
                    onClick={() => handleRedeemReward(reward)}
                    disabled={redeemMutation.isPending}
                  >
                    {redeemMutation.isPending ? "Claiming..." : "Claim Reward"}
                  </button>
                ) : (
                  <button className="mt-4 w-full py-2 px-4 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed">
                    Need {reward.cost_points - userPoints} more points
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default RewardsSection;
