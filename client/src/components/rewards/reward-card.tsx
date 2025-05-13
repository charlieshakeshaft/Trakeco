import { Reward, UserRedemption } from "@/lib/types";
import IconBadge from "@/components/ui/icon-badge";
import { getRewardIcon } from "@/lib/constants";
import RedeemButton from "./redeem-button";

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  userId: number;
  showDetails?: boolean;
  redemptions?: UserRedemption[];
}

const RewardCard = ({ reward, userPoints, userId, showDetails = false, redemptions = [] }: RewardCardProps) => {
  const canRedeem = userPoints >= reward.cost_points;
  const pointsNeeded = canRedeem ? 0 : reward.cost_points - userPoints;
  
  // Get appropriate icon for the reward
  const icon = getRewardIcon(reward.title);
  
  // Calculate how many times this reward has been redeemed
  const timesRedeemed = redemptions.filter(r => r.reward.id === reward.id).length;
  
  // Calculate remaining redemptions if there's a limit
  const remainingRedemptions = reward.quantity_limit 
    ? reward.quantity_limit - timesRedeemed 
    : null;
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 reward-card relative card-hover transition-all duration-200">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <IconBadge icon={icon} color="accent-dark" bgColor="accent/10" />
          <span className="text-sm font-semibold rounded-full bg-gray-100 text-gray-700 px-3 py-1">
            {reward.cost_points} pts
          </span>
        </div>
        
        <h3 className="font-semibold text-gray-800">{reward.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{reward.description}</p>
        
        {showDetails && (
          <div className="mt-3 space-y-1 text-xs text-gray-600">
            {timesRedeemed > 0 && (
              <div>
                <span className="font-medium">Times redeemed:</span> {timesRedeemed}
              </div>
            )}
            
            {remainingRedemptions !== null && (
              <div>
                <span className="font-medium">Available:</span> {remainingRedemptions} remaining
              </div>
            )}
          </div>
        )}
        
        {canRedeem ? (
          <RedeemButton rewardId={reward.id} userId={userId} />
        ) : (
          <button className="mt-4 w-full py-2 px-4 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed">
            Need {pointsNeeded} more points
          </button>
        )}
      </div>
    </div>
  );
};

export default RewardCard;
