import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import WeeklyCommuteFormSimple from "@/components/commute/weekly-commute-form-simple";
import { useAuth } from "@/contexts/auth-context";
import { commuteTypeOptions } from "@/lib/constants";

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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeeklyCommuteFormSimple userId={userId} onSuccess={handleSuccess} />
          
          {submitted && (
            <Card className="mt-6 bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center text-green-600 mb-2">
                  <span className="material-icons mr-2">check_circle</span>
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
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Commute Types & Benefits</h2>
              
              <div className="space-y-4">
                {commuteTypeOptions.map((option) => (
                  <div key={option.value} className="flex items-start p-3 rounded-lg border border-gray-100">
                    <div className="p-2 rounded-lg bg-gray-100 mr-3">
                      <span className="material-icons text-gray-700">{option.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-medium">{option.label}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Eco-friendly commute option
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 flex items-center">
                  <span className="material-icons text-sm mr-1">info</span>
                  Tip
                </h3>
                <p className="text-sm text-blue-800 mt-1">
                  You can edit your commute entries for the current week until Sunday at midnight.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LogCommute;
