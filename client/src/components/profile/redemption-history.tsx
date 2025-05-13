import { format } from "date-fns";
import { useUserRedemptions } from "@/hooks/use-rewards";
import { Card, CardContent } from "@/components/ui/card";
import { getRewardIcon } from "@/lib/constants";

interface RedemptionHistoryProps {
  userId: number;
}

const RedemptionHistory = ({ userId }: RedemptionHistoryProps) => {
  const { data: redemptions, isLoading } = useUserRedemptions(userId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Your Redemption History</h2>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasRedemptions = redemptions && redemptions.length > 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">Your Redemption History</h2>
        
        {hasRedemptions ? (
          <div className="space-y-4">
            {redemptions.map((item) => (
              <div key={item.redemption.id} className="flex items-center p-3 rounded-lg border border-gray-200">
                <div className="p-2 rounded-lg bg-accent/10 text-accent-dark mr-3">
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
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-gray-200 rounded-lg">
            <div className="p-2 rounded-full bg-gray-100 inline-flex items-center justify-center mb-3">
              <span className="material-icons text-gray-400">redeem</span>
            </div>
            <h3 className="font-medium text-gray-700 mb-1">No Redemptions Yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              You haven't redeemed any rewards yet. Earn points by logging your sustainable commutes!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RedemptionHistory;
