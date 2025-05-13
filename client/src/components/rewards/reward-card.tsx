import { Reward } from "@/lib/types";
import IconBadge from "@/components/ui/icon-badge";
import { getRewardIcon } from "@/lib/constants";
import RedeemButton from "./redeem-button";

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  userId: number;
  showDetails?: boolean;
}

const RewardCard = ({ reward, userPoints, userId, showDetails = false }: RewardCardProps) => {
  const canRedeem = userPoints >= reward.cost_points;
  const pointsNeeded = canRedeem ? 0 : reward.cost_points - userPoints;
  
  // Get appropriate icon for the reward
  const icon = getRewardIcon(reward.title);
  
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
        
        {showDetails && reward.quantity_limit && (
          <div className="mt-3 mb-1 text-xs text-gray-600">
            <span className="font-medium">Limited availability:</span> {reward.quantity_limit} available
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
