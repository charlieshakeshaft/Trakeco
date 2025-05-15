import { useAuth } from "@/contexts/auth-context";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ImpactStats from "@/components/dashboard/impact-stats";
import CommuteSummary from "@/components/dashboard/commute-summary";
import ChallengesSection from "@/components/dashboard/challenges-section";
import RewardsSection from "@/components/dashboard/rewards-section";
import LeaderboardSection from "@/components/dashboard/leaderboard-section";
import UserRankCard from "@/components/dashboard/user-rank-card";

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  
  // Refresh all dashboard data when component mounts
  useEffect(() => {
    if (user && user.id) {
      // Invalidate all relevant query keys to ensure fresh data
      queryClient.invalidateQueries({ queryKey: [`/api/user/stats`] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/stats?userId=${user.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/commutes/current`] });
      queryClient.invalidateQueries({ queryKey: [`/api/commutes/current?userId=${user.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/challenges`] });
      queryClient.invalidateQueries({ queryKey: [`/api/leaderboard`] });
      queryClient.invalidateQueries({ queryKey: [`/api/rewards`] });
    }
  }, [user, queryClient]);
  
  // If still loading auth state or not authenticated, show loading
  if (isLoading) {
    return <div className="p-4 md:p-8">Loading dashboard...</div>;
  }
  
  if (!isAuthenticated || !user) {
    return <div className="p-4 md:p-8">Please log in to view your dashboard</div>;
  }
  
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
        {user.company_id ? 'Company Dashboard' : 'Personal Dashboard'}
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* User Impact Stats */}
          <ImpactStats userId={user.id} />
          
          {/* Weekly Commute Summary */}
          <CommuteSummary userId={user.id} />
          
          {/* Active Challenges */}
          <ChallengesSection userId={user.id} />
          
          {/* Available Rewards */}
          <RewardsSection userId={user.id} />
        </div>
        
        <div className="space-y-6">
          {/* User Rank Card */}
          <UserRankCard userId={user.id} />
          
          {/* Leaderboard */}
          <LeaderboardSection userId={user.id} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
