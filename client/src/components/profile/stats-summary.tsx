import { useUserStats } from "@/hooks/use-leaderboard";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import StreakDisplay from "@/components/ui/streak-display";

interface StatsSummaryProps {
  userId: number;
}

const StatsSummary = ({ userId }: StatsSummaryProps) => {
  const { data: stats, isLoading } = useUserStats(userId);

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pointsToNextTier = 1000 - (stats?.points || 0);
  const progressPercentage = Math.min(((stats?.points || 0) / 1000) * 100, 100);

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">Your Impact Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-600">Total Points</span>
                <span className="font-medium">{stats?.points || 0} pts</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="text-xs text-gray-500 mt-1">
                {pointsToNextTier > 0 
                  ? `${pointsToNextTier} points until next tier` 
                  : "You've reached the current top tier!"}
              </div>
            </div>
            
            <div>
              <div className="font-medium text-sm text-gray-600 mb-1">Current Streak</div>
              <div className="flex items-baseline">
                <span className="text-2xl font-semibold mr-1">{stats?.streak || 0}</span>
                <span className="text-gray-600">consecutive weeks</span>
              </div>
              {stats?.streak ? (
                <div className="mt-2">
                  <StreakDisplay days={5} />
                </div>
              ) : null}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="font-medium text-sm text-gray-600 mb-1">CO₂ Saved</div>
              <div className="flex items-baseline">
                <span className="text-2xl font-semibold mr-1">{stats?.co2_saved || 0}</span>
                <span className="text-gray-600">kg</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                That's equivalent to planting about {Math.round((stats?.co2_saved || 0) / 20)} trees!
              </div>
            </div>
            
            <div>
              <div className="font-medium text-sm text-gray-600 mb-1">Challenges Completed</div>
              <div className="flex items-baseline">
                <span className="text-2xl font-semibold mr-1">{stats?.completed_challenges || 0}</span>
                <span className="text-gray-600">challenges</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-blue-800 text-sm">
          <div className="flex items-center font-medium mb-1">
            <span className="material-icons text-sm mr-1">tips_and_updates</span>
            Tips to Increase Your Impact
          </div>
          <ul className="list-disc pl-5 space-y-1">
            <li>Log your sustainable commutes consistently</li>
            <li>Join active challenges to earn bonus points</li>
            <li>Try cycling or walking for short distances</li>
            <li>Encourage colleagues to join Trak</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsSummary;
