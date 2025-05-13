import IconBadge from "@/components/ui/icon-badge";
import StreakDisplay from "@/components/ui/streak-display";
import { useQuery } from "@tanstack/react-query";

interface UserStats {
  co2_saved?: number;
  points?: number;
  streak?: number;
  completed_challenges?: number;
}

interface ImpactStatsProps {
  userId: number;
}

const ImpactStats = ({ userId }: ImpactStatsProps) => {
  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: [`/api/user/stats?userId=${userId}`],
    staleTime: 60000, // 1 minute
  });
  
  const userStats = stats || {} as UserStats;

  if (isLoading) {
    return (
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Your Impact This Month</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 animate-pulse">
              <div className="h-20"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Your Impact This Month</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CO2 Saved Card */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">CO₂ Saved</p>
              <h3 className="text-3xl font-semibold text-gray-800 mt-1">
                {userStats.co2_saved || 0} <span className="text-lg font-normal text-gray-500">kg</span>
              </h3>
            </div>
            <IconBadge icon="nature" color="primary" bgColor="green-50" />
          </div>
          <div className="mt-4">
            <div className="flex items-center text-xs text-success font-medium">
              <span className="material-icons text-xs mr-1">arrow_upward</span>
              12% from last month
            </div>
          </div>
        </div>

        {/* Points Earned Card */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Points Earned</p>
              <h3 className="text-3xl font-semibold text-gray-800 mt-1">
                {userStats.points || 0} <span className="text-lg font-normal text-gray-500">pts</span>
              </h3>
            </div>
            <IconBadge icon="stars" color="accent-dark" bgColor="amber-50" />
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Next tier at 1000 pts</span>
              <span className="font-medium">{Math.min(Math.round((userStats.points || 0) / 10), 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div 
                className="bg-accent h-1.5 rounded-full progress-bar" 
                style={{ width: `${Math.min(Math.round((userStats.points || 0) / 10), 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Streak Card */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Current Streak</p>
              <h3 className="text-3xl font-semibold text-gray-800 mt-1">
                {userStats.streak || 0} <span className="text-lg font-normal text-gray-500">weeks</span>
              </h3>
            </div>
            <IconBadge icon="local_fire_department" color="secondary" bgColor="blue-50" />
          </div>
          <div className="mt-4">
            <StreakDisplay days={5} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactStats;
