import { useAuth } from "@/contexts/auth-context";
import ImpactStats from "@/components/dashboard/impact-stats";
import CommuteSummary from "@/components/dashboard/commute-summary";
import ChallengesSection from "@/components/dashboard/challenges-section";
import RewardsSection from "@/components/dashboard/rewards-section";
import LeaderboardSection from "@/components/dashboard/leaderboard-section";

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
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
      
      {/* User Impact Stats */}
      <ImpactStats userId={user.id} />
      
      {/* Weekly Commute Summary */}
      <CommuteSummary userId={user.id} />
      
      {/* Active Challenges */}
      <ChallengesSection userId={user.id} />
      
      {/* Available Rewards */}
      <RewardsSection userId={user.id} />
      
      {/* Leaderboard */}
      <LeaderboardSection userId={user.id} />
    </div>
  );
};

export default Dashboard;
