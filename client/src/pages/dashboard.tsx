import { useQuery } from "@tanstack/react-query";
import ImpactStats from "@/components/dashboard/impact-stats";
import CommuteSummary from "@/components/dashboard/commute-summary";
import ChallengesSection from "@/components/dashboard/challenges-section";
import RewardsSection from "@/components/dashboard/rewards-section";
import LeaderboardSection from "@/components/dashboard/leaderboard-section";

// Using userId 1 for demonstration
const DEMO_USER_ID = 1;

const Dashboard = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: [`/api/user/profile?userId=${DEMO_USER_ID}`],
  });

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">Dashboard</h1>
      
      {/* User Impact Stats */}
      <ImpactStats userId={DEMO_USER_ID} />
      
      {/* Weekly Commute Summary */}
      <CommuteSummary userId={DEMO_USER_ID} />
      
      {/* Active Challenges */}
      <ChallengesSection userId={DEMO_USER_ID} />
      
      {/* Available Rewards */}
      <RewardsSection userId={DEMO_USER_ID} />
      
      {/* Leaderboard */}
      <LeaderboardSection userId={DEMO_USER_ID} />
    </div>
  );
};

export default Dashboard;
