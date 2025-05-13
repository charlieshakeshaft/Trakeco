import { useState } from "react";
import { useRedeemReward } from "@/hooks/use-rewards";

interface RedeemButtonProps {
  rewardId: number;
  userId: number;
}

const RedeemButton = ({ rewardId, userId }: RedeemButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const redeemMutation = useRedeemReward(userId);
  
  const handleRedeem = () => {
    if (!redeemMutation.isPending) {
      redeemMutation.mutate(rewardId);
    }
  };
  
  return (
    <button 
      className={`mt-4 w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors claim-btn ${
        isHovered ? 'opacity-100' : ''
      }`}
      onClick={handleRedeem}
      disabled={redeemMutation.isPending}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {redeemMutation.isPending ? "Claiming..." : "Claim Reward"}
    </button>
  );
};

export default RedeemButton;
