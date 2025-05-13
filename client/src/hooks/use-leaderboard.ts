import { useQuery } from "@tanstack/react-query";
import { LeaderboardUser, User } from "@/lib/types";

export function useLeaderboard(userId: number, limit: number = 10) {
  return useQuery<LeaderboardUser[]>({
    queryKey: [`/api/leaderboard?userId=${userId}&limit=${limit}`],
    staleTime: 60000, // 1 minute
  });
}

export function useUserStats(userId: number) {
  return useQuery({
    queryKey: [`/api/user/stats?userId=${userId}`],
    staleTime: 60000, // 1 minute
  });
}

export function useUserProfile(userId: number) {
  return useQuery<User>({
    queryKey: [`/api/user/profile?userId=${userId}`],
  });
}

export function findUserRank(leaderboard: LeaderboardUser[], userId: number): number {
  const index = leaderboard.findIndex(user => user.id === userId);
  return index !== -1 ? index + 1 : -1;
}
