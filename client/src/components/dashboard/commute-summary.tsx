import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import CommuteModeCard from "@/components/ui/commute-mode-card";
import { CommuteType } from "@/lib/types";

interface CommuteSummaryProps {
  userId: number;
}

interface CommuteLogSummary {
  commute_type: CommuteType;
  days_logged: number;
  distance_km: number;
}

const CommuteSummary = ({ userId }: CommuteSummaryProps) => {
  const { data: commuteLogs, isLoading } = useQuery({
    queryKey: [`/api/commutes/current?userId=${userId}`],
    staleTime: 60000, // 1 minute
  });
  
  console.log("Dashboard commute logs:", commuteLogs);

  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">This Week's Commute</h2>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 animate-pulse">
          <div className="h-40"></div>
        </div>
      </section>
    );
  }
  
  // Group commute logs by type for display
  const commuteByType: Record<string, CommuteLogSummary> = {};
  
  if (commuteLogs && Array.isArray(commuteLogs)) {
    commuteLogs.forEach((log: any) => {
      commuteByType[log.commute_type] = {
        commute_type: log.commute_type,
        days_logged: log.days_logged,
        distance_km: log.distance_km
      };
    });
  }
  
  const commuteTypes = Object.values(commuteByType);

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">This Week's Commute</h2>
        <Link to="/log-commute" className="text-primary hover:text-primary-dark text-sm font-medium flex items-center">
          <span className="material-icons text-sm mr-1">edit</span>
          Edit Log
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <div className="flex flex-wrap gap-3">
          {commuteTypes.length > 0 ? (
            commuteTypes.map((commute) => (
              <CommuteModeCard
                key={commute.commute_type}
                type={commute.commute_type}
                days={commute.days_logged}
                distance={commute.distance_km}
              />
            ))
          ) : (
            <div className="w-full text-center text-gray-500 py-6">
              No commute data logged for this week yet.
            </div>
          )}
        </div>
        <div className="mt-4 text-center">
          <Link to="/log-commute">
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
              Log Today's Commute
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CommuteSummary;
