import { useUserProfile } from "@/hooks/use-leaderboard";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import StatsSummary from "@/components/profile/stats-summary";
import RedemptionHistory from "@/components/profile/redemption-history";
import CommuteBreakdown from "@/components/profile/commute-breakdown";
import { DEMO_USER_ID } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";

const Profile = () => {
  const { user, logout } = useAuth();
  const { data: profile, isLoading } = useUserProfile(user?.id || 0);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const handleLogout = async () => {
    try {
      // Use the auth context logout function
      await logout();
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      
      // Use setLocation instead of direct window.location manipulation
      setLocation('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setLocation('/login');
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 w-full bg-gray-200 rounded"></div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div
                  className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold mb-4"
                >
                  {(profile?.name || profile?.username || "U").charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{profile?.name || profile?.username}</h2>
                <p className="text-gray-500 mb-4">{profile?.email}</p>
                
                <div className="w-full p-4 rounded-lg bg-blue-50 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Company</span>
                    <span className="text-sm text-primary font-medium">
                      {profile?.company?.name || "No company"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Status</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary text-white">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Member Since</span>
                    <span className="text-sm text-gray-600">
                      {profile?.created_at 
                        ? new Date(profile.created_at).toLocaleDateString() 
                        : new Date().toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Points</span>
                    <span className="text-sm font-semibold text-primary">
                      {profile?.points_total || 0} pts
                    </span>
                  </div>
                </div>
                
                <Button 
                  variant="destructive" 
                  className="w-full mt-4"
                  onClick={handleLogout}
                >
                  <span className="material-icons mr-2 text-sm">logout</span>
                  Log Out
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="impact">
            <TabsList className="mb-6">
              <TabsTrigger value="impact">Your Impact</TabsTrigger>
              <TabsTrigger value="history">Redemption History</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="impact">
              <StatsSummary userId={user?.id || 0} />
              
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Commute Breakdown</h2>
                  
                  <CommuteBreakdown userId={user?.id || 0} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <RedemptionHistory userId={user?.id || 0} />
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Notifications
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Weekly summary</span>
                          <div className="relative inline-block w-10 mr-2 align-middle select-none">
                            <input type="checkbox" id="notify-weekly" defaultChecked className="sr-only" />
                            <div className="block h-6 bg-gray-300 rounded-full w-10"></div>
                            <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">New challenges</span>
                          <div className="relative inline-block w-10 mr-2 align-middle select-none">
                            <input type="checkbox" id="notify-challenges" defaultChecked className="sr-only" />
                            <div className="block h-6 bg-gray-300 rounded-full w-10"></div>
                            <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Streak reminders</span>
                          <div className="relative inline-block w-10 mr-2 align-middle select-none">
                            <input type="checkbox" id="notify-streaks" defaultChecked className="sr-only" />
                            <div className="block h-6 bg-gray-300 rounded-full w-10"></div>
                            <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Privacy Settings
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Show my name on leaderboard</span>
                          <div className="relative inline-block w-10 mr-2 align-middle select-none">
                            <input type="checkbox" id="privacy-leaderboard" defaultChecked className="sr-only" />
                            <div className="block h-6 bg-gray-300 rounded-full w-10"></div>
                            <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Share achievements with team</span>
                          <div className="relative inline-block w-10 mr-2 align-middle select-none">
                            <input type="checkbox" id="privacy-achievements" defaultChecked className="sr-only" />
                            <div className="block h-6 bg-gray-300 rounded-full w-10"></div>
                            <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 flex justify-end">
                      <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
                        Save Settings
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
