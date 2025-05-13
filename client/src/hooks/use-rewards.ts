import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Reward, UserRedemption } from "@/lib/types";
import { useToast } from "./use-toast";

export function useAllRewards(userId: number) {
  return useQuery<Reward[]>({
    queryKey: [`/api/rewards?userId=${userId}`],
    staleTime: 60000, // 1 minute
  });
}

export function useUserRedemptions(userId: number) {
  return useQuery<UserRedemption[]>({
    queryKey: [`/api/user/redemptions?userId=${userId}`],
    staleTime: 60000, // 1 minute
  });
}

export function useRedeemReward(userId: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (rewardId: number) => {
      return await apiRequest(`/api/rewards/${rewardId}/redeem?userId=${userId}`, null, "POST");
    },
    onSuccess: (data) => {
      toast({
        title: "Reward redeemed!",
        description: `You've successfully redeemed: ${data.reward?.title || 'your reward'}`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/user/redemptions?userId=${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/profile?userId=${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/stats?userId=${userId}`] });
    },
    onError: (error: Error) => {
      // Extract message from error
      let errorMessage = error.message;
      try {
        const parsedError = JSON.parse(errorMessage);
        if (parsedError.message) {
          errorMessage = parsedError.message;
        }
        
        if (parsedError.pointsNeeded) {
          errorMessage = `You need ${parsedError.pointsNeeded} more points to redeem this reward.`;
        }
      } catch (e) {
        // Use the original error message if parsing fails
      }
      
      toast({
        title: "Failed to redeem reward",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
}

export function useCreateReward(userId: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<Reward, 'id' | 'created_at'>) => {
      return await apiRequest(`/api/rewards?userId=${userId}`, data, "POST");
    },
    onSuccess: () => {
      toast({
        title: "Reward created!",
        description: "Your new reward is now available for redemption.",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/rewards?userId=${userId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create reward",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
