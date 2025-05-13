import { useQuery } from "@tanstack/react-query";
import { CommuteType } from "@/lib/types";

interface StreakDisplayProps {
  days?: number;
  userId?: number;
}

// Mapping commute types to icons
const commuteIcons: Record<string, {icon: string, color: string}> = {
  'cycle': { icon: "directions_bike", color: "text-blue-500" },
  'walk': { icon: "directions_walk", color: "text-green-500" },
  'public_transport': { icon: "directions_bus", color: "text-amber-500" },
  'carpool': { icon: "people", color: "text-indigo-500" },
  'electric_vehicle': { icon: "electric_car", color: "text-teal-500" },
  'remote_work': { icon: "computer", color: "text-purple-500" },
  'bus': { icon: "directions_bus", color: "text-amber-500" },
  'train': { icon: "train", color: "text-red-500" },
  'gas_vehicle': { icon: "directions_car", color: "text-gray-500" }
};

// Map day keys to display texts
const dayMapping = {
  monday: { label: "M", index: 0 },
  tuesday: { label: "T", index: 1 },
  wednesday: { label: "W", index: 2 },
  thursday: { label: "T", index: 3 },
  friday: { label: "F", index: 4 },
  saturday: { label: "S", index: 5 },
  sunday: { label: "S", index: 6 }
};

// Order days for display
const orderedDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const weekDisplay = ["M", "T", "W", "T", "F", "S", "S"];
const workWeekdaysDisplay = weekDisplay.slice(0, 5); // Just M-F

const StreakDisplay = ({ userId }: StreakDisplayProps) => {
  // Fetch this week's commute data
  const { data: commuteLogs, isLoading } = useQuery({
    queryKey: [`/api/commutes/current?userId=${userId}`],
    staleTime: 60000, // 1 minute
    enabled: !!userId,
  });

  // If no userId is provided, show the old simplified view
  if (!userId) {
    return (
      <div className="flex">
        {workWeekdaysDisplay.map((day, index) => (
          <div key={day + index} className="flex-1 flex flex-col items-center">
            <div className="text-xs mb-1 text-gray-500">{day}</div>
            <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center">
              <span className="material-icons text-sm">directions_bike</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex animate-pulse">
        {workWeekdaysDisplay.map((day, index) => (
          <div key={day + index} className="flex-1 flex flex-col items-center">
            <div className="text-xs mb-1 text-gray-300">{day}</div>
            <div className="w-6 h-6 rounded-full bg-gray-200"></div>
          </div>
        ))}
      </div>
    );
  }

  // Create an object to store commute type by day
  const commuteByDay: Record<string, { commute: string, forWork: boolean, forHome: boolean }> = {};
  
  if (commuteLogs && Array.isArray(commuteLogs) && commuteLogs.length > 0) {
    // Process all logs for each day (not just the first log)
    commuteLogs.forEach(log => {
      // Process each day in this log
      orderedDays.forEach(day => {
        const isDayTracked = log[day]; // Boolean indicating if this day was tracked
        if (isDayTracked) {
          // Check for to_work and to_home commute types
          const toWorkCommute = log[`${day}_to_work`];
          const toHomeCommute = log[`${day}_to_home`];
          
          // Only set the day if it hasn't been set yet or update as needed
          if (!commuteByDay[day]) {
            commuteByDay[day] = {
              commute: log.commute_type as string, // Default to the main commute type
              forWork: !!toWorkCommute,
              forHome: !!toHomeCommute
            };
          } else if (log.commute_type === 'electric_vehicle' || 
                    log.commute_type === 'remote_work' ||
                    (commuteByDay[day].commute === 'gas_vehicle' && log.commute_type !== 'gas_vehicle')) {
            // Override with more sustainable commute types
            commuteByDay[day].commute = log.commute_type as string;
          }
          
          // If specific commute types are set, use those instead
          if (toWorkCommute && typeof toWorkCommute === 'string') {
            commuteByDay[day].commute = toWorkCommute;
          }
        }
      });
    });
  }

  // Only show work week (M-F)
  const displayDays = orderedDays.slice(0, 5);
  
  return (
    <div className="flex justify-between">
      {displayDays.map((dayName) => {
        const dayInfo = commuteByDay[dayName];
        const dayLabel = dayMapping[dayName as keyof typeof dayMapping]?.label || dayName[0].toUpperCase();
        
        // Determine icon and styling based on commute data
        let iconName = "directions_bike";
        let iconColor = "text-gray-400";
        let bgColor = "bg-gray-200";
        let tooltipText = "No commute logged";
        
        if (dayInfo) {
          const commuteIconInfo = commuteIcons[dayInfo.commute] || { icon: "directions_bike", color: "text-blue-500" };
          iconName = commuteIconInfo.icon;
          iconColor = commuteIconInfo.color;
          bgColor = "bg-white";
          
          // Create tooltip text
          const tripTypes = [];
          if (dayInfo.forWork) tripTypes.push("to work");
          if (dayInfo.forHome) tripTypes.push("to home");
          
          tooltipText = `${dayInfo.commute.replace('_', ' ')} ${tripTypes.join(' & ')}`;
        }
        
        return (
          <div key={dayName} className="flex flex-col items-center group relative">
            <div className="text-xs mb-1 text-gray-500">{dayLabel}</div>
            <div className={`w-8 h-8 rounded-full ${bgColor} border border-gray-300 flex items-center justify-center`}>
              <span className={`material-icons text-sm ${iconColor}`}>{iconName}</span>
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              {tooltipText}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StreakDisplay;
