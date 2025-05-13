import { useState } from "react";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Define interfaces for the profile data
interface Company {
  name: string;
}

interface ProfileData {
  company?: Company;
  created_at?: string | Date;
  points_total?: number;
}

interface LocationSettings {
  home_address: string;
  home_latitude: string;
  home_longitude: string;
  work_address: string;
  work_latitude: string;
  work_longitude: string;
  commute_distance_km: number;
}

const Profile = () => {
  const { user, logout, setCurrentUser } = useAuth();
  const { data: profile, isLoading } = useUserProfile(user?.id || 0);
  const profileData: ProfileData = profile as ProfileData || {};
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // State for location settings
  const [locationSettings, setLocationSettings] = useState<LocationSettings>({
    home_address: user?.home_address || "",
    home_latitude: user?.home_latitude || "",
    home_longitude: user?.home_longitude || "",
    work_address: user?.work_address || "",
    work_latitude: user?.work_latitude || "",
    work_longitude: user?.work_longitude || "",
    commute_distance_km: user?.commute_distance_km || 0
  });
  
  // Handle location form input changes
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocationSettings(prev => ({
      ...prev,
      [name]: name === 'commute_distance_km' ? Number(value) : value
    }));
  };
  
  // Mutation for updating user's location settings
  const updateLocationMutation = useMutation({
    mutationFn: async (data: LocationSettings) => {
      return await apiRequest(`/api/user/update-profile?userId=${user?.id}`, data, "PATCH");
    },
    onSuccess: (data) => {
      toast({
        title: "Location settings updated",
        description: "Your commute location settings have been saved successfully.",
      });
      
      // Update the user in the auth context
      if (user) {
        setCurrentUser({
          ...user,
          ...locationSettings
        });
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/user/profile?userId=${user?.id}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update location settings",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Save location settings
  const saveLocationSettings = () => {
    updateLocationMutation.mutate(locationSettings);
  };
  
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
                  {user?.name ? user.name.charAt(0).toUpperCase() : 
                   user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                </div>
                <h2 className="text-xl font-semibold text-gray-800 truncate max-w-[90%] text-center mx-auto">{user?.name || user?.username || "User"}</h2>
                <p className="text-gray-500 mb-4 truncate max-w-[90%] text-center mx-auto">{user?.email || "No email"}</p>
                
                <div className="w-full p-4 rounded-lg bg-blue-50 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Company</span>
                    <span className="text-sm text-primary font-medium truncate ml-2 max-w-[150px]">
                      {profileData.company?.name || "No company"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Status</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary text-white">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Since</span>
                    <span className="text-sm text-gray-600">
                      {profileData.created_at 
                        ? new Date(String(profileData.created_at)).toLocaleDateString() 
                        : new Date().toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Points</span>
                    <span className="text-sm font-semibold text-primary">
                      {profileData.points_total !== undefined
                        ? String(profileData.points_total) : "0"} pts
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
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Commute Locations</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Home Address
                      </label>
                      <div className="flex flex-col space-y-4">
                        <input 
                          type="text" 
                          name="home_address"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Enter your home address"
                          value={locationSettings.home_address}
                          onChange={handleLocationChange}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Latitude
                            </label>
                            <input 
                              type="text" 
                              name="home_latitude"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="Latitude"
                              value={locationSettings.home_latitude}
                              onChange={handleLocationChange}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Longitude
                            </label>
                            <input 
                              type="text" 
                              name="home_longitude"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="Longitude"
                              value={locationSettings.home_longitude}
                              onChange={handleLocationChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Work Address
                      </label>
                      <div className="flex flex-col space-y-4">
                        <input 
                          type="text" 
                          name="work_address"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Enter your work address"
                          value={locationSettings.work_address}
                          onChange={handleLocationChange}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Latitude
                            </label>
                            <input 
                              type="text" 
                              name="work_latitude"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="Latitude"
                              value={locationSettings.work_latitude}
                              onChange={handleLocationChange}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Longitude
                            </label>
                            <input 
                              type="text" 
                              name="work_longitude"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="Longitude"
                              value={locationSettings.work_longitude}
                              onChange={handleLocationChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Commute Distance (km)
                      </label>
                      <input 
                        type="number" 
                        name="commute_distance_km"
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter commute distance in kilometers"
                        value={locationSettings.commute_distance_km}
                        onChange={handleLocationChange}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This will be used to calculate your environmental impact. 
                        If you don't know the exact distance, provide an estimate.
                      </p>
                    </div>
                    
                    <div className="pt-4 flex justify-end">
                      <Button 
                        className="bg-primary hover:bg-primary-dark"
                        onClick={saveLocationSettings}
                        disabled={updateLocationMutation.isPending}
                      >
                        {updateLocationMutation.isPending ? (
                          <>
                            <span className="mr-2">Saving...</span>
                            <span className="animate-spin">⟳</span>
                          </>
                        ) : (
                          "Save Location Settings"
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
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
                      <Button className="bg-primary hover:bg-primary-dark">
                        Save Account Settings
                      </Button>
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
