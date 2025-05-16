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
      
      {/* Single Carbon Savings Card - Simplified */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl shadow-sm p-5 border border-green-200 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-green-800 text-sm font-medium uppercase tracking-wide">Your Carbon Savings</p>
            <h3 className="text-4xl font-bold text-green-900 mt-1 flex items-baseline">
              {co2SavedKg} <span className="text-xl font-normal text-green-700 ml-1">kg CO₂</span>
            </h3>
            <p className="text-sm text-green-700 mt-1">through your sustainable commuting choices</p>
          </div>
          <div className="bg-white p-3 rounded-full">
            <span className="material-icons text-green-600" style={{fontSize: '32px'}}>eco</span>
          </div>
        </div>
        
        <p className="text-sm font-medium text-green-800 mb-2">This is equivalent to:</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg p-3 flex flex-col items-center text-center">
            <span className="material-icons text-blue-600 mb-1" style={{fontSize: '24px'}}>directions_car</span>
            <div className="text-sm font-semibold">{carKilometers} km</div>
            <div className="text-xs text-gray-600">not driven by car</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 flex flex-col items-center text-center">
            <span className="material-icons text-green-600 mb-1" style={{fontSize: '24px'}}>forest</span>
            <div className="text-sm font-semibold">{treeEquivalent} trees</div>
            <div className="text-xs text-gray-600">absorbing CO₂ for a year</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 flex flex-col items-center text-center">
            <span className="material-icons text-purple-600 mb-1" style={{fontSize: '24px'}}>celebration</span>
            <div className="text-sm font-semibold">{balloonsEquivalent} balloons</div>
            <div className="text-xs text-gray-600">of CO₂ not released</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 flex flex-col items-center text-center">
            <span className="material-icons text-amber-600 mb-1" style={{fontSize: '24px'}}>directions_bus</span>
            <div className="text-sm font-semibold">{Math.round(carKilometers * 1.3)} km</div>
            <div className="text-xs text-gray-600">by public transport</div>
          </div>
        </div>
      </div>
      
      {/* Main cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CO2 Breakdown Card - Alternative to the large CO2 banner */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Transport Breakdown</p>
              <h3 className="text-3xl font-semibold text-gray-800 mt-1">
                {co2SavedKg} <span className="text-lg font-normal text-gray-500">kg</span>
              </h3>
            </div>
            <IconBadge icon="directions_bus" color="primary" bgColor="green-50" />
          </div>
          <div className="mt-3 text-xs text-gray-600">
            CO₂ avoided per transport type
          </div>
          <div className="mt-1 flex justify-between items-center text-xs">
            <div className="flex items-center">
              <span className="material-icons text-green-600 mr-1" style={{fontSize: '16px'}}>directions_walk</span>
              <span>Walking: 100%</span>
            </div>
            <div className="flex items-center">
              <span className="material-icons text-blue-500 mr-1" style={{fontSize: '16px'}}>directions_bike</span>
              <span>Cycling: 100%</span>
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
      
      {/* Extended Carbon Impact Visualization - New Section */}
      {co2SavedKg > 0 && (
        <div className="mt-6 bg-green-50 rounded-xl p-5 border border-green-100">
          <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
            <span className="material-icons text-green-600 mr-2">eco</span>
            Your Carbon Reduction Visualized
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Trees Visualization */}
            <div className="bg-white rounded-lg p-4 flex flex-col items-center text-center">
              <div className="flex mb-2">
                {Array.from({ length: Math.min(treeEquivalent, 5) }).map((_, i) => (
                  <span key={i} className="material-icons text-green-600" style={{fontSize: '28px'}}>park</span>
                ))}
                {treeEquivalent > 5 && <span className="text-sm font-medium ml-1 self-end">+{treeEquivalent - 5} more</span>}
              </div>
              <p className="text-sm font-medium text-gray-800">{treeEquivalent} Trees</p>
              <p className="text-xs text-gray-600 mt-1">Your CO₂ savings equal the yearly absorption of {treeEquivalent} trees</p>
            </div>
            
            {/* Balloons Visualization */}
            <div className="bg-white rounded-lg p-4 flex flex-col items-center text-center">
              <div className="flex mb-2">
                {Array.from({ length: Math.min(5, Math.ceil(balloonsEquivalent/100)) }).map((_, i) => (
                  <span key={i} className="material-icons text-blue-500" style={{fontSize: '28px'}}>celebration</span>
                ))}
                {balloonsEquivalent > 500 && <span className="text-sm font-medium ml-1 self-end">+more</span>}
              </div>
              <p className="text-sm font-medium text-gray-800">{balloonsEquivalent.toLocaleString()} Balloons</p>
              <p className="text-xs text-gray-600 mt-1">Your CO₂ savings would fill {balloonsEquivalent.toLocaleString()} party balloons</p>
            </div>
            
            {/* Car Distance Visualization */}
            <div className="bg-white rounded-lg p-4 flex flex-col items-center text-center">
              <div className="flex mb-2">
                <span className="material-icons text-blue-600" style={{fontSize: '28px'}}>directions_car</span>
                <span className="material-icons text-slate-300" style={{fontSize: '28px'}}>arrow_right_alt</span>
                <span className="material-icons text-slate-300" style={{fontSize: '28px'}}>arrow_right_alt</span>
                <span className="material-icons text-green-600" style={{fontSize: '28px'}}>location_on</span>
              </div>
              <p className="text-sm font-medium text-gray-800">{carKilometers} Kilometers</p>
              <p className="text-xs text-gray-600 mt-1">You've saved emissions equal to driving {carKilometers} km in an average car</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ImpactStats;
