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

// Constants for conversion calculations
const KG_CO2_PER_TREE_PER_YEAR = 20; // One tree absorbs ~20kg CO2 per year
const LITERS_PER_KG_CO2 = 500; // 1kg CO2 occupies ~500 liters of volume
const BALLOON_VOLUME_LITERS = 5; // Average party balloon volume

const ImpactStats = ({ userId }: ImpactStatsProps) => {
  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: [`/api/user/stats?userId=${userId}`],
    staleTime: 60000, // 1 minute
  });
  
  const userStats = stats || {} as UserStats;
  
  // Calculate environmental equivalents
  const co2SavedKg = userStats.co2_saved || 0;
  const treeEquivalent = Math.max(1, Math.round(co2SavedKg / KG_CO2_PER_TREE_PER_YEAR));
  const balloonsEquivalent = Math.round((co2SavedKg * LITERS_PER_KG_CO2) / BALLOON_VOLUME_LITERS);
  const carKilometers = Math.round(co2SavedKg / 0.19); // Based on avg car emission of 0.19 kg/km

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
      
      {/* Single Carbon Savings Card - More Positive Tone */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl shadow-sm p-5 border border-green-200 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-green-800 text-sm font-medium uppercase tracking-wide">Your Carbon Savings</p>
            <h3 className="text-4xl font-bold text-green-900 mt-1 flex items-baseline">
              {co2SavedKg} <span className="text-xl font-normal text-green-700 ml-1">kg CO₂</span>
            </h3>
            <p className="text-sm text-green-700 mt-1">Amazing work with your sustainable choices!</p>
          </div>
          <div className="bg-white p-3 rounded-full">
            <span className="material-icons text-green-600" style={{fontSize: '32px'}}>eco</span>
          </div>
        </div>
        
        <p className="text-sm font-medium text-green-800 mb-2">You've saved the equivalent of:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3 flex flex-col items-center text-center">
            <span className="material-icons text-blue-600 mb-1" style={{fontSize: '24px'}}>directions_car</span>
            <div className="text-sm font-semibold">{carKilometers} km</div>
            <div className="text-xs text-green-600">of car journeys</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 flex flex-col items-center text-center">
            <span className="material-icons text-green-600 mb-1" style={{fontSize: '24px'}}>forest</span>
            <div className="text-sm font-semibold">{treeEquivalent} trees</div>
            <div className="text-xs text-green-600">absorbing CO₂ annually</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 flex flex-col items-center text-center">
            <span className="material-icons text-purple-600 mb-1" style={{fontSize: '24px'}}>celebration</span>
            <div className="text-sm font-semibold">{balloonsEquivalent} balloons</div>
            <div className="text-xs text-green-600">of CO₂ prevented</div>
          </div>
        </div>
      </div>
      
      {/* Main cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Transport Breakdown Card - Improved for small screens */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-gray-500 text-sm font-medium">Transport Breakdown</p>
              <h3 className="text-3xl font-semibold text-gray-800 mt-1">
                3 <span className="text-lg font-normal text-gray-500">commutes</span>
              </h3>
            </div>
            <IconBadge icon="directions_transit" color="primary" bgColor="green-50" />
          </div>
          
          {/* Transport method list - only showing methods with days > 0 */}
          <div className="space-y-2.5">
            {/* Only showing relevant commute methods */}
            <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
              <div className="flex items-center">
                <span className="material-icons text-amber-500 mr-2" style={{fontSize: '18px'}}>directions_car</span>
                <span className="text-sm">Carpool</span>
              </div>
              <span className="text-sm font-medium">1 day</span>
            </div>
            
            <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
              <div className="flex items-center">
                <span className="material-icons text-indigo-500 mr-2" style={{fontSize: '18px'}}>home</span>
                <span className="text-sm">Remote</span>
              </div>
              <span className="text-sm font-medium">2 days</span>
            </div>
            
            {/* Empty state if needed */}
            {false && (
              <div className="flex items-center justify-center py-4 text-gray-400 text-sm">
                No commutes logged yet this week
              </div>
            )}
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
              <span className="text-gray-500">Next badge at 500 pts</span>
              <span className="font-medium">{Math.min(Math.round((userStats.points || 0) / 5), 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div 
                className="bg-accent h-1.5 rounded-full progress-bar" 
                style={{ width: `${Math.min(Math.round((userStats.points || 0) / 5), 100)}%` }}
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
            <StreakDisplay userId={userId} />
          </div>
        </div>
      </div>
      

    </section>
  );
};

export default ImpactStats;
