import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Check } from "lucide-react";
import CommuteForm from "@/components/commute/CommuteForm";
import CommuteBenefitsCard from "@/components/commute/commute-benefits-card";
import { useAuth } from "@/contexts/auth-context";

const LogCommute = () => {
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();
  const userId = user?.id || 0;
  
  const { data: currentCommutes, isLoading } = useQuery({
    queryKey: [`/api/commutes/current?userId=${userId}`],
    staleTime: 60000, // 1 minute
  });

  const handleSuccess = () => {
    setSubmitted(true);
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">Log Weekly Commutes</h1>
      
      {/* Warning banner if user profile is incomplete */}
      {user && (!user.home_address || !user.work_address || !user.commute_distance_km) && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="material-icons text-orange-500">warning</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">Profile Setup Required</h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>Please complete your profile settings to accurately track CO₂ savings:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {!user.home_address && <li>Home postcode is missing</li>}
                  {!user.work_address && <li>Work postcode is missing</li>}
                  {!user.commute_distance_km && <li>Commute distance is not set</li>}
                </ul>
                <div className="mt-2">
                  <Link to="/profile#settings" className="font-medium text-orange-800 hover:text-orange-600 underline">
                    Go to Profile Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CommuteForm 
            userId={userId} 
            onSuccess={handleSuccess}
            isProfileComplete={!!(user && user.home_address && user.work_address && user.commute_distance_km)}
          />
          
          {submitted && (
            <Card className="mt-6 bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center text-green-600 mb-2">
                  <Check className="mr-2 h-5 w-5" />
                  <span className="font-semibold">Commutes Logged Successfully!</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Thank you for logging your sustainable commutes. You're making a positive impact on the environment!
                </p>
                <Link href="/">
                  <button className="text-primary hover:text-primary-dark font-medium">
                    Return to Dashboard
                  </button>
                </Link>
              </CardContent>
            </Card>
          )}
          
          {/* Points Card is now below the main form */}
          <div className="mt-6">
            <CommuteBenefitsCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogCommute;
