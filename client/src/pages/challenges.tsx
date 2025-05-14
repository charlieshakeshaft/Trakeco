import { useState, useEffect } from "react";
import { useAllChallenges, useUserChallenges } from "@/hooks/use-challenges";
import { Challenge } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChallengeCard from "@/components/challenges/challenge-card";
import { useAuth } from "@/contexts/auth-context";
import { useLocation, Link } from "wouter";

const Challenges = () => {
  const [activeTab, setActiveTab] = useState("active");
  const { user } = useAuth();
  const userId = user?.id || 0;
  const [location] = useLocation();
  
  // Read the tab parameter from the URL query string
  useEffect(() => {
    // Extract tab parameter from the URL if it exists
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    
    // Set the active tab if a valid tab parameter is provided
    if (tabParam && ['active', 'available', 'completed'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);
  
  const { data: allChallenges, isLoading: isLoadingAll } = useAllChallenges(userId);
  const { data: userChallenges, isLoading: isLoadingUser } = useUserChallenges(userId);
  
  const isLoading = isLoadingAll || isLoadingUser;
  
  // Helper to find if user is participating in a challenge
  const findParticipant = (challengeId: number) => {
    if (!userChallenges) return undefined;
    const userChallenge = userChallenges.find(uc => uc.challenge.id === challengeId);
    return userChallenge?.participant;
  };
  
  // Filter challenges that user is not participating in
  const availableChallenges = allChallenges?.filter(challenge => {
    return !userChallenges?.some(uc => uc.challenge.id === challenge.id);
  }) || [];
  
  // Get active user challenges
  const activeChallenges = userChallenges?.filter(uc => !uc.participant.completed) || [];
  
  // Get completed user challenges
  const completedChallenges = userChallenges?.filter(uc => uc.participant.completed) || [];
  
  // Helper function to switch tabs and update URL
  const switchToTab = (tab: string) => {
    setActiveTab(tab);
    // Update the URL to include the tab parameter
    window.history.replaceState(null, '', `/challenges?tab=${tab}`);
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">Challenges</h1>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={switchToTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active Challenges</TabsTrigger>
          <TabsTrigger value="available">Available Challenges</TabsTrigger>
          <TabsTrigger value="completed">Completed Challenges</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="h-48 bg-gray-200"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeChallenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeChallenges.map(userChallenge => (
                <ChallengeCard 
                  key={userChallenge.challenge.id}
                  challenge={userChallenge.challenge}
                  participant={userChallenge.participant}
                  userId={userId}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <span className="material-icons text-gray-400">emoji_events</span>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Active Challenges</h3>
                <p className="text-gray-500 mb-6 text-center max-w-lg">
                  You're not participating in any challenges yet. Join a challenge to earn bonus points and compete with your colleagues!
                </p>
                <button 
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                  onClick={() => switchToTab("available")}
                >
                  Browse Available Challenges
                </button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="available">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="h-48 bg-gray-200"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : availableChallenges.length > 0 ? (
            <>
              {user?.role === 'admin' && user?.company_id && (
                <div className="flex justify-end mb-4">
                  <Link to="/company?tab=challenges">
                    <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark">
                      <span className="material-icons text-sm mr-1">add_circle</span>
                      Manage Company Challenges
                    </button>
                  </Link>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableChallenges.map(challenge => (
                  <ChallengeCard 
                    key={challenge.id}
                    challenge={challenge}
                    userId={userId}
                  />
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <span className="material-icons text-gray-400">search</span>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Available Challenges</h3>
                <p className="text-gray-500 mb-6 text-center max-w-lg">
                  You've joined all available challenges! Check back later for new challenges from your administrators.
                </p>
                {user?.role === 'admin' && user?.company_id && (
                  <Link to="/company?tab=challenges">
                    <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark">
                      <span className="material-icons text-sm mr-1">add_circle</span>
                      Manage Company Challenges
                    </button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="h-48 bg-gray-200"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : completedChallenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedChallenges.map(userChallenge => (
                <ChallengeCard 
                  key={userChallenge.challenge.id}
                  challenge={userChallenge.challenge}
                  participant={userChallenge.participant}
                  userId={userId}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <span className="material-icons text-gray-400">emoji_events</span>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Completed Challenges</h3>
                <p className="text-gray-500 mb-6 text-center max-w-lg">
                  You haven't completed any challenges yet. Join a challenge and log your sustainable commutes to make progress!
                </p>
                <button 
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                  onClick={() => switchToTab("available")}
                >
                  Browse Available Challenges
                </button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Challenges;
