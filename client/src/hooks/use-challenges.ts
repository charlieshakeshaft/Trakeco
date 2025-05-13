import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Challenge, UserChallenge } from "@/lib/types";
import { useToast } from "./use-toast";

export function useAllChallenges(userId: number) {
  return useQuery<Challenge[]>({
    queryKey: [`/api/challenges?userId=${userId}`],
    staleTime: 60000, // 1 minute
  });
}

export function useUserChallenges(userId: number) {
  return useQuery<UserChallenge[]>({
    queryKey: [`/api/user/challenges?userId=${userId}`],
    staleTime: 60000, // 1 minute
  });
}

export function useJoinChallenge(userId: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (challengeId: number) => {
      return await apiRequest("POST", `/api/challenges/${challengeId}/join?userId=${userId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Challenge joined!",
        description: "You've successfully joined the challenge. Good luck!",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/user/challenges?userId=${userId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to join challenge",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useCreateChallenge(userId: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<Challenge, 'id' | 'created_at'>) => {
      return await apiRequest("POST", `/api/challenges?userId=${userId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Challenge created!",
        description: "Your new challenge is now available for participants.",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/challenges?userId=${userId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create challenge",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function getChallengeProgress(challenge: Challenge, progress: number): number {
  return Math.min((progress / challenge.goal_value) * 100, 100);
}

export function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}
