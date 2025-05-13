import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

// Function to determine appropriate image based on challenge type
function getChallengeImage(challenge?: any): string {
  if (!challenge) {
    return "https://images.pexels.com/photos/4347936/pexels-photo-4347936.jpeg"; // Default image
  }
  
  // Maps commute type to appropriate images
  const commuteImages: Record<string, string> = {
    'cycle': "https://images.pexels.com/photos/5700269/pexels-photo-5700269.jpeg", // Cycling image
    'walk': "https://images.pexels.com/photos/7194591/pexels-photo-7194591.jpeg", // Walking image
    'public_transport': "https://images.pexels.com/photos/2031755/pexels-photo-2031755.jpeg", // Public transport image
    'carpool': "https://images.pexels.com/photos/175696/pexels-photo-175696.jpeg", // Carpool image
    'electric_vehicle': "https://images.pexels.com/photos/6238050/pexels-photo-6238050.jpeg", // Electric vehicle image
    'remote_work': "https://images.pexels.com/photos/5711267/pexels-photo-5711267.jpeg" // Remote work image
  };
  
  // Select image based on challenge's commute type
  if (challenge.commute_type && commuteImages[challenge.commute_type]) {
    return commuteImages[challenge.commute_type];
  } 
  // Fallback to keyword-based selection if no commute type specified
  else if (challenge.title) {
    const title = challenge.title.toLowerCase();
    if (title.includes('cycle') || title.includes('bike')) {
      return commuteImages['cycle'];
    } else if (title.includes('walk')) {
      return commuteImages['walk'];
    } else if (title.includes('transit') || title.includes('bus') || title.includes('train')) {
      return commuteImages['public_transport'];
    } else if (title.includes('carpool') || title.includes('shared')) {
      return commuteImages['carpool'];
    } else if (title.includes('electric') || title.includes('ev')) {
      return commuteImages['electric_vehicle'];
    } else if (title.includes('remote') || title.includes('home')) {
      return commuteImages['remote_work'];
    }
  }
  
  return "https://images.pexels.com/photos/4347936/pexels-photo-4347936.jpeg"; // Default image
}

interface ChallengesSectionProps {
  userId: number;
}

interface UserChallenge {
  challenge: {
    id: number;
    title: string;
    description: string;
    end_date: string;
    points_reward: number;
    goal_type: string;
    goal_value: number;
  };
  participant: {
    progress: number;
    completed: boolean;
  };
}

const ChallengesSection = ({ userId }: ChallengesSectionProps) => {
  const { data: challenges, isLoading } = useQuery({
    queryKey: [`/api/user/challenges?userId=${userId}`],
    staleTime: 60000, // 1 minute
  });

  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Active Challenges</h2>
          <Link to="/challenges" className="text-primary hover:text-primary-dark text-sm font-medium">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 animate-pulse">
              <div className="h-60"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Get active challenges
  const activeUserChallenges: UserChallenge[] = Array.isArray(challenges) 
    ? challenges.slice(0, 2) 
    : [];

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Active Challenges</h2>
        <Link to="/challenges" className="text-primary hover:text-primary-dark text-sm font-medium">
          View All
        </Link>
      </div>

      {activeUserChallenges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Challenge 1 */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 card-hover transition-all duration-200">
            <img
              src={getChallengeImage(activeUserChallenges[0]?.challenge)}
              alt={activeUserChallenges[0]?.challenge.title || "Active challenge"}
              className="w-full h-32 object-cover"
            />
            <div className="p-5">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-gray-800">{activeUserChallenges[0]?.challenge.title || "Bike to Work Week"}</h3>
                <span className="text-xs font-medium bg-secondary/10 text-secondary px-2 py-1 rounded">
                  +{activeUserChallenges[0]?.challenge.points_reward || 50} pts
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1 mb-3">
                {activeUserChallenges[0]?.challenge.description || "Cycle at least 3 days this week"}
              </p>
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium">
                    {activeUserChallenges[0]?.participant.progress || 0}/
                    {activeUserChallenges[0]?.challenge.goal_value || 3} days
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${activeUserChallenges[0]?.participant.completed ? "bg-success" : "bg-secondary"}`}
                    style={{
                      width: `${
                        Math.min(
                          (activeUserChallenges[0]?.participant.progress / activeUserChallenges[0]?.challenge.goal_value) * 100 || 0,
                          100
                        )
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-gray-500">
                  Ends in {formatDistanceToNow(new Date(activeUserChallenges[0]?.challenge.end_date || Date.now() + 86400000 * 2))}
                </span>
                {activeUserChallenges[0]?.participant.completed ? (
                  <span className="text-sm font-medium text-success flex items-center">
                    <span className="material-icons text-sm mr-1">check_circle</span>
                    Completed!
                  </span>
                ) : (
                  <span className="text-sm font-medium text-gray-600 flex items-center">
                    <span className="material-icons text-sm mr-1">schedule</span>
                    In progress
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Challenge 2 - show if available */}
          {activeUserChallenges.length > 1 && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 card-hover transition-all duration-200">
              <img
                src={getChallengeImage(activeUserChallenges[1]?.challenge)}
                alt={activeUserChallenges[1]?.challenge.title || "Active challenge"}
                className="w-full h-32 object-cover"
              />
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-800">{activeUserChallenges[1]?.challenge.title || "Green Commute Month"}</h3>
                  <span className="text-xs font-medium bg-accent/10 text-accent-dark px-2 py-1 rounded">
                    +{activeUserChallenges[1]?.challenge.points_reward || 100} pts
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1 mb-3">
                  {activeUserChallenges[1]?.challenge.description || "Use sustainable transportation 15 days this month"}
                </p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium">
                      {activeUserChallenges[1]?.participant.progress || 0}/
                      {activeUserChallenges[1]?.challenge.goal_value || 15} days
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${activeUserChallenges[1]?.participant.completed ? "bg-success" : "bg-secondary"}`}
                      style={{
                        width: `${
                          Math.min(
                            (activeUserChallenges[1]?.participant.progress / activeUserChallenges[1]?.challenge.goal_value) * 100 || 0,
                            100
                          )
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-gray-500">
                    Ends in {formatDistanceToNow(new Date(activeUserChallenges[1]?.challenge.end_date || Date.now() + 86400000 * 12))}
                  </span>
                  {activeUserChallenges[1]?.participant.completed ? (
                    <span className="text-sm font-medium text-success flex items-center">
                      <span className="material-icons text-sm mr-1">check_circle</span>
                      Completed!
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-gray-600 flex items-center">
                      <span className="material-icons text-sm mr-1">schedule</span>
                      In progress
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-center">
          <div className="text-gray-500 mb-4">You haven't joined any challenges yet.</div>
          <Link to="/challenges">
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
              Browse Challenges
            </button>
          </Link>
        </div>
      )}
    </section>
  );
};

export default ChallengesSection;
