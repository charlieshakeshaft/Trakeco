import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

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
              src="https://pixabay.com/get/ge15f1fd497978b7e1597e519e647bb2ec685ba064f5be0e0a1f8d7c0e9a2c6e71cd7458f59b39a76d60f7c2efe2efe866cb2a551d7678b5e5c97178e5a20e77c_1280.jpg"
              alt="Group of cyclists commuting on a bike lane"
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
                src="https://pixabay.com/get/gb65d2ebce1af42dfe65b0ee69d037acb57d762dbe84c26f00344db1302bbaa3bbc8837c0cde1f1c01ee64ee09741798424ff6d99e4be7ea9968a505bda090dab_1280.jpg"
                alt="Public transportation bus"
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
