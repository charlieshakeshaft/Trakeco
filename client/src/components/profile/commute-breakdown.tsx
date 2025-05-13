import { useCommuteBreakdown } from "@/hooks/use-commute";

interface CommuteBreakdownProps {
  userId: number;
}

interface CommuteBreakdownItem {
  type: string;
  days: number;
  percentage: number;
}

interface CommuteBreakdownData {
  breakdown: CommuteBreakdownItem[];
  totalDays: number;
}

const commuteIcons: Record<string, string> = {
  cycle: "directions_bike",
  walk: "directions_walk",
  public_transport: "train",
  carpool: "people",
  electric_vehicle: "electric_car",
  gas_vehicle: "directions_car",
  remote_work: "home"
};

const commuteLabels: Record<string, string> = {
  cycle: "Cycling",
  walk: "Walking",
  public_transport: "Public Transit",
  carpool: "Carpooling",
  electric_vehicle: "Electric Vehicle",
  gas_vehicle: "Gas Vehicle",
  remote_work: "Remote Work"
};

const commuteColors: Record<string, string> = {
  cycle: "primary",
  walk: "green-600",
  public_transport: "secondary",
  carpool: "blue-500",
  electric_vehicle: "teal-500",
  gas_vehicle: "gray-600",
  remote_work: "accent"
};

// Function to get ordinal suffix (1st, 2nd, 3rd, etc.)
const getOrdinal = (n: number): string => {
  if (n === 1) return "Most frequent sustainable mode";
  if (n === 2) return "Second most frequent";
  if (n === 3) return "Third most frequent";
  return `${n}th most frequent`;
};

const CommuteBreakdown = ({ userId }: CommuteBreakdownProps) => {
  const { data, isLoading } = useCommuteBreakdown(userId);
  
  const breakdownInfo: CommuteBreakdownData = data ? data as CommuteBreakdownData : {
    breakdown: [],
    totalDays: 0
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!breakdownInfo.breakdown || breakdownInfo.breakdown.length === 0) {
    return (
      <div className="py-6 text-center bg-gray-50 rounded-lg">
        <span className="material-icons text-gray-400 text-3xl mb-2">directions_car</span>
        <p className="text-gray-600 mb-1">No commute data yet</p>
        <p className="text-gray-500 text-sm">Start logging your commutes to see your breakdown</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {breakdownInfo.breakdown && breakdownInfo.breakdown.slice(0, 3).map((item: CommuteBreakdownItem, index: number) => {
        const colorClass = commuteColors[item.type] || "gray-600";
        
        return (
          <div className="flex items-center" key={item.type}>
            <div className={`w-10 h-10 rounded-full bg-${colorClass}/10 flex items-center justify-center text-${colorClass} mr-3`}>
              <span className="material-icons">{commuteIcons[item.type] || "help"}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">{commuteLabels[item.type] || item.type}</h3>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{getOrdinal(index + 1)}</span>
                <span>{item.days} days logged</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div 
                  className={`bg-${colorClass} h-1.5 rounded-full`} 
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}
      
      {breakdownInfo.totalDays === 0 && (
        <div className="text-center py-2 mt-4 bg-blue-50 rounded-lg text-sm text-blue-700">
          You haven't logged any commutes yet. Start logging to see your impact!
        </div>
      )}
    </div>
  );
};

export default CommuteBreakdown;